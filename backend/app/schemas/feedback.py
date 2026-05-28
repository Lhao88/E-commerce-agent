from typing import Any, Optional

from pydantic import BaseModel


class FeedbackRequest(BaseModel):
    conversation_id: Optional[str] = None
    product_id: Optional[str] = None
    feedback_type: str
    note: Optional[str] = None
    payload: dict[str, Any] = {}
