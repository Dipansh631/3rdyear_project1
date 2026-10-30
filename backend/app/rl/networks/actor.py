import torch
import torch.nn as nn
from torch.distributions import Categorical
from typing import Tuple

class ActorNetwork(nn.Module):
    """
    Decentralized Actor Policy Network for Warehouse Robots.
    Can be shared across homogeneous fleet AMRs or evaluated individually.
    """
    def __init__(self, obs_dim: int = 18, action_dim: int = 5, hidden_dim: int = 128):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(obs_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, action_dim)
        )

    def forward(self, obs: torch.Tensor) -> torch.Tensor:
        """Returns action logits."""
        return self.net(obs)

    def get_action(
        self, obs: torch.Tensor, deterministic: bool = False
    ) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        """
        Samples an action given observation.
        Returns: (action, log_prob, entropy)
        """
        logits = self.forward(obs)
        dist = Categorical(logits=logits)
        if deterministic:
            action = torch.argmax(logits, dim=-1)
        else:
            action = dist.sample()
        log_prob = dist.log_prob(action)
        return action, log_prob, dist.entropy()

    def evaluate(
        self, obs: torch.Tensor, action: torch.Tensor
    ) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        Evaluates log_prob and entropy for a given batch of states and taken actions.
        """
        logits = self.forward(obs)
        dist = Categorical(logits=logits)
        log_prob = dist.log_prob(action)
        return log_prob, dist.entropy()
