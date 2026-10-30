# LogiMind RL — Backend & AI Model

### Autonomous Warehouse & Robotics Fleet Optimization Engine

**Project Type:** Fully Software-Based AI/ML System  
**Backend:** Python, FastAPI  
**AI Framework:** PyTorch  
**RL Framework:** Gymnasium / PettingZoo  
**MARL Algorithm:** PPO / MAPPO  
**Communication:** REST API + WebSockets  
**Database:** PostgreSQL + SQLAlchemy  
**Cache / Real-Time State:** Redis (optional)

---

# 1. Backend Overview

The LogiMind RL backend is the central processing layer responsible for managing the virtual warehouse, robot fleet, orders, simulation environment, reinforcement learning models, and evaluation metrics.

It connects the frontend dashboard with the warehouse simulation and AI decision-making engine.

The backend has five primary responsibilities:

1. Manage the virtual warehouse and its state.
2. Manage robots, orders, and task allocation.
3. Execute simulation steps and dynamic events.
4. Load and execute trained RL/MARL policies.
5. Collect metrics and provide real-time updates.

### Backend Architecture

```text
                  REACT FRONTEND
                        |
                 REST API / WEBSOCKET
                        |
                        v
                 FASTAPI BACKEND
                        |
       +----------------+----------------+
       |                |                |
       v                v                v
  Order Manager    Robot Manager    Simulation Manager
       |                |                |
       +----------------+----------------+
                        |
                        v
                WAREHOUSE ENGINE
                        |
            +-----------+-----------+
            |                       |
            v                       v
       RL ENVIRONMENT          EVENT ENGINE
            |                       |
            +-----------+-----------+
                        |
                        v
                  MARL CONTROLLER
                        |
              +---------+---------+
              |         |         |
              v         v         v
             R1        R2        R3
                        |
                        v
                METRICS ENGINE
                        |
                        v
                 DATABASE / LOGS
```

---

# 2. Backend Technology Stack

| Component | Technology | Responsibility |
|---|---|---|
| Programming | Python | Main backend logic |
| API framework | FastAPI | Backend APIs |
| Validation | Pydantic | Request/response validation |
| ORM | SQLAlchemy | Database operations |
| Database | PostgreSQL | Persistent records |
| Cache | Redis | Optional live-state storage |
| AI framework | PyTorch | Neural networks |
| RL environment | Gymnasium | Single-agent environment interface |
| MARL environment | PettingZoo | Multi-agent environment interface |
| Training | PPO / MAPPO | Policy optimization |
| Communication | WebSocket | Live simulation updates |
| Testing | Pytest | Automated testing |
| Server | Uvicorn | ASGI application server |

**Important:** Gymnasium and PettingZoo are environment interfaces, while PPO/MAPPO are learning algorithms. They perform different roles.

---

# 3. Backend Folder Structure

```text
backend/
│
├── app/
│   │
│   ├── main.py
│   ├── config.py
│   │
│   ├── api/
│   │   ├── simulation.py
│   │   ├── robots.py
│   │   ├── orders.py
│   │   ├── tasks.py
│   │   ├── events.py
│   │   ├── training.py
│   │   ├── models.py
│   │   ├── evaluation.py
│   │   └── settings.py
│   │
│   ├── core/
│   │   ├── warehouse.py
│   │   ├── robot.py
│   │   ├── order.py
│   │   ├── task.py
│   │   ├── obstacle.py
│   │   └── station.py
│   │
│   ├── services/
│   │   ├── simulation_service.py
│   │   ├── robot_service.py
│   │   ├── order_service.py
│   │   ├── task_service.py
│   │   ├── event_service.py
│   │   ├── model_service.py
│   │   └── metrics_service.py
│   │
│   ├── simulation/
│   │   ├── engine.py
│   │   ├── state_manager.py
│   │   ├── collision.py
│   │   ├── deadlock.py
│   │   ├── path_planner.py
│   │   └── event_engine.py
│   │
│   ├── rl/
│   │   ├── environments/
│   │   │   ├── warehouse_env.py
│   │   │   └── multi_agent_env.py
│   │   │
│   │   ├── agents/
│   │   │   ├── shared_agent.py
│   │   │   └── agent_manager.py
│   │   │
│   │   ├── networks/
│   │   │   ├── actor.py
│   │   │   └── critic.py
│   │   │
│   │   ├── algorithms/
│   │   │   ├── ppo.py
│   │   │   └── mappo.py
│   │   │
│   │   ├── rewards/
│   │   │   └── reward_function.py
│   │   │
│   │   ├── training/
│   │   │   ├── trainer.py
│   │   │   └── callbacks.py
│   │   │
│   │   └── inference/
│   │       └── predictor.py
│   │
│   ├── algorithms/
│   │   ├── astar.py
│   │   └── task_allocator.py
│   │
│   ├── evaluation/
│   │   ├── metrics.py
│   │   ├── experiments.py
│   │   └── comparison.py
│   │
│   ├── database/
│   │   ├── connection.py
│   │   ├── models.py
│   │   └── repositories.py
│   │
│   └── websocket/
│       └── manager.py
│
├── models/
│   ├── checkpoints/
│   └── configurations/
│
├── experiments/
├── tests/
├── requirements.txt
└── README.md
```

