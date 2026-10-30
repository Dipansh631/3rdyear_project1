import asyncio
from contextlib import asynccontextmanager
from typing import Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.simulation.engine import WarehouseEngine
from app.websocket.manager import ws_manager

engine = WarehouseEngine()

async def simulation_loop():
    while True:
        try:
            if engine.is_running:
                engine.step()
                state = engine.get_state()
                await ws_manager.broadcast({
                    "type": "simulation_state",
                    "data": state
                })
            await asyncio.sleep(max(0.2, 1.0 / engine.speed))
        except Exception as e:
            print(f"Simulation tick error: {e}")
            await asyncio.sleep(1.0)

@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(simulation_loop())
    yield
    task.cancel()

app = FastAPI(title="LogiMind RL API", version="1.0.0", lifespan=lifespan)

# Allow CORS for React frontend (Vite default is 5173 or any port)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket endpoint
@app.websocket("/ws/simulation")
async def websocket_simulation(websocket: WebSocket):
    await ws_manager.connect(websocket)
    # Send immediate state on connect
    await websocket.send_json({
        "type": "simulation_state",
        "data": engine.get_state()
    })
    try:
        while True:
            data = await websocket.receive_text()
            # Can receive client commands here if needed
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)

# ----------------- REST Endpoints ----------------- #

# 1. Simulation
@app.get("/api/simulation/state")
def get_simulation_state():
    return engine.get_state()

@app.post("/api/simulation/start")
def start_simulation():
    engine.is_running = True
    engine.add_event("success", "Simulation Resumed", "Autonomous agents dynamic planning loop active.")
    return {"status": "running"}

@app.post("/api/simulation/pause")
def pause_simulation():
    engine.is_running = False
    engine.add_event("warning", "Simulation Paused", "Warehouse agents held in current position.")
    return {"status": "paused"}

@app.post("/api/simulation/reset")
def reset_simulation():
    global engine
    engine = WarehouseEngine()
    return {"status": "reset"}

class SpeedPayload(BaseModel):
    speed: float

@app.post("/api/simulation/speed")
def set_speed(payload: SpeedPayload):
    engine.speed = max(0.1, min(5.0, payload.speed))
    return {"speed": engine.speed}

class AlgorithmPayload(BaseModel):
    algorithm: str

@app.post("/api/simulation/algorithm")
def set_algorithm(payload: AlgorithmPayload):
    engine.set_algorithm(payload.algorithm)
    return {"algorithm": engine.algorithm}

class ScenarioPayload(BaseModel):
    scenario: str

@app.post("/api/simulation/scenario")
def set_scenario(payload: ScenarioPayload):
    engine.set_scenario(payload.scenario)
    return {"scenario": engine.active_scenario}

# 2. Robots
@app.get("/api/robots")
def list_robots():
    return [r.model_dump() for r in engine.robots.values()]

@app.get("/api/robots/{robot_id}")
def get_robot(robot_id: str):
    if robot_id not in engine.robots:
        raise HTTPException(status_code=404, detail="Robot not found")
    return engine.robots[robot_id].model_dump()

@app.post("/api/robots")
def create_robot():
    bot = engine.add_robot()
    return bot.model_dump()

@app.delete("/api/robots/{robot_id}")
def remove_robot(robot_id: str):
    engine.remove_robot(robot_id)
    return {"status": "deleted"}

@app.post("/api/robots/{robot_id}/failure")
def simulate_robot_failure(robot_id: str):
    engine.simulate_failure(robot_id)
    return {"status": "failed", "robot_id": robot_id}

@app.post("/api/robots/{robot_id}/recover")
def recover_robot(robot_id: str):
    if robot_id in engine.robots:
        engine.robots[robot_id].status = "Active"
        engine.robots[robot_id].speed = 1.0
        engine.add_event("success", f"Robot Recovered: {robot_id}", "Hardware fault cleared. Returned to active fleet.", robot_id)
        return {"status": "recovered"}
    raise HTTPException(status_code=404, detail="Robot not found")

# 3. Orders
@app.get("/api/orders")
def list_orders():
    return [o.model_dump() for o in engine.orders]

@app.post("/api/orders")
def create_order():
    order = engine.generate_order()
    return order.model_dump()

class AssignTaskPayload(BaseModel):
    robot_id: str

@app.post("/api/orders/{order_id}/assign")
def assign_order(order_id: str, payload: AssignTaskPayload):
    for o in engine.orders:
        if o.id == order_id:
            o.assigned_robot = payload.robot_id
            o.status = "Transport"
            if payload.robot_id in engine.robots:
                r = engine.robots[payload.robot_id]
                r.current_task = order_id
                r.status = "Active"
                r.task_type = "Transport"
            engine.add_event("info", f"Order Assigned: {order_id}", f"Assigned to {payload.robot_id}", payload.robot_id)
            return {"status": "assigned"}
    raise HTTPException(status_code=404, detail="Order not found")

