from decimal import Decimal
from typing import Any, Optional

from pydantic import BaseModel, Field


class Product(BaseModel):
    id: str
    name: str
    category: str
    brand: str
    price: Decimal
    stock: int
    tags: list[str] = Field(default_factory=list)
    specs: dict[str, Any] = Field(default_factory=dict)
    selling_points: list[str] = Field(default_factory=list)
    after_sales_policy: str
    recommendation_reason: Optional[str] = None
