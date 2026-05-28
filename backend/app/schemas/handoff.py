from typing import Optional

from pydantic import BaseModel


class HandoffRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    user_id: Optional[str] = None
