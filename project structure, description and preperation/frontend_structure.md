LogiMind RL — Frontend Page Structure
                    LOGIMIND RL
                        │
        ┌───────────────┼────────────────┐
        ↓               ↓                ↓
     Dashboard       Simulation       Experiments
        │               │                │
        ↓               ↓                ↓
   Overview        Warehouse View    Comparisons
                        │
             ┌──────────┼──────────┐
             ↓          ↓          ↓
           Robots      Orders    Events
             │          │          │
             └──────────┼──────────┘
                        ↓
                    Evaluation
                        │
                        ↓
                 Training / Models
1. 🏠 Dashboard — Home Page
![alt text](<LogiMind RL Warehouse Dashboard.png>)
Route:

/

This is the main landing page after login/opening the application.

Purpose

Give the user a quick overview of the entire LogiMind RL system.

Show

Top statistics:

Active Robots       5
Active Orders       24
Completed Orders    156
Fleet Utilization   82%
Current Throughput  18 orders/min
Main sections
Warehouse Status

Small live preview of the warehouse.

Robot Status
R1   ACTIVE
R2   ACTIVE
R3   WAITING
R4   FAILED
R5   ACTIVE
Current Simulation
Scenario: Peak Demand
Algorithm: MAPPO
Simulation Time: 04:32
Status: RUNNING
Quick Actions
▶ Start Simulation
⚙ Configure Warehouse
🤖 Manage Robots
📊 View Evaluation
Why this page exists

The dashboard answers:

"What is happening in my warehouse right now?"

2. 🏭 Warehouse Simulation Page
![alt text](<LogiMind Warehouse Simulation Dashboard.png>)
Route:

/simulation

This is the most important page in the frontend.

It visualizes the actual virtual warehouse.

Main area

A large warehouse grid:

┌─────────────────────────────────────┐
│                                     │
│  📦 📦       🤖 → →                │
│  📦 📦                           🤖 │
│                                     │
│       🤖                            │
│                                     │
│  📦 📦              🚧              │
│                                     │
│                    🏁               │
└─────────────────────────────────────┘
Visual elements
Shelves
Aisles
Robots
Robot paths
Pickup stations
Packing station
Obstacles
Congestion areas
Right-side panel
SIMULATION

Status: RUNNING

Algorithm:
MAPPO

Speed:
[──────●───]

Robots:
5

Orders:
32

[ Pause ]

[ Reset ]
Controls
▶ Start
⏸ Pause
↻ Reset
⚡ Simulation Speed
Dynamic controls
+ Add Robot
+ Add Obstacle
+ Generate Orders
⚠ Simulate Robot Failure
Why this page exists

It answers:

"What are the robots actually doing?"

3. 🤖 Robot Fleet Page
![alt text](<LogiMind RL Robot Fleet Dashboard.png>)
Route:

/robots

This page manages the virtual robot fleet.

Robot cards

Example:

┌─────────────────────────┐
│ ROBOT R1                │
│                         │
│ Status: ACTIVE          │
│ Battery: 87%            │
│ Task: ORDER-102         │
│ Position: (12,8)        │
│ Speed: 1.2 m/s          │
│                         │
│ [View Details]          │
└─────────────────────────┘
Fleet table
Robot	Status	Battery	Task	Position
R1	Active	87%	ORD-102	12,8
R2	Active	92%	ORD-103	8,5
R3	Waiting	76%	None	4,9
R4	Failed	12%	ORD-107	14,3
Actions
+ Add Robot
Remove Robot
Simulate Failure
Maintenance
View Robot
New Robot Flow
Add Robot
   ↓
Robot Configuration
   ↓
Register Robot
   ↓
Shared MARL Policy
   ↓
Assign Task
Why this page exists

It answers:

"What is the current state of my robot fleet?"

4. 📦 Orders & Tasks Page
![alt text](<LogiMind RL Orders Dashboard.png>)
Route:

/orders

This page handles warehouse demand.

Order statistics
Pending       24
Processing    12
Completed     156
Failed        2
Order table
Order	Product	Priority	Robot	Status
ORD-101	SKU-32	High	R1	Picking
ORD-102	SKU-18	Normal	R2	Transport
ORD-103	SKU-91	High	R5	Completed
Task queue
TASK QUEUE

T-001 → Shelf A12 → Packing
T-002 → Shelf B08 → Packing
T-003 → Shelf C21 → Packing
Actions
+ Generate Order
Assign Task
Reassign Task
Cancel Task
Why this page exists

It answers:

"What work needs to be done, and which robot is doing it?"

