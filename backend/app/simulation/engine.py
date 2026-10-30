import random
from typing import Dict, List, Tuple, Set, Optional
from app.core.robot import Robot
from app.core.order import Order
from app.algorithms.astar import astar_search

class WarehouseEngine:
    def __init__(self, width: int = 20, height: int = 20):
        self.width = width
        self.height = height
        self.is_running = True
        self.speed = 1.0
        self.algorithm = "MAPPO"
        self.active_scenario = "Peak Demand"
        self.sim_time_sec = 272  # 04:32 in seconds

        self.robots: Dict[str, Robot] = {}
        self.orders: List[Order] = []
        self.obstacles: Set[Tuple[int, int]] = set()
        self.shelves: Set[Tuple[int, int]] = set()
        self.stations: Dict[str, Tuple[int, int]] = {
            "pickup_1": (1, 2),
            "pickup_2": (18, 8),
            "packing_1": (17, 16),
            "packing_2": (10, 18),
        }
        self.events: List[dict] = []
        self.metrics_history = []

        self._initialize_default_layout()

    def _initialize_default_layout(self):
        # Place standard shelves
        for r in [3, 7, 11, 15]:
            for c in range(3, 17, 2):
                self.shelves.add((r, c))

        # Initial default obstacles
        self.obstacles.add((11, 7))
        self.obstacles.add((15, 13))

        # Initial Robots
        bot_colors = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"]
        initial_configs = [
            ("R1", "AMR-01", (12, 8), "Active", 87.0, "ORD-102", "Transport"),
            ("R2", "AMR-02", (8, 5), "Active", 92.0, "ORD-103", "Picking"),
            ("R3", "AMR-03", (4, 9), "Waiting", 76.0, None, "Idle"),
            ("R4", "AMR-04", (14, 3), "Active", 85.0, "ORD-105", "Transport"),
            ("R5", "AMR-05", (10, 11), "Charging", 42.0, None, "Charging"),
        ]

        for i, (bid, name, pos, status, batt, task, ttype) in enumerate(initial_configs):
            self.robots[bid] = Robot(
                id=bid,
                name=name,
                position=pos,
                status=status,
                battery=batt,
                current_task=task,
                task_type=ttype,
                color=bot_colors[i % len(bot_colors)]
            )

        # Initial Orders
        self.orders = [
            Order(id="ORD-101", sku="SKU-32", product_name="Microcontroller Units", priority="High", status="Picking", assigned_robot="R3", source_shelf="Shelf A-12", destination="Packing Bay 1", items_count=4, created_at="04:12", deadline="04:45"),
            Order(id="ORD-102", sku="SKU-18", product_name="Optical Sensor Array", priority="Normal", status="Transport", assigned_robot="R1", source_shelf="Shelf B-08", destination="Packing Bay 2", items_count=2, created_at="04:18", deadline="05:00"),
            Order(id="ORD-103", sku="SKU-91", product_name="Lithium Cell Packs", priority="High", status="Transport", assigned_robot="R2", source_shelf="Shelf C-03", destination="Packing Bay 1", items_count=6, created_at="04:22", deadline="04:40"),
            Order(id="ORD-104", sku="SKU-47", product_name="Servo Motor Assemblies", priority="Normal", status="Queued", source_shelf="Shelf A-05", destination="Packing Bay 3", items_count=3, created_at="04:28", deadline="05:15"),
            Order(id="ORD-105", sku="SKU-25", product_name="High-Torque Actuators", priority="High", status="Transport", assigned_robot="R4", source_shelf="Shelf D-14", destination="Packing Bay 2", items_count=1, created_at="04:30", deadline="04:55"),
            Order(id="ORD-106", sku="SKU-63", product_name="Precision CNC Bits", priority="Low", status="Queued", source_shelf="Shelf B-19", destination="Packing Bay 1", items_count=8, created_at="04:31", deadline="05:30"),
            Order(id="ORD-107", sku="SKU-84", product_name="Thermal Insulator Pads", priority="Normal", status="Completed", assigned_robot="R1", source_shelf="Shelf C-11", destination="Packing Bay 2", items_count=5, created_at="04:02", deadline="04:30"),
            Order(id="ORD-108", sku="SKU-12", product_name="Pneumatic Valves", priority="Low", status="Completed", assigned_robot="R2", source_shelf="Shelf D-02", destination="Packing Bay 1", items_count=2, created_at="03:55", deadline="04:25")
        ]

        self.add_event("info", "Warehouse Engine Initialized", "MARL 20x20 discrete grid environment online.")

    def add_event(self, event_type: str, title: str, details: str, entity_id: Optional[str] = None):
        mins = self.sim_time_sec // 60
        secs = self.sim_time_sec % 60
        ev = {
            "id": f"EV-{len(self.events) + 1}",
            "time": f"{mins:02d}:{secs:02d}",
            "type": event_type,
            "title": title,
            "details": details,
            "entityId": entity_id
        }
        self.events.insert(0, ev)
        if len(self.events) > 100:
            self.events.pop()

    def step(self):
        """Simulation tick executed periodically."""
        if not self.is_running:
            return

        self.sim_time_sec += 1
        all_occupied = {r.position for r in self.robots.values() if r.status != "Failed"}
        all_blocks = self.shelves | self.obstacles

        for r in self.robots.values():
            if r.status in ("Failed", "Maintenance"):
                continue

            # If waiting or idle without a path, calculate a target
            if not r.path or len(r.path) == 0:
                if r.status == "Active" and r.current_task:
                    # Pick a station target
                    target = random.choice(list(self.stations.values()))
                    r.target_position = target
                    r.path = astar_search(r.position, target, all_blocks, self.width, self.height)
                elif r.status == "Charging":
                    r.battery = min(100.0, round(r.battery + 0.5, 2))
                    if r.battery >= 99.0:
                        r.status = "Waiting"
                        r.task_type = "Idle"
                        self.add_event("success", f"Robot {r.id} Fully Charged", "Unit ready for dispatch", r.id)
                elif r.status == "Waiting":
                    # Look for queued order
                    for o in self.orders:
                        if o.status == "Queued":
                            o.status = "Picking"
                            o.assigned_robot = r.id
                            r.current_task = o.id
                            r.status = "Active"
                            r.task_type = "Picking"
                            target = (random.randint(1, self.width-2), random.randint(1, self.height-2))
                            r.target_position = target
                            r.path = astar_search(r.position, target, all_blocks, self.width, self.height)
                            self.add_event("info", f"Task Assigned: {o.id}", f"Assigned to {r.id} via MARL policy", r.id)
                            break
            else:
                # Step towards next waypoint if next cell not blocked by peer
                next_pos = r.path[0]
                if next_pos not in all_occupied:
                    r.step_towards_target()
                    # If arrived
                    if not r.path:
                        if r.task_type == "Picking":
                            r.task_type = "Transport"
                            dest = self.stations.get("packing_1", (17, 16))
                            r.target_position = dest
                            r.path = astar_search(r.position, dest, all_blocks, self.width, self.height)
                        elif r.task_type == "Transport":
                            r.task_type = "Idle"
                            r.status = "Waiting"
                            # Mark order complete
                            for o in self.orders:
                                if o.assigned_robot == r.id and o.status == "Transport":
                                    o.status = "Completed"
                                    self.add_event("success", f"Order Completed: {o.id}", f"Delivered to dock bay by {r.id}", r.id)
                                    break
                            r.current_task = None

    def add_robot(self) -> Robot:
        next_num = len(self.robots) + 1
        colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"]
        bot = Robot(
            id=f"R{next_num}",
            name=f"AMR-0{next_num}",
            status="Waiting",
            battery=100.0,
            position=(random.randint(2, self.width-3), random.randint(2, self.height-3)),
            color=colors[next_num % len(colors)]
        )
        self.robots[bot.id] = bot
        self.add_event("success", "New AMR Registered", f"Unit {bot.id} ({bot.name}) joined shared MARL policy fleet", bot.id)
        return bot

    def remove_robot(self, robot_id: str):
        if robot_id in self.robots:
            del self.robots[robot_id]
            self.add_event("warning", "Robot Decommissioned", f"Unit {robot_id} removed from fleet", robot_id)

    def simulate_failure(self, robot_id: Optional[str] = None):
        target_id = robot_id or next((rid for rid, r in self.robots.items() if r.status != "Failed"), "R1")
        if target_id in self.robots:
            self.robots[target_id].status = "Failed"
            self.robots[target_id].speed = 0.0
            task = self.robots[target_id].current_task
            self.robots[target_id].current_task = None
            self.add_event("error", f"Robot Failure: {target_id}", f"Hardware fault stalled unit {target_id}. Peer task reallocation triggered.", target_id)
            # Reassign task if had one
            if task:
                for o in self.orders:
                    if o.id == task:
                        o.status = "Queued"
                        o.assigned_robot = None
                        break

    def add_obstacle(self, pos: Optional[Tuple[int, int]] = None):
        target = pos or (random.randint(2, self.width-3), random.randint(2, self.height-3))
        self.obstacles.add(target)
        self.add_event("warning", "Dynamic Obstacle Spawned", f"Debris detected at ({target[0]}, {target[1]}). Rerouting active paths.")

    def create_congestion(self):
        self.add_event("warning", "Congestion Spike Simulated", "Traffic density surged. Centralized critic evaluating detour rewards.")

    def generate_order(self) -> Order:
        next_id = f"ORD-{100 + len(self.orders) + 1}"
        skus = [("SKU-55", "Sensor Kit"), ("SKU-72", "Battery Core"), ("SKU-88", "Controller Unit"), ("SKU-41", "Actuator Arm"), ("SKU-99", "Micro-Camera Array")]
        sku_code, sku_name = random.choice(skus)
        new_order = Order(
            id=next_id,
            sku=sku_code,
            product_name=sku_name,
            priority="High" if random.random() > 0.5 else "Normal",
            status="Queued",
            source_shelf=f"Shelf {random.choice(['A','B','C','D'])}-{random.randint(1, 20):02d}",
            destination=f"Packing Bay {random.randint(1, 3)}",
            items_count=random.randint(1, 6),
            created_at=f"{self.sim_time_sec // 60:02d}:{self.sim_time_sec % 60:02d}",
            deadline=f"{(self.sim_time_sec // 60) + 1:02d}:30"
        )
        self.orders.insert(0, new_order)
        self.add_event("info", "Order Ingested", f"{new_order.id} ({new_order.product_name}) queued into demand buffer", new_order.id)
        return new_order

    def get_state(self) -> dict:
        mins = self.sim_time_sec // 60
        secs = self.sim_time_sec % 60
        return {
            "isRunning": self.is_running,
            "simTime": f"{mins:02d}:{secs:02d}",
            "activeScenario": self.active_scenario,
            "algorithm": self.algorithm,
            "speed": self.speed,
            "width": self.width,
            "height": self.height,
            "robots": [
                {
                    "id": r.id,
                    "name": r.name,
                    "status": r.status,
                    "battery": r.battery,
                    "currentTask": r.current_task or "None",
                    "taskType": r.task_type,
                    "position": list(r.position),
                    "targetPosition": list(r.target_position) if r.target_position else None,
                    "path": [list(p) for p in r.path],
                    "speed": r.speed,
                    "load": r.load,
                    "maxLoad": r.max_load,
                    "color": r.color
                }
                for r in self.robots.values()
            ],
            "orders": [
                {
                    "id": o.id,
                    "sku": o.sku,
                    "productName": o.product_name,
                    "priority": o.priority,
                    "status": o.status,
                    "assignedRobot": o.assigned_robot,
                    "sourceShelf": o.source_shelf,
                    "destination": o.destination,
                    "itemsCount": o.items_count,
                    "createdAt": o.created_at,
                    "deadline": o.deadline
                }
                for o in self.orders
            ],
            "events": self.events,
            "obstacles": [list(o) for o in self.obstacles],
            "shelves": [list(s) for s in self.shelves],
            "stations": {k: list(v) for k, v in self.stations.items()}
        }