---

# 4. Core Backend Modules

## 4.1 Warehouse Manager

**File:** `core/warehouse.py`

Responsible for creating and managing the virtual warehouse.

### Responsibilities

- Create warehouse grids.
- Configure warehouse dimensions.
- Place shelves and stations.
- Maintain accessible paths.
- Track occupied and unoccupied cells.
- Register robots.
- Manage obstacles.
- Reset warehouse state.

Example:

```python
class Warehouse:

    def __init__(self, width, height):
        self.width = width
        self.height = height
        self.robots = {}
        self.shelves = []
        self.obstacles = []
        self.stations = []

    def add_robot(self, robot):
        pass

    def add_obstacle(self, position):
        pass

    def get_state(self):
        pass

    def reset(self):
        pass
```

## 4.2 Robot Manager

**File:** `services/robot_service.py`

Manages all virtual robots.

Each robot should contain:

```text
robot_id
position
speed
battery
capacity
status
current_task
current_path
robot_type
```

### Robot statuses

- IDLE
- ACTIVE
- MOVING
- PICKING
- DELIVERING
- WAITING
- FAILED
- MAINTENANCE

### Responsibilities

- Add new robots.
- Remove robots.
- Update robot positions.
- Track battery and availability.
- Assign tasks.
- Simulate failures.
- Monitor performance.

## 4.3 Order Manager

**File:** `services/order_service.py`

Manages incoming warehouse orders.

Example order:

```json
{
  "order_id": "ORD-101",
  "product_id": "SKU-25",
  "pickup_location": [4, 7],
  "delivery_location": [15, 12],
  "priority": "HIGH",
  "status": "PENDING"
}
```

### Order lifecycle

```text
CREATED
   |
   v
PENDING
   |
   v
ASSIGNED
   |
   v
PICKING
   |
   v
DELIVERING
   |
   v
COMPLETED
```

## 4.4 Task Allocation Engine

**File:** `algorithms/task_allocator.py`

Converts orders into tasks and assigns them to robots.

Initial version:

- Nearest available robot.
- Lowest workload robot.
- Robot availability.
- Task priority.

Advanced version:

- Dynamic task reassignment.
- Failure recovery.
- Congestion-aware assignment.
- Workload balancing.

The initial allocator should be rule-based. RL-based task allocation can be investigated later if the core navigation and MARL system is stable.

## 4.5 Simulation Engine

**File:** `simulation/engine.py`

The simulation engine executes the warehouse environment.

### Main responsibilities

- Execute robot actions.
- Update robot positions.
- Detect collisions.
- Detect deadlocks.
- Update orders.
- Trigger dynamic events.
- Generate new observations.
- Calculate simulation metrics.

Main loop:

```text
Current State
     |
     v
MARL Controller
     |
     v
Robot Actions
     |
     v
Simulation Engine
     |
     v
Collision Detection
     |
     v
Update Warehouse
     |
     v
New State
     |
     v
Reward Calculation
```

