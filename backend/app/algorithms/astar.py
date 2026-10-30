import heapq
from typing import List, Tuple, Set

def heuristic(a: Tuple[int, int], b: Tuple[int, int]) -> int:
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

def astar_search(
    start: Tuple[int, int], 
    goal: Tuple[int, int], 
    obstacles: Set[Tuple[int, int]], 
    width: int, 
    height: int
) -> List[Tuple[int, int]]:
    """A* Pathfinding on a discrete 2D grid."""
    if start == goal:
        return [start]

    frontier = []
    heapq.heappush(frontier, (0, start))
    came_from = {start: None}
    cost_so_far = {start: 0}

    while frontier:
        _, current = heapq.heappop(frontier)

        if current == goal:
            break

        # 4-directional moves (up, down, left, right)
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            next_node = (current[0] + dx, current[1] + dy)

            # Check bounds
            if not (0 <= next_node[0] < width and 0 <= next_node[1] < height):
                continue

            # Check obstacles
            if next_node in obstacles and next_node != goal:
                continue

            new_cost = cost_so_far[current] + 1
            if next_node not in cost_so_far or new_cost < cost_so_far[next_node]:
                cost_so_far[next_node] = new_cost
                priority = new_cost + heuristic(next_node, goal)
                heapq.heappush(frontier, (priority, next_node))
                came_from[next_node] = current

    # Reconstruct path
    if goal not in came_from:
        return []

    curr = goal
    path = []
    while curr != start:
        path.append(curr)
        curr = came_from[curr]
    path.reverse()
    return path
