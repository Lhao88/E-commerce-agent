from typing import Protocol

from app.core.config import get_settings


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


class ConfiguredProvider:
    def __init__(self, provider_name: str) -> None:
        self.provider_name = provider_name

    def reply(self, message: str, context: dict) -> str:
        return MockProvider().reply(message, context)


def get_chat_provider() -> ChatProvider:
    settings = get_settings()
    if settings.qwen_api_key:
        return ConfiguredProvider("qwen3")
    if settings.deepseek_api_key:
        return ConfiguredProvider("deepseek")
    return MockProvider()
