# LogiMind RL — Webpage-Wise Backend Instructions & Implementation Plan

## 1. Project Overview

**Project Name:** LogiMind RL  
**Purpose:** Autonomous Warehouse & Robotics Fleet Optimization Engine  
**Development Environment:** Google Antigravity

LogiMind RL is a software-based warehouse simulation and optimization platform. It uses virtual Autonomous Mobile Robots (AMRs), pathfinding algorithms, and Reinforcement Learning to coordinate warehouse operations.

The frontend provides a visual control panel for managing the warehouse, robots, orders, simulations, training, and evaluation.

The backend is responsible for:
- Managing warehouse state.
- Simulating robot movement.
- Assigning tasks to robots.
- Detecting collisions and deadlocks.
- Managing warehouse events.
- Running pathfinding and RL algorithms.
- Tracking performance metrics.
- Sending real-time updates to the frontend.

**Important:** This is a software-only project. Do not introduce physical robot hardware, ROS, sensors, or hardware dependencies.

---

# 2. Technology Stack

## Backend

| Technology | Responsibility |
|---|---|
| Python | Main programming language |
| FastAPI | REST API framework |
| Pydantic | Request and response validation |
| SQLAlchemy | Database ORM |
| PostgreSQL | Persistent application data |
| Gymnasium | RL environment |
| PyTorch | Deep learning and RL models |
| Stable-Baselines3 | PPO implementation |
| PettingZoo | Multi-agent environment interface |
| WebSockets | Real-time frontend updates |
| Uvicorn | Backend server |
| Pytest | Backend testing |

Use Redis only if it becomes necessary for background jobs, caching, or distributed communication.

## Frontend

| Technology | Responsibility |
|---|---|
| React | UI |
| TypeScript | Type safety |
| Vite | Development and build |
| Tailwind CSS | Styling |
| shadcn/ui | UI components |
| Zustand | Frontend state management |
| React Router | Page navigation |
| Recharts | Charts and analytics |
| Lucide React | Icons |
| WebSocket API | Live simulation updates |

---

# 3. Overall Backend Architecture

Follow a modular architecture. Do not put all backend logic inside `main.py` or individual API routes.

```text
backend/
│
├── app/
│   ├── main.py
│   ├── config.py
│   │
│   ├── api/
│   │   ├── dashboard.py
│   │   ├── simulation.py
│   │   ├── robots.py
│   │   ├── orders.py
│   │   ├── events.py
│   │   ├── training.py
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
│   ├── simulation/
│   │   ├── engine.py
│   │   ├── collision.py
│   │   ├── deadlock.py
│   │   ├── path_planner.py
│   │   ├── state_manager.py
│   │   └── event_engine.py
│   │
│   ├── algorithms/
│   │   ├── astar.py
│   │   └── task_allocator.py
│   │
│   ├── rl/
│   │   ├── environments/
│   │   │   ├── warehouse_env.py
│   │   │   └── multi_agent_env.py
│   │   ├── agents/
│   │   │   ├── shared_agent.py
│   │   │   └── agent_manager.py
│   │   ├── algorithms/
│   │   │   ├── ppo.py
│   │   │   └── mappo.py
│   │   ├── rewards/
│   │   │   └── reward_function.py
│   │   └── training/
│   │       └── trainer.py
│   │
│   ├── services/
│   │   ├── dashboard_service.py
│   │   ├── simulation_service.py
│   │   ├── robot_service.py
│   │   ├── order_service.py
│   │   ├── event_service.py
│   │   ├── training_service.py
│   │   └── evaluation_service.py
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

Antigravity should create modules incrementally. Do not generate the entire architecture in one uncontrolled step.

---

# 4. Webpage-Wise Backend Instructions

The frontend has eight main pages. Each page must communicate with the backend through defined APIs.

## Page 1: Dashboard

**Route:** `/`

**Purpose:** Provide a real-time overview of warehouse operations.

### Frontend information
- Total robots.
- Active robots.
- Idle robots.
- Failed robots.
- Pending orders.
- Completed orders.
- Active simulation status.
- Warehouse throughput.
- Average task completion time.
- Robot utilization.
- Recent warehouse events.
- Performance charts.

### Backend responsibilities

Create `dashboard.py` and `dashboard_service.py`.

### APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/dashboard/overview` | Overall warehouse statistics |
| GET | `/api/dashboard/metrics` | Performance metrics |
| GET | `/api/dashboard/activity` | Recent warehouse activity |
| GET | `/api/dashboard/health` | Backend and simulation health |

