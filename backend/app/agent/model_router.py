import json
from typing import Any, Protocol

import httpx

from app.core.config import get_settings
from app.agent.prompts import RECOMMENDATION_SYSTEM_PROMPT


class ChatProvider(Protocol):
    provider_name: str

    def reply(self, message: str, context: dict) -> str:
        ...


class MockProvider:
    provider_name = "mock"

    def reply(self, message: str, context: dict) -> str:
        count = len(context.get("recommendations", []))
        if count:
            return f"我已根据你的预算和用途筛选出 {count} 款候选商品，优先看匹配预算、用途和售后稳定性的型号。"
        return "我需要再了解你的预算、使用场景或偏好品牌，才能给出更准确的推荐。"


class OpenAICompatibleProvider:
    def __init__(
        self,
        provider_name: str,
        api_key: str,
        base_url: str,
        model_name: str,
        timeout_seconds: int,
    ) -> None:
        self.provider_name = provider_name
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.model_name = model_name
        self.timeout_seconds = timeout_seconds

    def reply(self, message: str, context: dict) -> str:
        try:
            with httpx.Client(timeout=self.timeout_seconds) as client:
                response = client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": self.model_name,
                        "messages": self._build_messages(message, context),
                        "temperature": 0.2,
                    },
                )
                response.raise_for_status()
                return self._extract_reply(response.json())
        except httpx.HTTPError:
            return MockProvider().reply(message, context)

    def _build_messages(self, message: str, context: dict[str, Any]) -> list[dict[str, str]]:
        safe_context = {
            "intent": context.get("intent"),
            "category": context.get("category"),
            "slots": context.get("slots"),
            "recommendations": [
                {
                    "id": item.get("id"),
                    "name": item.get("name"),
                    "category": item.get("category"),
                    "brand": item.get("brand"),
                    "price": str(item.get("price")),
                    "tags": item.get("tags"),
                    "selling_points": item.get("selling_points"),
                    "recommendation_reason": item.get("recommendation_reason"),
                }
                for item in context.get("recommendations", [])[:5]
            ],
        }
        return [
            {"role": "system", "content": RECOMMENDATION_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": (
                    f"用户问题：{message}\n"
                    f"结构化上下文：{json.dumps(safe_context, ensure_ascii=False)}\n"
                    "请用中文给出简洁、可信、面向导购转化的回复。"
                ),
            },
        ]

    def _extract_reply(self, payload: dict[str, Any]) -> str:
        choices = payload.get("choices") or []
        if not choices:
            return MockProvider().reply("", {})
        content = choices[0].get("message", {}).get("content")
        if not content:
            return MockProvider().reply("", {})
        return str(content).strip()


def get_chat_provider() -> ChatProvider:
    settings = get_settings()
    if settings.qwen_api_key:
        return OpenAICompatibleProvider(
            provider_name="qwen3",
            api_key=settings.qwen_api_key,
            base_url=settings.qwen_base_url,
            model_name=settings.qwen_model_name,
            timeout_seconds=settings.model_timeout_seconds,
        )
    if settings.deepseek_api_key:
        return OpenAICompatibleProvider(
            provider_name="deepseek",
            api_key=settings.deepseek_api_key,
            base_url=settings.deepseek_base_url,
            model_name=settings.deepseek_model_name,
            timeout_seconds=settings.model_timeout_seconds,
        )
    return MockProvider()
