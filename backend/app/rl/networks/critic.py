import torch
import torch.nn as nn

class CriticNetwork(nn.Module):
    """
    Decentralized Critic Network for single-agent / independent PPO.
    Estimates state value V(s) based on local agent observation.
    """
    def __init__(self, obs_dim: int = 18, hidden_dim: int = 128):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(obs_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, 1)
        )

    def forward(self, obs: torch.Tensor) -> torch.Tensor:
        return self.net(obs)


class CentralizedCriticNetwork(nn.Module):
    """
    Centralized Critic Network for MAPPO (Multi-Agent PPO).
    Takes the joint global state of all agents and environment to compute
    a coordinated value estimate V(s_global) during training (CTDE).
    """
    def __init__(self, global_state_dim: int = 58, hidden_dim: int = 256):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(global_state_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, 1)
        )

    def forward(self, global_state: torch.Tensor) -> torch.Tensor:
        return self.net(global_state)
