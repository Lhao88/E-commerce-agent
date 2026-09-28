from fastapi.testclient import TestClient
import pytest

from app.core.config import get_settings
from app.main import app


@pytest.fixture(autouse=True)
def use_mock_model_provider(monkeypatch):
    monkeypatch.setenv("APP_QWEN_API_KEY", "")
    monkeypatch.setenv("APP_DEEPSEEK_API_KEY", "")
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


@pytest.fixture()
def client():
    return TestClient(app)


def unwrap_chat(response):
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    return payload["data"]


@pytest.mark.parametrize(
    ("message", "expected_category", "expected_budget"),
    [
        ("预算 3000，送女生数码产品", None, 3000),
        ("5000 内游戏本", "laptop", 5000),
        ("拍照好续航强的手机", "phone", None),
        ("运动降噪耳机", "earphone", None),
        ("学习记笔记平板", "tablet", None),
        ("适合长辈的智能手表", "smartwatch", None),
    ],
)
def test_core_agent_recommendation_scenarios(client, message, expected_category, expected_budget):
    data = unwrap_chat(client.post("/chat", json={"message": message}))

    assert data["intent"] == "recommend"
    assert data["reply"]
    assert data["recommendations"]
    if expected_category is not None:
        assert data["category"] == expected_category
        assert all(item["category"] == expected_category for item in data["recommendations"])
    if expected_budget is not None:
        assert data["slots"]["budget_max"] == expected_budget
        assert all(float(item["price"]) <= expected_budget for item in data["recommendations"])
    assert data["next_action"] in {"compare", "ask_followup", "view_product"}


def test_agent_routes_refund_complaint_to_handoff(client):
    data = unwrap_chat(client.post("/chat", json={"message": "我要投诉退款"}))

    assert data["intent"] == "handoff"
    assert data["next_action"] == "handoff"
    assert data["recommendations"] == []
    assert data["slots"]["handoff_reason"]


def test_agent_should_use_context_for_follow_up_compare(client):
    first = unwrap_chat(client.post("/chat", json={"message": "5000 内游戏本"}))

    follow_up = unwrap_chat(
        client.post(
            "/chat",
            json={"message": "这两个哪个好", "conversation_id": first["conversation_id"]},
        )
    )

    assert follow_up["intent"] == "compare"
    assert follow_up["recommendations"] == first["recommendations"][:2]
    assert follow_up["next_action"] == "compare"
