from typing import Optional
from pydantic import BaseModel

class Order(BaseModel):
    id: str
    sku: str
    product_name: str
    priority: str = "Normal"  # High, Normal, Low
    status: str = "Queued"    # Queued, Picking, Transport, Completed, Failed
    assigned_robot: Optional[str] = None
    source_shelf: str
    destination: str
    items_count: int = 1
    created_at: str = "04:30"
    deadline: str = "05:00"