## 4.6 Event Engine

**File:** `simulation/event_engine.py`

Creates dynamic warehouse conditions.

Supported events:

| Event | System response |
|---|---|
| Obstacle appears | Update traversable paths |
| Congestion | Detect traffic conflicts |
| Robot failure | Mark robot unavailable |
| Peak demand | Increase order arrivals |
| New robot | Register robot |
| Robot recovery | Restore robot availability |

---

# 5. API Architecture

FastAPI exposes the backend functionality to the frontend.

Base URL:

```text
http://localhost:8000
```

## 5.1 Simulation APIs

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/simulation/start` | Start simulation |
| POST | `/api/simulation/pause` | Pause simulation |
| POST | `/api/simulation/resume` | Resume simulation |
| POST | `/api/simulation/reset` | Reset simulation |
| GET | `/api/simulation/state` | Get current state |
| GET | `/api/simulation/status` | Get simulation status |

## 5.2 Robot APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/robots` | List robots |
| GET | `/api/robots/{robot_id}` | Get robot details |
| POST | `/api/robots` | Register robot |
| DELETE | `/api/robots/{robot_id}` | Remove robot |
| POST | `/api/robots/{robot_id}/failure` | Simulate failure |
| POST | `/api/robots/{robot_id}/recover` | Recover robot |

## 5.3 Order APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/orders` | List orders |
| POST | `/api/orders` | Create order |
| GET | `/api/orders/{order_id}` | Get order details |
| POST | `/api/orders/{order_id}/assign` | Assign task |
| POST | `/api/orders/{order_id}/cancel` | Cancel order |

## 5.4 Environment APIs

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/events/obstacle` | Add obstacle |
| DELETE | `/api/events/obstacle/{id}` | Remove obstacle |
| POST | `/api/events/congestion` | Trigger congestion |
| POST | `/api/events/peak-demand` | Trigger peak demand |
| GET | `/api/events` | Get event history |

## 5.5 Training APIs

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/training/start` | Start training |
| POST | `/api/training/stop` | Stop training |
| GET | `/api/training/status` | Training status |
| GET | `/api/training/metrics` | Training metrics |
| GET | `/api/models` | List model checkpoints |
| POST | `/api/models/{model_id}/load` | Load model |

## 5.6 Evaluation APIs

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/evaluation/run` | Start experiment |
| GET | `/api/evaluation/results` | Retrieve results |
| GET | `/api/evaluation/compare` | Compare algorithms |
| GET | `/api/evaluation/metrics` | Retrieve metrics |

The exact request and response schemas should be finalized as the modules are implemented.

---

# 6. WebSocket Architecture

WebSockets will provide real-time simulation updates.

Endpoint:

```text
/ws/simulation
```

### Data flow

```text
Simulation Engine
       |
       v
State Update
       |
       v
WebSocket Manager
       |
       v
React Dashboard
       |
       v
Update Warehouse Visualization
```

Example message:

```json
{
  "type": "robot_update",
  "robot_id": "R1",
  "position": [5, 8],
  "status": "MOVING",
  "battery": 85
}
```

Other update types:

- `simulation_update`
- `robot_update`
- `order_update`
- `task_update`
- `event_update`
- `metrics_update`
- `training_update`

The backend should send state updates at a controlled frequency rather than broadcasting every internal simulation operation.

---

# 7. AI / ML Model Architecture

The AI model is the intelligence layer of LogiMind RL.

It receives information about the warehouse and selects actions for individual robot agents.

### Main objective

Learn a policy that helps multiple robots complete warehouse tasks efficiently while reducing unnecessary travel, waiting, congestion, and conflicts.

## 7.1 Learning Architecture

```text
             WAREHOUSE STATE
                    |
                    v
             OBSERVATION BUILDER
                    |
                    v
             SHARED ACTOR POLICY
                    |
        +-----------+-----------+
        |           |           |
        v           v           v
      Robot 1     Robot 2     Robot 3
        |           |           |
        v           v           v
      Action      Action      Action
        +-----------+-----------+
                    |
                    v
             WAREHOUSE SIMULATOR
                    |
                    v
              NEW STATE + REWARD
                    |
                    v
             CENTRALIZED CRITIC
                    |
                    v
              POLICY OPTIMIZATION
                    |
                    v
               UPDATED POLICY