### Example response

```json
{
  "warehouse_status": "running",
  "robots": {
    "total": 8,
    "active": 5,
    "idle": 2,
    "failed": 1
  },
  "orders": {
    "pending": 12,
    "completed": 45
  },
  "performance": {
    "throughput": 14,
    "average_completion_time": 32.5,
    "robot_utilization": 78.4
  }
}
```

These values are illustrative examples, not actual project results.

### Backend logic
1. Retrieve robot states.
2. Retrieve order statistics.
3. Retrieve simulation status.
4. Calculate performance metrics.
5. Return a consolidated dashboard response.

Dashboard statistics must come from actual backend state, not hardcoded frontend values.

---

## Page 2: Warehouse Simulation

**Route:** `/simulation`

<image-placeholder> </image-placeholder>

**Purpose:** Display the virtual warehouse and simulate robot movement.

### Frontend information
- Warehouse grid.
- Shelves and blocked cells.
- Pickup stations.
- Packing stations.
- Robot positions.
- Robot movement paths.
- Obstacles.
- Simulation controls.
- Simulation speed.
- Current simulation time.

### Backend responsibilities

Create:
- `simulation.py`
- `simulation_service.py`
- `warehouse.py`
- `engine.py`
- `state_manager.py`
- `collision.py`
- `path_planner.py`

### APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/simulation/state` | Get current warehouse state |
| POST | `/api/simulation/start` | Start simulation |
| POST | `/api/simulation/pause` | Pause simulation |
| POST | `/api/simulation/resume` | Resume simulation |
| POST | `/api/simulation/reset` | Reset simulation |
| POST | `/api/simulation/speed` | Change simulation speed |
| GET | `/api/simulation/config` | Get warehouse configuration |

### Warehouse state structure

```json
{
  "width": 20,
  "height": 15,
  "grid": [],
  "robots": [],
  "obstacles": [],
  "stations": [],
  "simulation": {
    "status": "running",
    "time_step": 120,
    "speed": 1
  }
}
```

The grid should use a consistent coordinate system:

- X represents columns.
- Y represents rows.
- Each cell has a defined type.
- Robot positions must always map to valid cells.

### Simulation engine responsibilities

The engine must:
1. Load the warehouse configuration.
2. Initialize robots and stations.
3. Process assigned tasks.
4. Calculate robot movement.
5. Validate movement against warehouse boundaries.
6. Detect robot-to-robot conflicts.
7. Detect obstacles.
8. Update the warehouse state.
9. Calculate simulation metrics.
10. Publish updated state to connected frontend clients.

### Collision detection

Prevent:
- Two robots occupying the same cell.
- Two robots swapping positions simultaneously when that creates a collision.
- Robots entering blocked cells.
- Robots leaving warehouse boundaries.

Implement safe movement resolution. Do not simply move every robot independently without checking conflicts.

### WebSocket

**Endpoint:** `/ws/simulation`

Send updated simulation state to the frontend.

Example:

```json
{
  "type": "simulation_update",
  "data": {
    "time_step": 121,
    "robots": [],
    "obstacles": [],
    "metrics": {}
  }
}
```

The frontend should animate robot positions based on backend updates.

---

## Page 3: Robot Fleet

**Route:** `/robots`

**Purpose:** Manage and monitor all virtual warehouse robots.

### Frontend information
- Robot ID.
- Current position.
- Battery level.
- Robot status.
- Assigned task.
- Current destination.
- Travel distance.
- Completed tasks.
- Robot details.
- Add robot.
- Remove robot.
- Simulate failure.
- Recover robot.

### Backend responsibilities

Create:
- `robots.py`
- `robot_service.py`
- `robot.py`
- `agent_manager.py`

### APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/robots` | Get all robots |
| GET | `/api/robots/{robot_id}` | Get robot details |
| POST | `/api/robots` | Register a new robot |
| DELETE | `/api/robots/{robot_id}` | Remove a robot |
| POST | `/api/robots/{robot_id}/failure` | Simulate robot failure |
| POST | `/api/robots/{robot_id}/recover` | Recover robot |
| GET | `/api/robots/{robot_id}/history` | Get robot activity |

