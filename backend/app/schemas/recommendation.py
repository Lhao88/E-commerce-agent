from typing import Optional

from pydantic import BaseModel, Field


class RecommendRequest(BaseModel):
    query: str
    category: Optional[str] = None
    brand: Optional[str] = None
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None
    limit: int = Field(default=5, ge=1, le=10)


class RecommendationResult(BaseModel):
    intent: str
    category: Optional[str]
    slots: dict
    recommendations: list