```

---

# 8. RL Environment Design

The warehouse will be represented as a computational environment.

The environment is responsible for receiving actions, updating the warehouse and returning observations and rewards.

## 8.1 State Space

The state describes the current warehouse situation.

Possible state features:

```text
Robot positions
Robot status
Robot battery
Robot type
Current tasks
Target locations
Nearby robots
Nearby obstacles
Warehouse occupancy
Congestion information
Pending orders
```

An example observation:

```python
observation = {
    "robot_position": (4, 5),
    "target_position": (12, 8),
    "battery": 85,
    "robot_status": "ACTIVE",
    "nearby_obstacles": [],
    "nearby_robots": [],
    "task_priority": 2
}
```

For cooperative MAPPO, the training process may additionally use a centralized representation of the global warehouse state.

The observation design must be consistent across agents that share a policy.

## 8.2 Action Space

Initial movement actions:

```text
0 = UP
1 = DOWN
2 = LEFT
3 = RIGHT
4 = WAIT
```

Task-related actions can be handled by the task manager initially.

Pickup and delivery actions can be added to the RL action space later if the project requires the policy to control the complete task lifecycle.

## 8.3 Reward Function

The reward function guides the agents toward desirable behavior.

| Event | Reward direction |
|---|---|
| Successful task completion | Positive |
| Reaching target | Positive |
| Efficient movement | Positive |
| Collision | Negative |
| Deadlock | Negative |
| Excessive waiting | Negative |
| Unnecessary travel | Negative |

Conceptual reward:

```text
Reward =
    Task Completion Reward
    + Movement Efficiency Reward
    - Collision Penalty
    - Deadlock Penalty
    - Excessive Waiting Penalty
```

The exact coefficients must be tuned experimentally.

Avoid using too many reward terms initially because poorly balanced rewards can make RL training unstable.

---

# 9. RL Algorithm Strategy

The development should progress from simple learning to multi-agent learning.

```text
Q-Learning
     |
     v
DQN
     |
     v
Policy Gradient
     |
     v
Actor-Critic
     |
     v
PPO
     |
     v
Multi-Agent PPO
     |
     v
MAPPO
```

This is a learning progression, not a requirement to implement every algorithm in the final product.

## 9.1 PPO

**Proximal Policy Optimization** is a policy-gradient algorithm that updates the policy while limiting excessively large policy changes.

It is a suitable starting point for the single-agent prototype.

## 9.2 MAPPO

**Multi-Agent Proximal Policy Optimization** extends PPO to multi-agent learning.

The intended architecture is:

- Multiple robot agents.
- Cooperative environment.
- Centralized critic during training.
- Decentralized actor execution.
- Shared actor parameters as the initial fleet design.

---

# 10. Shared Policy Architecture

LogiMind RL will initially investigate a shared policy instead of maintaining a separate neural network for every robot.

```text
                SHARED ACTOR
                     |
         +-----------+-----------+
         |           |           |
         v           v           v
        R1          R2          R3
         |           |           |
         v           v           v
      Decision    Decision    Decision
```

### Why use a shared policy?

- Reduces the number of independently trained models.
- Allows robots to reuse learned behavior.
- Simplifies adding new robots.
- Makes the initial fleet architecture easier to manage.

### New Robot Registration

```text
New Robot
    |
    v
Register Robot
    |
    v
Load Robot Characteristics
    |
    v
Apply Shared Policy
    |
    v
Assign Initial Task
    |
    v
