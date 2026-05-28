from fastapi.testclient import TestClient
import pytest

from app.core.config import get_settings
from app.main import app


client = TestClient(app)


@pytest.fixture(autouse=True)
def use_mock_model_provider(monkeypatch):
    monkeypatch.setenv("APP_QWEN_API_KEY", "")
    monkeypatch.setenv("APP_DEEPSEEK_API_KEY", "")
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


def unwrap(response):
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["error"] is None
    assert payload["trace_id"].startswith("req_")
    return payload["data"]


def test_health_returns_ok_statuses():
    data = unwrap(client.get("/health"))

    assert data["status"] == "ok"
    assert data["api"] == "ok"
    assert data["database"] in {"not_configured", "ok"}
    assert data["redis"] in {"not_configured", "ok"}


def test_cors_allows_vite_development_origin():
    response = client.options(
        "/chat",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"


def test_recommend_returns_laptops_for_budget_game_request():
    data = unwrap(
        client.post(
            "/recommend",
            json={"query": "5000 内游戏本", "limit": 3},
        )
    )

    assert data["category"] == "laptop"
    assert data["slots"]["budget_max"] == 5000
    assert data["recommendations"]
    assert all(item["category"] == "laptop" for item in data["recommendations"])
    assert any("游戏" in item["recommendation_reason"] for item in data["recommendations"])


def test_chat_recommends_gift_products_for_3000_budget():
    data = unwrap(
        client.post(
            "/chat",
            json={"message": "预算 3000 送女生数码产品"},
        )
    )

    assert data["reply"]
    assert data["conversation_id"].startswith("conv_")
    assert data["intent"] == "recommend"
    assert data["slots"]["budget_max"] == 3000
    assert data["slots"]["recipient"] == "女生"
    assert data["recommendations"]
    assert data["next_action"] in {"compare", "ask_followup", "view_product"}


def test_compare_two_products_returns_diff_groups_and_summary():
    data = unwrap(
        client.post(
            "/compare",
            json={"product_ids": ["laptop-aurora-15", "laptop-redmi-g-pro"]},
        )
    )

    assert len(data["products"]) == 2
    assert data["diff_groups"]
    assert data["ai_summary"]
    assert data["best_for"]


def test_handoff_detects_refund_complaint():
    data = unwrap(
        client.post(
            "/handoff",
            json={"message": "我要投诉退款，售后一直不处理"},
        )
    )

    assert data["ticket_id"].startswith("ticket_")
    assert data["status"] == "open"
    assert "退款" in data["reason"] or "投诉" in data["reason"]
    assert data["summary"]
