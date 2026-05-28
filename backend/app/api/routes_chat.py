from fastapi import APIRouter, Request

from app.agent.graph import run_chat
from app.core.responses import ok
from app.schemas.chat import ChatRequest

router = APIRouter()


@router.post("/chat")
def chat(payload: ChatRequest, request: Request):
    data = run_chat(payload.message, conversation_id=payload.conversation_id, user_id=payload.user_id)
    return ok(data, request)