### Robot data structure

```json
{
  "robot_id": "R-001",
  "position": [4, 6],
  "battery": 87,
  "status": "active",
  "assigned_task": "T-101",
  "destination": [10, 8],
  "total_distance": 120,
  "completed_tasks": 14
}
```

### New robot registration logic

When a new robot is added:

1. Validate the robot configuration.
2. Generate a unique robot ID.
3. Assign an available starting position.
4. Check that the position is not blocked or occupied.
5. Register the robot with the simulation engine.
6. Register it with the agent manager.
7. Make it available for task allocation.
8. Publish the updated fleet state.

### RL policy integration

Use a shared policy architecture initially.

A newly registered robot can use the existing policy if its observation and action spaces are compatible.

Do not assume that every new robot will perform optimally immediately. Monitor its behavior and use safe fallback routing when required.

### Robot failure logic

When a robot fails:

1. Change its status to `failed`.
2. Stop its movement.
3. Release or mark its current task as interrupted.
4. Reassign unfinished work when possible.
5. Recalculate routes for affected robots.
6. Publish the failure event.

---

## Page 4: Orders & Tasks

**Route:** `/orders`

**Purpose:** Manage incoming warehouse orders and robot task allocation.

### Frontend information
- Total orders.
- Pending orders.
- In-progress orders.
- Completed orders.
- Cancelled orders.
- Order priority.
- Order details.
- Product pickup locations.
- Assigned robot.
- Task progress.
- Create order.
- Cancel order.

### Backend responsibilities

Create:
- `orders.py`
- `order_service.py`
- `order.py`
- `task.py`
- `task_allocator.py`

### APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/orders` | Get all orders |
| GET | `/api/orders/{order_id}` | Get order details |
| POST | `/api/orders` | Create an order |
| POST | `/api/orders/{order_id}/cancel` | Cancel an order |
| GET | `/api/tasks` | Get all tasks |
| GET | `/api/tasks/{task_id}` | Get task details |
| POST | `/api/tasks/{task_id}/assign` | Assign a task |

### Example order

```json
{
  "order_id": "ORD-101",
  "priority": "high",
  "items": [
    {
      "product_id": "P-101",
      "quantity": 2,
      "location": [5, 8]
    }
  ],
  "status": "pending",
  "assigned_robot": null
}
```

### Task allocation workflow

1. Receive a new order.
2. Validate product locations.
3. Convert order requirements into tasks.
4. Add tasks to the queue.
5. Find available robots.
6. Estimate task cost.
7. Select a robot using the configured allocation strategy.
8. Assign the task.
9. Calculate the route.
10. Update task and order status.

### Task allocation strategies

Implement the following progressively:

- Rule-based allocation.
- Nearest available robot.
- A* based route cost.
- RL-based task allocation as an advanced extension.

Do not claim RL task allocation is implemented until it is actually connected to the simulation.

---

## Page 5: Events & Environment

**Route:** `/events`

**Purpose:** Introduce dynamic changes into the warehouse environment.

### Frontend information
- Event history.
- Event type.
- Event status.
- Event timestamp.
- Add obstacle.
- Remove obstacle.
- Simulate congestion.
- Simulate robot failure.
- Generate peak order demand.
- Trigger warehouse disruptions.

### Backend responsibilities

Create:
- `events.py`
- `event_service.py`
- `event_engine.py`
- `obstacle.py`

### APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/events` | Get event history |
| POST | `/api/events/obstacle` | Add obstacle |
| DELETE | `/api/events/obstacle/{id}` | Remove obstacle |
| POST | `/api/events/congestion` | Simulate congestion |
| POST | `/api/events/robot-failure` | Trigger robot failure |
| POST | `/api/events/peak-demand` | Generate additional orders |
| POST | `/api/events/reset` | Reset active events |

### Example obstacle request

```json
{
  "position": [8, 9],
  "duration": 30,
  "event_type": "temporary_obstacle"
}
```

### Event engine workflow

1. Receive event request.
2. Validate event parameters.
3. Update the warehouse environment.
4. Inform the simulation engine.
5. Recalculate affected routes.
6. Reassign tasks if necessary.
7. Record the event.
8. Broadcast the update.

