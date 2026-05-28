from typing import Any, Optional

from pydantic import BaseModel, Field


class AgentState(BaseModel):
    conversation_id: str
    user_id: Optional[str] = None
    message: str
    intent: str = "recommend"
    category: Optional[str] = None
    slots: dict[str, Any] = Field(default_factory=dict)
    recommendations: list[dict[str, Any]] = Field(default_factory=list)
    next_action: str = "view_product"
