from uuid import uuid4

from fastapi import APIRouter, Request

from app.core.responses import ok
from app.schemas.feedback import FeedbackRequest

router = APIRouter()


@router.post("/feedback")
def feedback(payload: FeedbackRequest, request: Request):
    data = {
        "feedback_id": f"feedback_{uuid4().hex[:10]}",
        "conversation_id": payload.conversation_id,
        "product_id": payload.product_id,
        "feedback_type": payload.feedback_type,
        "status": "recorded",
    }
    return ok(data, request)
