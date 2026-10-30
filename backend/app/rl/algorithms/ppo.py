import os
import torch
import torch.nn as nn
import torch.optim as optim
from typing import List, Dict, Any, Optional

from app.rl.networks.actor import ActorNetwork
from app.rl.networks.critic import CriticNetwork

class PPORolloutBuffer:
    def __init__(self):
        self.states: List[torch.Tensor] = []
        self.actions: List[torch.Tensor] = []
        self.log_probs: List[torch.Tensor] = []
        self.rewards: List[float] = []
        self.values: List[torch.Tensor] = []
        self.dones: List[bool] = []

    def clear(self):
        self.states.clear()
        self.actions.clear()
        self.log_probs.clear()
        self.rewards.clear()
        self.values.clear()
        self.dones.clear()


class PPOAgent:
    """
    Proximal Policy Optimization (PPO) Agent.
    Standard Actor-Critic with Clipped Surrogate Objective and Generalized Advantage Estimation (GAE).
    """
    def __init__(
        self,
        obs_dim: int = 18,
        action_dim: int = 5,
        lr_actor: float = 3e-4,
        lr_critic: float = 1e-3,
        gamma: float = 0.99,
        gae_lambda: float = 0.95,
        clip_eps: float = 0.2,
        entropy_coef: float = 0.01,
        value_coef: float = 0.5,
        device: str = "cpu"
    ):
        self.device = torch.device(device)
        self.gamma = gamma
        self.gae_lambda = gae_lambda
        self.clip_eps = clip_eps
        self.entropy_coef = entropy_coef
        self.value_coef = value_coef

        self.actor = ActorNetwork(obs_dim, action_dim).to(self.device)
        self.critic = CriticNetwork(obs_dim).to(self.device)

        self.optimizer_actor = optim.Adam(self.actor.parameters(), lr=lr_actor)
        self.optimizer_critic = optim.Adam(self.critic.parameters(), lr=lr_critic)

        self.buffer = PPORolloutBuffer()

    def select_action(self, obs: List[float], deterministic: bool = False):
        obs_tensor = torch.tensor(obs, dtype=torch.float32).unsqueeze(0).to(self.device)
        with torch.no_grad():
            action, log_prob, _ = self.actor.get_action(obs_tensor, deterministic)
            val = self.critic(obs_tensor)
        return action.item(), log_prob.item(), val.squeeze().item()

    def store_transition(
        self,
        obs: List[float],
        action: int,
        log_prob: float,
        reward: float,
        value: float,
        done: bool
    ):
        self.buffer.states.append(torch.tensor(obs, dtype=torch.float32))
        self.buffer.actions.append(torch.tensor(action, dtype=torch.long))
        self.buffer.log_probs.append(torch.tensor(log_prob, dtype=torch.float32))
        self.buffer.rewards.append(reward)
        self.buffer.values.append(torch.tensor(value, dtype=torch.float32))
        self.buffer.dones.append(done)

    def compute_gae(self, last_val: float = 0.0):
        rewards = self.buffer.rewards
        values = [v.item() for v in self.buffer.values] + [last_val]
        dones = self.buffer.dones

        advantages = []
        gae = 0.0
        for step in reversed(range(len(rewards))):
            delta = rewards[step] + self.gamma * values[step + 1] * (1.0 - float(dones[step])) - values[step]
            gae = delta + self.gamma * self.gae_lambda * (1.0 - float(dones[step])) * gae
            advantages.insert(0, gae)

        returns = [adv + val for adv, val in zip(advantages, values[:-1])]
        return (
            torch.tensor(advantages, dtype=torch.float32).to(self.device),
            torch.tensor(returns, dtype=torch.float32).to(self.device)
        )

    def train_step(self, ppo_epochs: int = 4, batch_size: int = 64) -> Dict[str, float]:
        if len(self.buffer.states) == 0:
            return {"policy_loss": 0.0, "value_loss": 0.0, "entropy": 0.0}

        advantages, returns = self.compute_gae(last_val=0.0)
        # Normalize advantages
        if len(advantages) > 1:
            advantages = (advantages - advantages.mean()) / (advantages.std() + 1e-8)

        old_states = torch.stack(self.buffer.states).to(self.device)
        old_actions = torch.stack(self.buffer.actions).to(self.device)
        old_log_probs = torch.stack(self.buffer.log_probs).to(self.device)

        total_policy_loss = 0.0
        total_value_loss = 0.0
        total_entropy = 0.0
        num_updates = 0

        dataset_size = len(old_states)
        indices = torch.randperm(dataset_size)

        for _ in range(ppo_epochs):
            for start in range(0, dataset_size, batch_size):
                end = start + batch_size
                batch_idx = indices[start:end]

                b_states = old_states[batch_idx]
                b_actions = old_actions[batch_idx]
                b_old_log_probs = old_log_probs[batch_idx]
                b_adv = advantages[batch_idx]
                b_returns = returns[batch_idx]

                # Evaluate new log probs and entropy
                new_log_probs, entropy = self.actor.evaluate(b_states, b_actions)
                new_values = self.critic(b_states).squeeze(-1)

                # Ratio
                ratio = torch.exp(new_log_probs - b_old_log_probs)

                # Clipped surrogate objective
                surr1 = ratio * b_adv
                surr2 = torch.clamp(ratio, 1.0 - self.clip_eps, 1.0 + self.clip_eps) * b_adv
                policy_loss = -torch.min(surr1, surr2).mean()

                # Value loss
                value_loss = nn.functional.mse_loss(new_values, b_returns)

                # Total loss
                loss = policy_loss + self.value_coef * value_loss - self.entropy_coef * entropy.mean()

                # Optimization
                self.optimizer_actor.zero_grad()
                self.optimizer_critic.zero_grad()
                loss.backward()
                nn.utils.clip_grad_norm_(self.actor.parameters(), max_norm=0.5)
                nn.utils.clip_grad_norm_(self.critic.parameters(), max_norm=0.5)
                self.optimizer_actor.step()
                self.optimizer_critic.step()

                total_policy_loss += policy_loss.item()
                total_value_loss += value_loss.item()
                total_entropy += entropy.mean().item()
                num_updates += 1

        self.buffer.clear()

        return {
            "policy_loss": total_policy_loss / max(1, num_updates),
            "value_loss": total_value_loss / max(1, num_updates),
            "entropy": total_entropy / max(1, num_updates),
        }

    def save_checkpoint(self, filepath: str, extra_info: Optional[Dict[str, Any]] = None):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        torch.save({
            "actor_state_dict": self.actor.state_dict(),
            "critic_state_dict": self.critic.state_dict(),
            "optimizer_actor": self.optimizer_actor.state_dict(),
            "optimizer_critic": self.optimizer_critic.state_dict(),
            "extra_info": extra_info or {}
        }, filepath)

    def load_checkpoint(self, filepath: str):
        checkpoint = torch.load(filepath, map_location=self.device)
        self.actor.load_state_dict(checkpoint["actor_state_dict"])
        self.critic.load_state_dict(checkpoint["critic_state_dict"])
        return checkpoint.get("extra_info", {})
