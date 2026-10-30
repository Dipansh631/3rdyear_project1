from typing import Tuple, List, Optional
from pydantic import BaseModel

class Robot(BaseModel):
    id: str
    name: str
    status: str = "Active"  # Active, Waiting, Charging, Failed, Maintenance
    battery: float = 100.0
    current_task: Optional[str] = None
    task_type: str = "Idle"  # Picking, Transport, Charging, Idle
    position: Tuple[int, int]
    target_position: Optional[Tuple[int, int]] = None
    path: List[Tuple[int, int]] = []
    speed: float = 1.0
    load: int = 0
    max_load: int = 5
    color: str = "#3b82f6"

    def step_towards_target(self) -> None:
        if self.path and len(self.path) > 0:
            self.position = self.path.pop(0)
            self.battery = max(0.0, round(self.battery - 0.05, 2))
            if len(self.path) == 0:
                self.target_position = None
