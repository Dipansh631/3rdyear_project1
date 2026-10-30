# LogiMind AMR: Project Description & Quick Overview

> **Note**: For the full, detailed PPT presentation guide, mathematical formulations, page-by-page breakdowns, and viva questions, please refer to:  
> 📄 [**complete_project_presentation_and_technical_guide.md**](./complete_project_presentation_and_technical_guide.md)

---

## 1. Project Summary
**LogiMind** is an autonomous multi-agent warehouse logistics simulation and control system powered by **Multi-Agent Reinforcement Learning (MAPPO)** under the **Centralized Training with Decentralized Execution (CTDE)** paradigm.

### Key Capabilities:
- **Autonomous Swarm Navigation**: Multi-AMR path planning without deadlocks or collisions in a 20×20 discrete fulfillment environment.
- **Dynamic Disturbance Handling**: Instant rerouting around corridor bottlenecks, physical spills, and AMR hardware stalls.
- **Automated Task Handover**: If a robot encounters a motor or sensor fault, its assigned order is dynamically reassigned to the nearest available peer AMR.
- **Full-Stack Digital Twin**: High-performance React 19 + TypeScript frontend synchronized with a Python FastAPI backend over a 60Hz full-duplex WebSocket stream.
- **Empirical Benchmarking**: Side-by-side evaluation against Single-Agent PPO, Multi-Robot A*, and heuristic baselines across throughput, delay, and energy efficiency.

### Current Status:
- **Overall Completion**: **92% Complete**
- **Frontend & 2D Canvas**: **100%**
- **Backend & Simulation Physics**: **100%**
- **RL Models (MAPPO / PPO)**: **90%**
- **Checkpoints & Benchmark Suite**: **95%**
