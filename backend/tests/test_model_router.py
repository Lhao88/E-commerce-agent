import httpx

from app.agent.model_router import MockProvider, OpenAICompatibleProvider, get_chat_provider
from app.core.config import get_settings


def reset_settings():
    get_settings.cache_clear()


def test_get_chat_provider_uses_mock_without_api_keys(monkeypatch):
    monkeypatch.setenv("APP_QWEN_API_KEY", "")
    monkeypatch.setenv("APP_DEEPSEEK_API_KEY", "")
    reset_settings()

    provider = get_chat_provider()

    assert isinstance(provider, MockProvider)


def test_qwen_provider_calls_openai_compatible_chat_completion(monkeypatch):
    captured = {}

    class FakeResponse:
        def raise_for_status(self):
            return None

        def json(self):
            return {"choices": [{"message": {"content": "真实模型回复"}}]}

    class FakeClient:
        def __init__(self, timeout):
            captured["timeout"] = timeout

        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc, tb):
            return False

        def post(self, url, headers, json):
            captured["url"] = url
            captured["headers"] = headers
            captured["json"] = json
            return FakeResponse()

    monkeypatch.setattr(httpx, "Client", FakeClient)
    provider = OpenAICompatibleProvider(
        provider_name="qwen3",
        api_key="test-key",
        base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
        model_name="qwen3.6-plus",
        timeout_seconds=7,
    )

    reply = provider.reply("预算 3000 送女生数码产品", {"recommendations": [{"name": "耳机"}]})

    assert reply == "真实模型回复"
    assert captured["url"] == "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"
    assert captured["headers"]["Authorization"] == "Bearer test-key"
    assert captured["json"]["model"] == "qwen3.6-plus"
    assert captured["json"]["messages"][0]["role"] == "system"
    assert captured["json"]["messages"][-1]["role"] == "user"


def test_provider_falls_back_to_mock_on_http_error(monkeypatch):
    class FakeClient:
        def __init__(self, timeout):
            pass

        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc, tb):
            return False

        def post(self, url, headers, json):
            raise httpx.TimeoutException("timeout")

    monkeypatch.setattr(httpx, "Client", FakeClient)
    provider = OpenAICompatibleProvider(
        provider_name="deepseek",
        api_key="test-key",
        base_url="https://api.deepseek.com",
        model_name="deepseek-v4-flash",
        timeout_seconds=1,
    )

    reply = provider.reply("预算 3000 送女生数码产品", {"recommendations": [{"name": "耳机"}]})

    assert "筛选出 1 款候选商品" in reply