### RL integration

The RL agent should receive observations reflecting environmental changes.

For example:
- Newly blocked cells.
- Increased congestion.
- Robot failures.
- Changed task queues.

The agent should respond through its learned policy, while safety constraints remain enforced by the simulation engine.

---

## Page 6: Training & Models

**Route:** `/training`

**Purpose:** Train, manage, and monitor reinforcement learning models.

### Frontend information
- Selected algorithm.
- Training status.
- Training configuration.
- Number of episodes.
- Total timesteps.
- Episode reward.
- Average reward.
- Training loss.
- Model checkpoints.
- Training history.
- Start training.
- Stop training.
- Load model.

### Backend responsibilities

Create:
- `training.py`
- `training_service.py`
- `trainer.py`
- `warehouse_env.py`
- `multi_agent_env.py`
- `reward_function.py`
- `shared_agent.py`
- `model_service.py`

### APIs

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/training/start` | Start training |
| POST | `/api/training/stop` | Stop training |
| GET | `/api/training/status` | Current training status |
| GET | `/api/training/metrics` | Training metrics |
| GET | `/api/models` | List available models |
| POST | `/api/models/load` | Load a checkpoint |
| GET | `/api/models/{model_id}` | Model information |

### RL development progression

**Stage 1 — Baseline**

- Implement A* pathfinding.
- Implement rule-based task allocation.
- Collect baseline metrics.

**Stage 2 — Single-agent RL**

- Create a custom Gymnasium environment.
- Define observations.
- Define actions.
- Define rewards.
- Train PPO using Stable-Baselines3.
- Save checkpoints.

**Stage 3 — Multi-agent RL**

- Extend the environment for multiple robots.
- Introduce shared-policy execution.
- Implement a multi-agent training interface.
- Experiment with MAPPO.

### Reward design

Possible reward components:

| Behavior | Reward direction |
|---|---|
| Completing a task | Positive |
| Reducing travel distance | Positive |
| Reaching destination | Positive |
| Collision | Negative |
| Deadlock | Negative |
| Unnecessary waiting | Negative |
| Invalid movement | Negative |

Reward weights must be configurable and experimentally validated.

### Training execution rules

- Never run long training loops directly inside a normal API request.
- Use background execution or a dedicated training process.
- Store training status and metrics.
- Save model checkpoints.
- Keep training configuration with each checkpoint.
- Allow training to stop safely.
- Do not block simulation API requests while training runs.

### Training WebSocket

**Endpoint:** `/ws/training`

Send:
- Training progress.
- Episode number.
- Current reward.
- Average reward.
- Loss values.
- Training status.

---

## Page 7: Evaluation & Comparison

**Route:** `/evaluation`

**Purpose:** Compare the performance of different warehouse optimization approaches.

### Frontend information
- Algorithm selection.
- Scenario selection.
- Run experiment.
- Total completion time.
- Total travel distance.
- Collision count.
- Deadlock count.
- Throughput.
- Robot utilization.
- Waiting time.
- Comparison charts.
- Experiment history.

### Backend responsibilities

Create:
- `evaluation.py`
- `evaluation_service.py`
- `metrics.py`
- `experiments.py`
- `comparison.py`

### APIs

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/evaluation/run` | Run an experiment |
| GET | `/api/evaluation/results` | Retrieve results |
| GET | `/api/evaluation/metrics` | Retrieve metric summaries |
| GET | `/api/evaluation/compare` | Compare algorithms |
| GET | `/api/evaluation/history` | Experiment history |

### Algorithms to compare

1. A* with rule-based allocation.
2. PPO-based policy.
3. MAPPO-based multi-agent policy, when implemented.

### Evaluation metrics

| Metric | Meaning |
|---|---|
| Task completion time | Time required to finish tasks |
| Travel distance | Total robot movement |
| Waiting time | Time robots spend waiting |
| Collision count | Number of collisions |
| Deadlock count | Number of deadlock events |
| Throughput | Orders completed per time unit |
| Robot utilization | Percentage of time robots are active |

### Experiment workflow

1. Select warehouse scenario.
2. Select algorithm.
3. Load model if required.
4. Initialize the same starting conditions.
5. Run simulation.
6. Collect metrics.
7. Repeat using multiple random seeds.
8. Calculate average and variability.
9. Store results.
10. Return results to the frontend.