Monitor Performance
```

A new robot can use the existing policy if its observation and action formats are compatible with the trained model.

However, successful performance is not guaranteed.

If the new robot behaves poorly, the system can:

1. Monitor its task completion and navigation.
2. Reassign unfinished tasks.
3. Use a safe fallback planner.
4. Mark the robot unavailable if necessary.
5. Collect experience for future retraining.

A larger fleet or a new robot type may require additional training and evaluation.

---

# 11. Model Training Pipeline

Training will happen inside the virtual warehouse environment.

### Training workflow

```text
Initialize Warehouse Environment
              |
              v
       Initialize Agents
              |
              v
         Reset Episode
              |
              v
       Collect Observations
              |
              v
         Select Actions
              |
              v
       Execute Simulation
              |
              v
       Calculate Rewards
              |
              v
       Store Experience
              |
              v
       Update Actor/Critic
              |
              v
       Evaluate Performance
              |
              v
       Save Checkpoint
              |
              v
        Next Episode
```

## 11.1 Training Configuration

Example configuration:

```yaml
algorithm: MAPPO

environment:
  warehouse_width: 20
  warehouse_height: 20
  number_of_robots: 3
  max_episode_steps: 500

training:
  total_episodes: 10000
  learning_rate: 0.0003
  gamma: 0.99
  clip_range: 0.2

model:
  shared_policy: true
  observation_dimension: configurable
  action_dimension: 5
```

These are illustrative starting values, not guaranteed optimal hyperparameters. Observation dimensions depend on the final environment design.

## 11.2 Training Metrics

Track:

- Episode reward.
- Episode length.
- Task completion rate.
- Average travel distance.
- Collision count.
- Waiting time.
- Actor loss.
- Critic loss.
- Policy entropy.

---

# 12. Model Inference Architecture

Training and inference should be separate operations.

**Training:** Updates the neural network parameters.

**Inference:** Uses a trained model to select robot actions without updating the model.

### Inference workflow

```text
Warehouse State
       |
       v
Observation Builder
       |
       v
Load Trained Policy
       |
       v
Policy Prediction
       |
       v
Robot Actions
       |
       v
Simulation Engine
```

Example:

```python
actions = model.predict(observations)

simulation.step(actions)
```

The actual inference implementation will depend on the chosen PPO/MAPPO library and model interface.

### Important

Do not retrain the model every time the dashboard starts a simulation.

The normal workflow should be:

1. Train the model separately.
2. Save the trained checkpoint.
3. Load the checkpoint for simulation.
4. Run inference.
5. Record performance.

---

# 13. Baseline Algorithms

LogiMind RL must be compared with conventional approaches.

## A* Pathfinding

Used for conventional shortest-path planning.

## Rule-Based Navigation

Uses predefined movement and conflict-handling rules.

## PPO

Used for the initial single-agent learning experiment.

## MAPPO

Used for cooperative multi-agent learning.

### Comparison

```text
             WAREHOUSE
                 |
       +---------+---------+
       |         |         |
       v         v         v
      A*     Rule-Based   MAPPO
       |         |         |
       +---------+---------+
                 |
                 v
             EVALUATION
```

PPO can also be included in single-agent or multi-agent experiments where the setup is comparable.

---

# 14. Evaluation Engine

**Directory:** `evaluation/`

The evaluation engine measures the performance of the algorithms.

### Main metrics

| Metric | Measurement |
|---|---|
| Task completion time | Time required to complete tasks |
| Travel distance | Total robot movement |
| Waiting time | Time spent waiting |
| Collision count | Detected robot conflicts |
| Deadlock count | Detected deadlock situations |
| Throughput | Completed orders per unit time |
| Robot utilization | Productive operating time / available operating time |

### Test scenarios

1. Normal demand.
2. Peak demand.
3. Dynamic obstacles.
4. Congestion.
5. Robot failure.
6. New robot introduction.

Run repeated experiments with controlled configurations and random seeds.

The final system should report measured results rather than assumed improvements.

---

# 15. Database Architecture

PostgreSQL will store persistent information.

### Suggested tables

| Table | Information |
|---|---|
| warehouses | Warehouse configurations |
| robots | Robot details and capabilities |
| orders | Incoming orders |
| tasks | Task assignments and status |
| simulations | Simulation runs |
| events | Dynamic events |
| model_checkpoints | Model metadata |
| training_runs | Training configurations |
| evaluation_runs | Experiment metadata |
| evaluation_metrics | Recorded metrics |

Large model weights should be stored as checkpoint files or in object storage, while PostgreSQL stores their paths and metadata.

Redis can optionally store live simulation state and frequently accessed data.

---

# 16. Model Checkpoint Management

Suggested structure:

```text
models/
│
├── checkpoints/
│   ├── ppo/
│   │   └── ppo_checkpoint.pt
│   │
│   └── mappo/
│       ├── mappo_v1.pt
│       └── mappo_v2.pt
│
├── configurations/
│   ├── ppo_config.yaml
│   └── mappo_config.yaml
│
└── metadata/
    └── model_registry.json
