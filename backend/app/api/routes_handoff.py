from fastapi import APIRouter, Request

from app.agent.tools import create_handoff_ticket
from app.core.responses import ok
from app.schemas.handoff import HandoffRequest

router = APIRouter()


@router.post("/handoff")
def handoff(payload: HandoffRequest, request: Request):
    ticket = create_handoff_ticket(payload.message, conversation_id=payload.conversation_id)
    return ok(ticket, request)