**Important:** Comparisons must use equivalent conditions. Do not hardcode performance improvements or fabricate experiment results.

---

## Page 8: Settings & Configuration

**Route:** `/settings`

**Purpose:** Configure the warehouse and simulation environment.

### Frontend information
- Warehouse width and height.
- Initial robot count.
- Simulation speed.
- Order generation rate.
- Obstacle configuration.
- Algorithm selection.
- RL reward configuration.
- Experiment settings.

### Backend responsibilities

Create `settings.py` and `config.py`.

### APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/settings` | Retrieve settings |
| PUT | `/api/settings` | Update settings |
| POST | `/api/settings/reset` | Restore default settings |
| GET | `/api/settings/warehouse` | Get warehouse configuration |
| PUT | `/api/settings/warehouse` | Update warehouse configuration |

### Validation rules

- Warehouse dimensions must be positive.
- Robot count must be within configured limits.
- Robots cannot spawn inside shelves or obstacles.
- Simulation speed must be valid.
- RL parameters must satisfy their expected ranges.
- Changes that affect an active simulation should require a reset or explicit safe reconfiguration.

---

# 5. WebSocket Communication Architecture

Use WebSockets for live updates instead of repeatedly polling the backend for every simulation frame.

| Endpoint | Purpose |
|---|---|
| `/ws/simulation` | Robot movement and warehouse state |
| `/ws/robots` | Fleet status updates |
| `/ws/events` | Environment event notifications |
| `/ws/training` | Training progress |

### Standard event format

```json
{
  "type": "robot_updated",
  "timestamp": "2026-01-01T10:30:00Z",
  "data": {}
}
```

Possible event types:
- `simulation_started`
- `simulation_paused`
- `simulation_update`
- `robot_updated`
- `robot_failed`
- `robot_recovered`
- `task_assigned`
- `task_completed`
- `obstacle_added`
- `collision_detected`
- `deadlock_detected`
- `training_progress`
- `training_completed`

Use consistent event schemas. Handle WebSocket disconnects and reconnects gracefully.

---

# 6. Database Design

Use PostgreSQL for persistent records.

Suggested tables:

| Table | Purpose |
|---|---|
| warehouses | Warehouse configuration |
| robots | Robot information |
| orders | Incoming orders |
| tasks | Assigned tasks |
| simulations | Simulation sessions |
| events | Warehouse events |
| training_runs | RL training records |
| model_checkpoints | Saved models |
| evaluation_runs | Experiment information |
| evaluation_metrics | Experiment metrics |

Keep high-frequency simulation state in memory initially. Persist important snapshots, events, configurations, and experiment results rather than writing every simulation frame to PostgreSQL.

---

# 7. Frontend-to-Backend Integration Rules

Antigravity must follow these rules:

1. Every dashboard statistic must be connected to a backend response.
2. Every functional button must call the appropriate API.
3. Forms must validate input before submission.
4. Loading states must appear while requests are processing.
5. Error states must display meaningful messages.
6. WebSocket data must update the UI without requiring a page refresh.
7. Use a centralized API client.
8. Keep frontend and backend types consistent.
9. Do not place business logic inside React components.
10. Do not use fake data as actual simulation results.
11. Demo data may be used only in a clearly labelled demo or mock mode.
12. Keep API URLs and configuration in environment variables.

### Suggested frontend API structure

```text
frontend/src/
├── services/
│   ├── api.ts
│   ├── dashboard.api.ts
│   ├── simulation.api.ts
│   ├── robots.api.ts
│   ├── orders.api.ts
│   ├── events.api.ts
│   ├── training.api.ts
│   └── evaluation.api.ts
│
├── hooks/
│   ├── useSimulationSocket.ts
│   ├── useTrainingSocket.ts
│   └── useRobotSocket.ts
│
├── stores/
│   ├── simulationStore.ts
│   ├── robotStore.ts
│   └── dashboardStore.ts
│
└── types/
    ├── robot.ts
    ├── order.ts
    ├── simulation.ts
    └── metrics.ts
```

---

# 8. Antigravity Development Plan

Antigravity should work in controlled phases. Complete and test each phase before moving to the next.