```

Each model should record:

- Model ID.
- Algorithm.
- Training date.
- Environment version.
- Number of training steps.
- Number of agents used.
- Configuration.
- Evaluation results.

Only validated checkpoints should be selected for normal inference.

---

# 17. Backend and Model Integration

The final connection between the backend and model should look like this:

```text
                 FASTAPI
                    |
        +-----------+-----------+
        |           |           |
        v           v           v
    Robot API   Order API   Simulation API
        |           |           |
        +-----------+-----------+
                    |
                    v
              SIMULATION ENGINE
                    |
                    v
              RL ENVIRONMENT
                    |
                    v
              MODEL SERVICE
                    |
                    v
              TRAINED POLICY
                    |
                    v
              ACTION PREDICTION
                    |
                    v
              ROBOT EXECUTION
                    |
                    v
             STATE / REWARD UPDATE
                    |
                    v
              METRICS SERVICE
                    |
                    v
              WEBSOCKET UPDATES
                    |
                    v
                FRONTEND
```

---

# 18. Development Roadmap

Build the backend and AI engine in the following order.

| Phase | Development | Expected output |
|---|---|---|
| 1 | Warehouse core | Working warehouse data model |
| 2 | Robot management | Multiple virtual robots |
| 3 | Order management | Orders and task queue |
| 4 | Movement engine | Valid robot movement |
| 5 | Collision handling | Conflict detection |
| 6 | A* baseline | Conventional navigation |
| 7 | Metrics | Baseline measurements |
| 8 | Gymnasium environment | Single-agent RL environment |
| 9 | Single-agent PPO | One robot learns |
| 10 | Multi-agent environment | Multiple agents interact |
| 11 | Shared policy | Common robot policy |
| 12 | MAPPO | Cooperative training |
| 13 | Dynamic events | Obstacles, congestion, failures |
| 14 | Fleet adaptation | Robot joining and task recovery |
| 15 | FastAPI | Backend endpoints |
| 16 | WebSockets | Live updates |
| 17 | Database | Persistent records |
| 18 | Evaluation | Algorithm comparisons |
| 19 | Integration | Frontend connected to backend |
| 20 | Testing and deployment | Complete software system |

---

# 19. Testing Strategy

## Unit Testing

Test:

- Robot movement.
- Warehouse boundaries.
- Collision detection.
- Order creation.
- Task assignment.
- A* pathfinding.
- Reward calculations.
- State generation.

## Integration Testing

Test:

- Order manager with simulation.
- Robot manager with warehouse.
- RL model with environment.
- FastAPI with simulation.
- WebSocket with frontend.

## AI Testing

Test:

- Environment reset.
- Valid observations.
- Valid actions.
- Reward calculation.
- Training stability.
- Model saving/loading.
- Policy inference.

## Scenario Testing

Test the complete system under:

- Normal warehouse operation.
- Peak demand.
- Congestion.
- Dynamic obstacles.
- Robot failures.
- New robot registration.

---

# 20. Installation and Setup

## Prerequisites

- Python 3.11 or a compatible version for the selected libraries.
- Git.
- PostgreSQL.
- Node.js for the frontend.
- NVIDIA CUDA is optional; CPU execution can be used for initial development.

## Create Environment

```bash
python -m venv venv
```

Activate on Windows:

```bash
venv\Scripts\activate
```

## Install Dependencies

```bash
pip install -r requirements.txt
```

## Run Backend

```bash
uvicorn app.main:app --reload
```

Backend:

```text
http://localhost:8000
```

API documentation:

```text
http://localhost:8000/docs
```

The exact dependencies and versions should be pinned after selecting the RL framework and validating compatibility.

---

# 21. Backend Development Principles

Follow these principles throughout development:

1. Keep simulation logic separate from API logic.
2. Keep model training separate from model inference.
3. Never hardcode experimental results.
4. Keep robot and order states consistent.
5. Validate all incoming API requests.
6. Save model checkpoints with metadata.
7. Use reproducible experiment configurations.
8. Test collision and deadlock handling independently.
9. Avoid blocking API requests with long-running training jobs.
10. Keep the frontend independent of internal ML implementation details.

---

# 22. Final Backend Deliverables

At completion, the backend and model should provide:

- Virtual warehouse management.
- Multi-robot management.
- Order and task management.
- Robot movement simulation.
- A* pathfinding.
- Collision and deadlock detection.
- Dynamic environment events.
- Single-agent RL environment.
- PPO training.
- Cooperative MARL environment.
- MAPPO experimentation.
- Shared-policy architecture.
- Model checkpoint management.
- Model inference service.
- New robot registration.
- Dynamic task reassignment.
- Performance monitoring.
- Evaluation framework.
- FastAPI REST APIs.
- WebSocket updates.
- PostgreSQL persistence.
- Automated testing.

---

# 23. Final Backend Architecture

```text
                     LOGIMIND RL
                          |
                     FASTAPI
                          |
        +-----------------+-----------------+
        |                 |                 |
        v                 v                 v
   ORDER MANAGER     ROBOT MANAGER    SIMULATION API
        |                 |                 |
        +-----------------+-----------------+
                          |
                          v
                   WAREHOUSE ENGINE
                          |
              +-----------+-----------+
              |                       |
              v                       v
        PATH PLANNER             EVENT ENGINE
           A*                 Obstacles / Failures
              |                       |
              +-----------+-----------+
                          |
                          v
                    RL ENVIRONMENT
                          |
                          v
                    MARL CONTROLLER
                          |
              +-----------+-----------+
              |           |           |
              v           v           v
           ROBOT 1     ROBOT 2     ROBOT 3
              |           |           |
              +-----------+-----------+
                          |
                          v
                    NEW STATE
                          |
                          v
                       REWARD
                          |
                          v
                   POLICY TRAINING
                          |
                          v
                  MODEL CHECKPOINTS
                          |
                          v
                   INFERENCE ENGINE
                          |
                          v
                   METRICS ENGINE
                          |
                          v
                    POSTGRESQL
                          |
                          v
                   WEBSOCKET SERVER
                          |
                          v
                    REACT FRONTEND
