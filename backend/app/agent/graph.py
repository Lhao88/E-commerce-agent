from uuid import uuid4
from typing import Optional

from app.agent.model_router import get_chat_provider
from app.agent.state import AgentState
from app.agent.tools import detect_handoff_reason
from app.catalog.retriever import recommend_products


def run_chat(message: str, conversation_id: Optional[str] = None, user_id: Optional[str] = None) -> dict:
    conversation_id = conversation_id or f"conv_{uuid4().hex[:10]}"
    reason = detect_handoff_reason(message)
    if reason:
        return {
            "reply": "这个问题需要人工客服介入，我会帮你整理上下文并创建工单。",
            "conversation_id": conversation_id,
            "intent": "handoff",
            "category": None,
            "slots": {"handoff_reason": reason},
            "recommendations": [],
            "next_action": "handoff",
        }

    recommendation = recommend_products(message, limit=5)
    provider = get_chat_provider()
    state = AgentState(
        conversation_id=conversation_id,
        user_id=user_id,
        message=message,
        intent=recommendation["intent"],
        category=recommendation["category"],
        slots=recommendation["slots"],
        recommendations=recommendation["recommendations"],
        next_action="compare" if len(recommendation["recommendations"]) >= 2 else "ask_followup",
    )
    reply = provider.reply(message, state.model_dump())
    return {
        "reply": reply,
        "conversation_id": state.conversation_id,
        "intent": state.intent,
        "category": state.category,
        "slots": state.slots,
        "recommendations": state.recommendations,
        "next_action": state.next_action,
    }