## Phase 1 — Repository Inspection

Tasks:
- Inspect the existing frontend.
- Identify all eight pages.
- Identify existing components and routes.
- Inspect the current backend, if present.
- Identify existing API integrations.
- Check the existing project dependencies.

Deliverable:
- A short architecture and gap analysis.
- A list of files that need to be created or updated.

Do not replace existing working code without a reason.

## Phase 2 — Backend Foundation

Tasks:
- Set up FastAPI.
- Configure CORS.
- Configure Pydantic.
- Set up SQLAlchemy.
- Connect PostgreSQL.
- Create API routers.
- Add health-check endpoint.
- Configure environment variables.
- Add basic logging and error handling.

Acceptance criteria:
- Backend starts successfully.
- API documentation is accessible at `/docs`.
- Database connection works.
- Health endpoint returns a valid response.

## Phase 3 — Warehouse Core

Tasks:
- Create warehouse grid.
- Create robot model.
- Create station model.
- Create obstacle model.
- Implement coordinate validation.
- Implement warehouse state manager.

Acceptance criteria:
- Warehouse state can be initialized.
- Robots can be registered.
- Invalid positions are rejected.
- Warehouse state can be retrieved through an API.

## Phase 4 — Simulation Engine

Tasks:
- Implement simulation engine.
- Implement robot movement.
- Implement A* pathfinding.
- Implement collision detection.
- Implement deadlock detection.
- Implement simulation start, pause, resume, and reset.
- Connect simulation WebSocket.

Acceptance criteria:
- Multiple robots can move.
- Robots cannot enter blocked cells.
- Conflicting movements are resolved safely.
- Frontend receives live state updates.

## Phase 5 — Robot Fleet and Orders

Tasks:
- Implement robot CRUD operations.
- Implement robot failure and recovery.
- Implement order creation.
- Convert orders into tasks.
- Implement task queues.
- Implement rule-based task allocation.
- Connect robot and order pages.

Acceptance criteria:
- A new robot can be registered.
- An order can be created.
- A task can be assigned.
- Robot failure is handled.
- Interrupted tasks can be reassigned.

## Phase 6 — Events and Dynamic Environment

Tasks:
- Add temporary obstacles.
- Add congestion events.
- Add robot failure events.
- Add peak-demand events.
- Implement route recalculation.
- Connect the events page.

Acceptance criteria:
- Events change the actual simulation state.
- Affected routes are updated.
- Event history is recorded.
- Frontend receives event notifications.

## Phase 7 — RL Environment and PPO

Tasks:
- Build Gymnasium environment.
- Define observation space.
- Define action space.
- Implement reward function.
- Validate `reset()` and `step()`.
- Integrate PPO.
- Train a single-agent model.
- Save checkpoints.
- Connect training status to the UI.

Acceptance criteria:
- Environment passes basic API checks.
- PPO training runs.
- Training metrics are recorded.
- A saved model can be loaded for inference.

## Phase 8 — Multi-Agent RL

Tasks:
- Extend the environment to multiple robots.
- Introduce shared-policy execution.
- Implement multi-agent observation and action handling.
- Experiment with MAPPO.
- Validate performance across fleet sizes.

Acceptance criteria:
- Multiple robots can use the shared policy.
- Agent actions are processed safely.
- Model loading and inference work.
- Evaluation results are recorded.

Do not mark MAPPO complete merely because a file named `mappo.py` exists. It must have a working implementation and validated experiment.

## Phase 9 — Evaluation

Tasks:
- Implement baseline experiments.
- Implement RL experiments.
- Calculate performance metrics.
- Run repeatable scenarios.
- Store experiment results.
- Connect comparison charts.

Acceptance criteria:
- Algorithms can be evaluated under equivalent conditions.
- Metrics are calculated from actual simulation data.
- Experiment results can be retrieved later.

## Phase 10 — Full Integration and Testing

Tasks:
- Connect all eight frontend pages.
- Test every API.
- Test WebSocket updates.
- Test simulation controls.
- Test robot registration and failure.
- Test order creation and assignment.
- Test RL inference.
- Test error handling.
- Test database persistence.

Acceptance criteria:
- No major page depends on unexplained hardcoded data.
- All functional controls work.
- Frontend and backend remain synchronized.
- The application can be started using documented instructions.