```

---

# 24. Project Success Criteria

The backend and model will be considered functionally complete when:

- A virtual warehouse can be created and reset.
- Multiple robots can navigate the warehouse.
- Orders can be generated and completed.
- The A* baseline operates correctly.
- The RL environment follows a valid observation/action/reward loop.
- A single-agent policy can be trained and evaluated.
- Multiple agents can operate using the selected MARL architecture.
- Dynamic events can be introduced during simulation.
- Robot failures trigger appropriate task recovery.
- New robots can be registered and evaluated.
- Trained models can be saved and loaded.
- The frontend can receive real-time simulation updates.
- MARL can be compared against conventional baselines using measured results.

**Final objective:**

Build a complete software-based AI orchestration engine that learns and evaluates coordinated warehouse robot decision-making in a changing virtual environment.

**LogiMind RL = Warehouse Simulation + Robot Orchestration + Reinforcement Learning + Multi-Agent Coordination + Experimental Evaluation.**
Do not build all backend modules at once. Start with these three files:
1. warehouse.py — create the virtual warehouse.
2. robot.py — create and move virtual robots.
3. engine.py — execute simulation steps and update the warehouse.
Once these work, connect the environment to Gymnasium and begin training the first robot.

That is the foundation on which the entire backend and MARL model will depend.