5. ⚠️ Events & Environment Page
![alt text](<Events & Environment Dashboard.png>)
Route:

/events

This is particularly important because dynamic environments are a core part of LogiMind RL.

You can manually introduce events into the simulation.

Event controls
DYNAMIC EVENTS

[ + Add Obstacle ]

[ ⚠ Robot Failure ]

[ 🚦 Create Congestion ]

[ 📦 Peak Demand ]

[ 🤖 Add Robot ]
Event timeline
04:21  Robot R3 failed

04:22  Task T-031 reassigned → R5

04:23  Dynamic obstacle detected

04:23  R1 changed route

04:24  Congestion detected
Why this page exists

It demonstrates that your project isn't just:

"Robot follows a fixed path."

Instead:

Environment changes → system observes → MARL responds.

6. 🧠 Training & Models Page
![alt text](<LogiMind RL Training Dashboard.png>)
Route:

/training

This page is for the AI side of the project.

Training configuration
ALGORITHM

○ PPO
● MAPPO

Agents:
5

Episodes:
10,000

Learning Rate:
0.0003

Batch Size:
64
Training controls
▶ Start Training
⏸ Pause
■ Stop
Training metrics

Display graphs such as:

Reward vs Episode
Loss vs Episode
Success Rate vs Episode
Model management
MODEL CHECKPOINTS

MAPPO-v1
Episode: 5000
Reward: 184.2

MAPPO-v2
Episode: 10000
Reward: 231.7

[Load]
[Evaluate]
Why this page exists

It answers:

"How is the AI learning?"

7. 📊 Evaluation & Comparison Page
![alt text](<Warehouse Robot RL Evaluation Dashboard.png>)
Route:

/evaluation

This is one of the most important pages for your academic/project presentation.

Here you compare your proposed MARL approach against baselines.

Algorithms
A*
Rule-Based
PPO
MAPPO
Metrics
Task Completion Time
Travel Distance
Waiting Time
Collision Count
Deadlock Count
Throughput
Robot Utilization
Example visualization
        PERFORMANCE COMPARISON

A*          █████████████
Rule-Based  ███████████
PPO         █████████
MAPPO       ███████

The actual values should come from your experiments.

Scenario selector
Scenario:

[ Normal Demand ▼ ]

Normal
Peak Demand
Congestion
Dynamic Obstacles
Robot Failure
New Robot
Why this page exists

It answers:

"Does the proposed system actually perform better under the tested conditions?"

Importantly, this page should show measured experimental results, not hardcoded claims.

8. ⚙️ Configuration / Settings Page
![alt text](<LogiMind RL Configuration Dashboard (1).png>)
Route:

/settings

This page controls the simulation environment.

Warehouse configuration
Warehouse Width: 20
Warehouse Height: 20

Number of Robots: 5

Number of Shelves: 30

Number of Stations: 2
Environment settings
Dynamic Obstacles: ON
Robot Failures: ON
Congestion: ON
Peak Demand: OFF
RL settings
Algorithm: MAPPO
Learning Rate: 0.0003
Discount Factor: 0.99
Experiment settings
Random Seed: 42

Episode Length: 500

Save Results: ON
Why this page exists

It allows you to configure experiments without changing source code.

Complete Page List

So your final frontend can have:

#	Page	Route	Main Purpose
1	🏠 Dashboard	/	Overall warehouse overview
2	🏭 Simulation	/simulation	Live warehouse visualization
3	🤖 Robot Fleet	/robots	Manage/monitor robots
4	📦 Orders & Tasks	/orders	Manage warehouse work
5	⚠️ Events	/events	Dynamic environment events
6	🧠 Training & Models	/training	Train/manage RL models
7	📊 Evaluation	/evaluation	Compare algorithms
8	⚙️ Settings	/settings	Configure simulation/experiments
How the pages connect
                         DASHBOARD
                             │
             ┌───────────────┼────────────────┐
             ↓               ↓                ↓
        SIMULATION         ROBOTS           ORDERS
             │               │                │
             └───────────────┼────────────────┘
                             ↓
                          EVENTS
                             │
                             ↓
                     MARL ENVIRONMENT
                             │
                             ↓
                         TRAINING
                             │
                             ↓
                       EVALUATION
                             │
                             ↓
                         RESULTS
The most important pages for your project

If you're building this gradually, don't build all 8 immediately.

Build them in this order:

Phase 1 — Core UI

Dashboard
Simulation

Phase 2 — Management
3. Robots
4. Orders

Phase 3 — AI
5. Events
6. Training

Phase 4 — Research
7. Evaluation

Phase 5 — Configuration
8. Settings