import random
import math
from typing import Dict, List, Tuple, Set, Optional

class WarehouseGridEnv:
    """
    Multi-Agent Warehouse Discrete Grid Environment.
    Supports both Single-Agent PPO and Multi-Agent Decentralized Execution / 
    Centralized Training (MAPPO).
    """

    ACTIONS = {
        0: (-1, 0),  # UP
        1: (1, 0),   # DOWN
        2: (0, -1),  # LEFT
        3: (0, 1),   # RIGHT
        4: (0, 0),   # WAIT
    }
    ACTION_NAMES = ["UP", "DOWN", "LEFT", "RIGHT", "WAIT"]
    NUM_ACTIONS = 5

    def __init__(
        self,
        width: int = 20,
        height: int = 20,
        num_robots: int = 3,
        max_steps: int = 200,
        enable_obstacles: bool = True
    ):
        self.width = width
        self.height = height
        self.num_robots = num_robots
        self.max_steps = max_steps
        self.current_step = 0

        # Fixed warehouse layout elements (shelves, stations)
        self.shelves: Set[Tuple[int, int]] = set()
        self.stations: List[Tuple[int, int]] = [
            (1, 2), (18, 8), (17, 16), (10, 18)
        ]
        self.obstacles: Set[Tuple[int, int]] = set()
        self._build_static_shelves()

        # Dynamic agent states
        self.agent_positions: List[Tuple[int, int]] = []
        self.agent_targets: List[Tuple[int, int]] = []
        self.agent_batteries: List[float] = []
        self.agent_loads: List[int] = []

        self.obs_dim = 18
        self.global_state_dim = self.obs_dim * self.num_robots + 4

    def _build_static_shelves(self):
        self.shelves.clear()
        for r in [3, 7, 11, 15]:
            for c in range(3, 17, 2):
                self.shelves.add((r, c))

    def reset(self) -> Tuple[List[List[float]], List[float]]:
        self.current_step = 0
        self.obstacles.clear()
        self.obstacles.add((11, 7))
        self.obstacles.add((15, 13))

        self.agent_positions = []
        self.agent_targets = []
        self.agent_batteries = []
        self.agent_loads = []

        occupied = set(self.shelves) | set(self.obstacles)

        # Place robots randomly on free walkable tiles
        for _ in range(self.num_robots):
            pos = self._sample_free_pos(occupied)
            self.agent_positions.append(pos)
            occupied.add(pos)

            # Assign random target station or shelf
            target = self._sample_free_pos(self.shelves | self.obstacles | {pos})
            self.agent_targets.append(target)
            self.agent_batteries.append(1.0)
            self.agent_loads.append(random.randint(0, 3))

        observations = [self._get_agent_obs(i) for i in range(self.num_robots)]
        global_state = self._get_global_state()
        return observations, global_state

    def _sample_free_pos(self, blocked: Set[Tuple[int, int]]) -> Tuple[int, int]:
        while True:
            r = random.randint(1, self.height - 2)
            c = random.randint(1, self.width - 2)
            if (r, c) not in blocked:
                return (r, c)

    def _get_agent_obs(self, agent_idx: int) -> List[float]:
        r, c = self.agent_positions[agent_idx]
        tr, tc = self.agent_targets[agent_idx]

        # Normalized coordinates [0, 1]
        norm_r = r / max(1, self.height - 1)
        norm_c = c / max(1, self.width - 1)
        norm_tr = tr / max(1, self.height - 1)
        norm_tc = tc / max(1, self.width - 1)

        # Relative direction to target [-1, 1]
        dr = (tr - r) / max(1, self.height)
        dc = (tc - c) / max(1, self.width)
        dist = math.hypot(tr - r, tc - c) / math.hypot(self.height, self.width)

        # 8-direction lidar proximity raycasts (N, NE, E, SE, S, SW, W, NW)
        lidar_dirs = [
            (-1, 0), (-1, 1), (0, 1), (1, 1),
            (1, 0), (1, -1), (0, -1), (-1, -1)
        ]
        lidar_readings = []
        occupied_by_others = {
            self.agent_positions[j]
            for j in range(self.num_robots)
            if j != agent_idx
        }
        all_blocks = self.shelves | self.obstacles | occupied_by_others

        for d_r, d_c in lidar_dirs:
            dist_to_block = 0
            for step in range(1, 6):  # Raycast up to 5 cells
                nr = r + d_r * step
                nc = c + d_c * step
                if nr < 0 or nr >= self.height or nc < 0 or nc >= self.width:
                    dist_to_block = step
                    break
                if (nr, nc) in all_blocks:
                    dist_to_block = step
                    break
            lidar_readings.append(dist_to_block / 5.0)

        battery = self.agent_batteries[agent_idx]
        load = self.agent_loads[agent_idx] / 5.0

        obs = [
            norm_r, norm_c,
            norm_tr, norm_tc,
            dr, dc,
            dist,
            *lidar_readings,
            battery,
            load,
            float(self.current_step) / float(self.max_steps)
        ]
        return obs

    def _get_global_state(self) -> List[float]:
        flat_obs = []
        for i in range(self.num_robots):
            flat_obs.extend(self._get_agent_obs(i))
        
        # Add summary stats: ratio of targets reached, collision count, current step
        flat_obs.extend([
            float(self.current_step) / float(self.max_steps),
            float(len(self.obstacles)),
            float(self.num_robots),
            1.0
        ])
        return flat_obs

    def step(
        self, actions: List[int]
    ) -> Tuple[List[List[float]], List[float], List[float], bool, Dict]:
        self.current_step += 1
        rewards = [0.0] * self.num_robots
        reached_count = 0
        collision_count = 0

        new_positions = []

        # 1. Propose new positions
        for i, act in enumerate(actions):
            dr, dc = self.ACTIONS.get(act, (0, 0))
            cr, cc = self.agent_positions[i]
            nr, nc = cr + dr, cc + dc

            prev_dist = math.hypot(
                self.agent_targets[i][0] - cr,
                self.agent_targets[i][1] - cc
            )

            # Wall or perimeter collision
            if nr < 0 or nr >= self.height or nc < 0 or nc >= self.width:
                rewards[i] -= 3.0
                collision_count += 1
                new_positions.append((cr, cc))
                continue

            # Shelf or static obstacle collision
            if (nr, nc) in self.shelves or (nr, nc) in self.obstacles:
                rewards[i] -= 4.0
                collision_count += 1
                new_positions.append((cr, cc))
                continue

            # Valid candidate move
            new_positions.append((nr, nc))

            # Small step penalty to encourage speed
            rewards[i] -= 0.05

            # Distance-based shaping reward
            new_dist = math.hypot(
                self.agent_targets[i][0] - nr,
                self.agent_targets[i][1] - nc
            )
            rewards[i] += (prev_dist - new_dist) * 1.2

            # Consume small battery
            self.agent_batteries[i] = max(0.0, self.agent_batteries[i] - 0.002)

        # 2. Check robot-to-robot collisions (same cell or edge swap)
        final_positions = list(new_positions)
        for i in range(self.num_robots):
            for j in range(i + 1, self.num_robots):
                # Vertex collision: both moved to same cell
                if new_positions[i] == new_positions[j]:
                    rewards[i] -= 5.0
                    rewards[j] -= 5.0
                    collision_count += 1
                    # Revert both
                    final_positions[i] = self.agent_positions[i]
                    final_positions[j] = self.agent_positions[j]
                # Edge collision: swapped cells
                elif (
                    new_positions[i] == self.agent_positions[j] and 
                    new_positions[j] == self.agent_positions[i]
                ):
                    rewards[i] -= 4.0
                    rewards[j] -= 4.0
                    collision_count += 1
                    final_positions[i] = self.agent_positions[i]
                    final_positions[j] = self.agent_positions[j]

        self.agent_positions = final_positions

        # 3. Check goal arrivals
        for i in range(self.num_robots):
            if self.agent_positions[i] == self.agent_targets[i]:
                rewards[i] += 25.0
                reached_count += 1
                # Sample a new target for continuous operation
                self.agent_targets[i] = self._sample_free_pos(
                    self.shelves | self.obstacles | {self.agent_positions[i]}
                )

        # Cooperative team reward bonus for multi-agent coordination
        if reached_count > 0:
            for i in range(self.num_robots):
                rewards[i] += reached_count * 2.0

        done = self.current_step >= self.max_steps

        observations = [self._get_agent_obs(i) for i in range(self.num_robots)]
        global_state = self._get_global_state()

        info = {
            "reached_count": reached_count,
            "collision_count": collision_count,
            "step": self.current_step
        }

        return observations, global_state, rewards, done, info
