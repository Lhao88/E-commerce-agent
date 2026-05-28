from typing import Optional
from uuid import uuid4


HANDOFF_KEYWORDS = {
    "complaint": ["投诉", "差评", "生气", "愤怒", "不处理", "骗子"],
    "refund": ["退款", "退货", "退钱"],
    "warranty": ["保修", "维修", "坏了", "售后"],
}


def detect_handoff_reason(message: str) -> Optional[str]:
    hits = []
    for reason, keywords in HANDOFF_KEYWORDS.items():
        if any(keyword in message for keyword in keywords):
            hits.append(reason)
    if not hits:
        return None
    translated = {
        "complaint": "投诉/强情绪",
        "refund": "退款诉求",
        "warranty": "保修售后",
    }
    return "、".join(translated[item] for item in hits)


def create_handoff_ticket(message: str, conversation_id: Optional[str] = None) -> dict:
    reason = detect_handoff_reason(message) or "人工协助"
    summary = f"用户请求人工处理：{message[:120]}"
    return {
        "ticket_id": f"ticket_{uuid4().hex[:10]}",
        "conversation_id": conversation_id,
        "reason": reason,
        "summary": summary,
        "status": "open",
    }