---

# 9. Instructions for Antigravity Agent

Follow these instructions throughout development.

### A. Understand before coding
- Read the existing repository before modifying anything.
- Understand the existing frontend design and page structure.
- Preserve existing working components.
- Follow the existing naming conventions where practical.
- Ask before making major architectural changes.

### B. Code quality
- Use modular, reusable code.
- Follow Python type hints.
- Use Pydantic schemas for API validation.
- Keep API routes thin.
- Put business logic in services.
- Put simulation logic in simulation modules.
- Keep RL code separate from normal API logic.
- Handle exceptions properly.
- Add docstrings to important classes and functions.

### C. API integration
- Maintain one consistent API contract.
- Use correct HTTP methods and status codes.
- Validate requests and responses.
- Keep CORS configuration appropriate for local development.
- Document API endpoints.

### D. Simulation safety
- Never allow invalid robot movement.
- Never allow robots to move through shelves or blocked cells.
- Prevent conflicting movements.
- Handle robot failures.
- Ensure task reassignment does not duplicate active assignments.

### E. Reinforcement Learning
- Implement and test the environment before training.
- Begin with PPO and a single agent.
- Move to multi-agent learning only after the baseline works.
- Use a shared policy initially.
- Save checkpoints and configuration.
- Do not claim an RL feature works until it has been tested.
- Keep a safe fallback when model inference fails.

### F. Development discipline
After every phase:
1. Run the backend.
2. Run relevant tests.
3. Check API responses.
4. Inspect logs.
5. Fix errors.
6. Update project documentation.
7. Report completed and incomplete work.

Do not silently skip failed tests.

---

# 10. Environment Configuration

Create a `.env.example` file.

```env
APP_NAME=LogiMind RL
APP_ENV=development
DEBUG=true

BACKEND_HOST=127.0.0.1
BACKEND_PORT=8000

DATABASE_URL=postgresql://user:password@localhost:5432/logimind

FRONTEND_URL=http://localhost:5173

MODEL_DIRECTORY=./models/checkpoints
DEFAULT_ALGORITHM=astar
```

Never commit real passwords, API keys, or database credentials.

---

# 11. Testing Strategy

Create tests for the following areas:

| Module | Test |
|---|---|
| Warehouse | Grid initialization and coordinate validation |
| Robot | Registration, movement, failure, recovery |
| Collision | Same-cell and crossing-path conflicts |
| Pathfinding | Valid and unreachable paths |
| Orders | Creation and cancellation |
| Tasks | Assignment and reassignment |
| Events | Obstacle and congestion updates |
| Simulation | Start, pause, resume, reset |
| RL environment | Reset, step, observations, rewards |
| Training | Start, stop, checkpoint saving |
| Evaluation | Metric calculation and result storage |
| API | Request validation and response status |

Use deterministic test scenarios wherever possible.

---

# 12. Final Expected Product

At completion, LogiMind RL should provide:

1. A working virtual warehouse.
2. Multiple software-based robots.
3. Live warehouse simulation.
4. Collision and deadlock handling.
5. Order and task management.
6. Dynamic environmental events.
7. A* and rule-based baselines.
8. A working PPO training pipeline.
9. A multi-agent RL implementation, if completed.
10. Performance evaluation and comparison.
11. Persistent experiment records.
12. A fully integrated frontend and backend.

The final application should allow a user to configure a warehouse, add robots, create orders, run simulations, introduce disruptions, train or load RL models, and evaluate algorithm performance.

---

# 13. First Task for Antigravity

Start with the existing repository, not a fresh rewrite.

**Execute only the following initial tasks:**

1. Inspect the complete frontend project.
2. Identify all eight pages and their current functionality.
3. Identify existing components, data models, and API calls.
4. Prepare a frontend-to-backend integration mapping.
5. Identify missing backend endpoints.
6. Propose the backend folder structure.
7. Report any architecture conflicts or missing requirements.

Do not begin implementing every backend module immediately.

After presenting the inspection report, start Phase 2 only when the architecture is clear.

**Final instruction:** Build a functional, testable warehouse optimization system, not just a visually impressive dashboard. Every displayed operational metric must have a real source, every important control must perform an actual operation, and every claimed RL capability must have a working implementation.