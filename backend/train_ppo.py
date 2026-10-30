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
from app.rl.algorithms.ppo import PPOAgent

def train_ppo(
    total_episodes: int = 100,
    steps_per_episode: int = 80,
    update_interval: int = 160,
    checkpoint_path: str = "models/checkpoints/ppo_warehouse_v1.pt"
):
    print("=" * 60, flush=True)
    print("[START] PPO (Proximal Policy Optimization) Training", flush=True)
    print(f"Target Episodes: {total_episodes} | Steps/Episode: {steps_per_episode}", flush=True)
    print("=" * 60, flush=True)

    # Single-agent environment setup
    env = WarehouseGridEnv(width=20, height=20, num_robots=1, max_steps=steps_per_episode)
    agent = PPOAgent(obs_dim=env.obs_dim, action_dim=env.NUM_ACTIONS, lr_actor=3e-4, lr_critic=1e-3)

    os.makedirs(os.path.dirname(checkpoint_path), exist_ok=True)

    total_steps = 0
    start_time = time.time()
    best_reward = -float("inf")

    history = []

    for ep in range(1, total_episodes + 1):
        obs_list, _ = env.reset()
        obs = obs_list[0]
        ep_reward = 0.0
        ep_collisions = 0
        ep_reached = 0

        for step in range(steps_per_episode):
            action, log_prob, val = agent.select_action(obs)
            next_obs_list, _, rewards, done, info = env.step([action])
            next_obs = next_obs_list[0]
            reward = rewards[0]

            ep_reward += reward
            ep_collisions += info.get("collision_count", 0)
            ep_reached += info.get("reached_count", 0)

            agent.store_transition(obs, action, log_prob, reward, val, done)
            obs = next_obs
            total_steps += 1

            if total_steps % update_interval == 0:
                agent.train_step(ppo_epochs=4, batch_size=64)

            if done:
                break

        # Flush any remaining transitions
        if len(agent.buffer.states) >= 32:
            agent.train_step(ppo_epochs=4, batch_size=32)

        history.append({
            "episode": ep,
            "reward": round(ep_reward, 2),
            "reached": ep_reached,
            "collisions": ep_collisions
        })

        if ep_reward > best_reward:
            best_reward = ep_reward
            agent.save_checkpoint(checkpoint_path, extra_info={
                "algorithm": "PPO",
                "episodes": ep,
                "reward": best_reward,
                "date": time.strftime("%Y-%m-%d %H:%M:%S")
            })

        if ep % 20 == 0 or ep == 1 or ep == total_episodes:
            elapsed = time.time() - start_time
            recent_rewards = [h["reward"] for h in history[-20:]]
            avg_rew = sum(recent_rewards) / len(recent_rewards)
            print(f"[Episode {ep:03d}/{total_episodes}] Avg Reward (last 20): {avg_rew:6.2f} | Latest: {ep_reward:6.2f} | Goals: {ep_reached} | Collisions: {ep_collisions} | Time: {elapsed:.1f}s", flush=True)

    print("\n[COMPLETE] PPO Training Finished", flush=True)
    print(f"Best Reward: {best_reward:.2f}", flush=True)
    print(f"Checkpoint saved to: {checkpoint_path}", flush=True)
    return history

if __name__ == "__main__":
    train_ppo()