@app.post("/api/orders/{order_id}/complete")
def complete_order(order_id: str):
    for o in engine.orders:
        if o.id == order_id:
            o.status = "Completed"
            if o.assigned_robot and o.assigned_robot in engine.robots:
                engine.robots[o.assigned_robot].current_task = None
                engine.robots[o.assigned_robot].task_type = "Idle"
            engine.add_event("success", f"Order Completed: {order_id}", "Order marked completed", o.assigned_robot)
            return {"status": "completed"}
    raise HTTPException(status_code=404, detail="Order not found")

# 4. Events
@app.get("/api/events")
def get_events():
    return engine.events

class ObstaclePayload(BaseModel):
    x: Optional[int] = None
    y: Optional[int] = None

@app.post("/api/events/obstacle")
def add_obstacle(payload: Optional[ObstaclePayload] = None):
    pos = (payload.x, payload.y) if payload and payload.x is not None and payload.y is not None else None
    engine.add_obstacle(pos)
    return {"status": "obstacle_added"}

@app.post("/api/events/congestion")
def trigger_congestion():
    engine.create_congestion()
    return {"status": "congestion_triggered"}

@app.post("/api/events/peak-demand")
def trigger_peak_demand():
    for _ in range(3):
        engine.generate_order()
    engine.add_event("warning", "Peak Demand Surge Injected", "3 high priority customer requests injected into buffer.")
    return {"status": "peak_demand_triggered"}

class CustomEventPayload(BaseModel):
    type: str
    title: str
    details: str

@app.post("/api/events/custom")
def inject_custom_event(payload: CustomEventPayload):
    engine.add_event(payload.type, payload.title, payload.details)
    return {"status": "event_created"}

# 5. Training & Models
class Checkpoint(BaseModel):
    id: str
    name: str
    algorithm: str
    episodes: int
    reward: float
    date: str
    size: str
    active: bool

checkpoints = [
    Checkpoint(id="chk-mappo-v1", name="MAPPO-v1-Warehouse-Fleet", algorithm="MAPPO", episodes=100, reward=73.04, date="2026-10-30", size="1.2 MB", active=True),
    Checkpoint(id="chk-ppo-v1", name="PPO-v1-Warehouse-SingleAgent", algorithm="PPO", episodes=100, reward=36.33, date="2026-10-30", size="479 KB", active=False),
    Checkpoint(id="chk-1", name="MAPPO-v3-WarehousePro", algorithm="MAPPO", episodes=12500, reward=284.6, date="2026-10-28", size="48.2 MB", active=False),
    Checkpoint(id="chk-2", name="MAPPO-v2-Baseline", algorithm="MAPPO", episodes=8000, reward=221.4, date="2026-10-25", size="48.0 MB", active=False),
    Checkpoint(id="chk-3", name="PPO-SingleAgent-Ref", algorithm="PPO", episodes=10000, reward=168.9, date="2026-10-22", size="24.5 MB", active=False),
    Checkpoint(id="chk-4", name="QMIX-Cooperative-Exp", algorithm="Q-MIX", episodes=6500, reward=195.1, date="2026-10-18", size="36.8 MB", active=False),
]

@app.get("/api/models")
def list_models():
    return [c.model_dump() for c in checkpoints]

@app.post("/api/models/{model_id}/load")
def load_model(model_id: str):
    global checkpoints
    for c in checkpoints:
        c.active = (c.id == model_id)
    engine.algorithm = next((c.algorithm for c in checkpoints if c.id == model_id), "MAPPO")
    engine.add_event("success", "Model Checkpoint Loaded", f"Active inference switched to {model_id} ({engine.algorithm})")
    return {"status": "loaded", "model_id": model_id}

@app.post("/api/training/run-ppo")
def run_ppo_trigger():
    engine.add_event("info", "PPO Training Triggered", "PPO actor-critic optimization started")
    return {"status": "started", "algorithm": "PPO"}

@app.post("/api/training/run-mappo")
def run_mappo_trigger():
    engine.add_event("info", "MAPPO Training Triggered", "MAPPO centralized critic optimization started")
    return {"status": "started", "algorithm": "MAPPO"}

# 6. Settings
class SettingsPayload(BaseModel):
    gridWidth: Optional[int] = 20
    gridHeight: Optional[int] = 20
    shelfCount: Optional[int] = 32
    stationCount: Optional[int] = 3
    robotCount: Optional[int] = 5
    algorithm: Optional[str] = "MAPPO"
    speed: Optional[float] = 1.0
    showPaths: Optional[bool] = True
    showZones: Optional[bool] = False
    showHeatmap: Optional[bool] = False
    dynamicObstacles: Optional[bool] = True
    robotFailures: Optional[bool] = True
    congestionControl: Optional[bool] = True
    learningRate: Optional[float] = 0.0003
    discountFactor: Optional[float] = 0.99
    batchSize: Optional[int] = 64

current_settings = SettingsPayload()

@app.get("/api/settings")
def get_settings():
    return current_settings.model_dump()

@app.post("/api/settings")
def update_settings(payload: SettingsPayload):
    global current_settings
    current_settings = payload
    if payload.speed:
        engine.speed = payload.speed
    if payload.algorithm:
        engine.algorithm = payload.algorithm
    engine.add_event("success", "Settings Updated", "Warehouse grid and MARL parameters synchronized.")
    return current_settings.model_dump()
