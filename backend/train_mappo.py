import os
import sys
import time

# Ensure UTF-8 output on Windows
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.rl.environments.warehouse_env import WarehouseGridEnv
from app.rl.algorithms.mappo import MAPPOAgent

def train_mappo(
    total_episodes: int = 100,
    steps_per_episode: int = 80,
    num_robots: int = 3,
    update_interval: int = 160,
    checkpoint_path: str = "models/checkpoints/mappo_warehouse_v1.pt"
):
    print("=" * 65, flush=True)
    print("[START] MAPPO (Multi-Agent PPO with Centralized Critic) Training", flush=True)
    print(f"Robots: {num_robots} | Episodes: {total_episodes} | Steps/Episode: {steps_per_episode}", flush=True)
    print("=" * 65, flush=True)

    env = WarehouseGridEnv(width=20, height=20, num_robots=num_robots, max_steps=steps_per_episode)
    agent = MAPPOAgent(
        obs_dim=env.obs_dim,
        global_state_dim=env.global_state_dim,
        action_dim=env.NUM_ACTIONS,
        num_agents=num_robots,
        lr_actor=3e-4,
        lr_critic=1e-3
    )

    os.makedirs(os.path.dirname(checkpoint_path), exist_ok=True)

    total_steps = 0
    start_time = time.time()
    best_team_reward = -float("inf")

    history = []

    for ep in range(1, total_episodes + 1):
        observations, global_state = env.reset()
        ep_team_reward = 0.0
        ep_collisions = 0
        ep_reached = 0

        for step in range(steps_per_episode):
            actions, log_probs, val = agent.select_actions(observations, global_state)
            next_obs, next_global_state, rewards, done, info = env.step(actions)

            step_team_reward = sum(rewards)
            ep_team_reward += step_team_reward
            ep_collisions += info.get("collision_count", 0)
            ep_reached += info.get("reached_count", 0)

            agent.store_transition(
                observations=observations,
                global_state=global_state,
                actions=actions,
                log_probs=log_probs,
                rewards=rewards,
                value=val,
                done=done
            )

            observations = next_obs
            global_state = next_global_state
            total_steps += 1

            if total_steps % update_interval == 0:
                agent.train_step(ppo_epochs=4, batch_size=64)

            if done:
                break

        # Flush any remaining transitions
        if len(agent.buffer.global_states) >= 32:
            agent.train_step(ppo_epochs=4, batch_size=32)

        history.append({
            "episode": ep,
            "team_reward": round(ep_team_reward, 2),
            "reached": ep_reached,
            "collisions": ep_collisions
        })

        if ep_team_reward > best_team_reward:
            best_team_reward = ep_team_reward
            agent.save_checkpoint(checkpoint_path, extra_info={
                "algorithm": "MAPPO",
                "num_robots": num_robots,
                "episodes": ep,
                "team_reward": best_team_reward,
                "date": time.strftime("%Y-%m-%d %H:%M:%S")
            })

        if ep % 20 == 0 or ep == 1 or ep == total_episodes:
            elapsed = time.time() - start_time
            recent = [h["team_reward"] for h in history[-20:]]
            avg_rew = sum(recent) / len(recent)
            print(f"[Episode {ep:03d}/{total_episodes}] Avg Team Reward (last 20): {avg_rew:6.2f} | Latest: {ep_team_reward:6.2f} | Goals: {ep_reached} | Collisions: {ep_collisions} | Time: {elapsed:.1f}s", flush=True)

    print("\n[COMPLETE] MAPPO Training Finished", flush=True)
    print(f"Best Team Reward: {best_team_reward:.2f}", flush=True)
    print(f"Checkpoint saved to: {checkpoint_path}", flush=True)
    return history

if __name__ == "__main__":
    train_mappo()
