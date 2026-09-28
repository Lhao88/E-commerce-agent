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


def unwrap_success(response):
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["error"] is None
    assert payload["trace_id"].startswith("req_")
    assert response.headers["x-trace-id"] == payload["trace_id"]
    return payload["data"]


def assert_product_contract(product):
    assert product["id"]
    assert product["name"]
    assert product["category"] in {"phone", "laptop", "tablet", "earphone", "camera", "smartwatch"}
    assert product["brand"]
    assert float(product["price"]) >= 0
    assert isinstance(product["stock"], int)
    assert isinstance(product["tags"], list)
    assert isinstance(product["specs"], dict)
    assert isinstance(product["selling_points"], list)
    assert product["after_sales_policy"]


def test_health_contract(client):
    data = unwrap_success(client.get("/health"))

    assert data["status"] == "ok"
    assert data["api"] == "ok"
    assert data["database"] in {"ok", "not_configured"}
    assert data["redis"] in {"ok", "not_configured"}
    assert data["version"]


def test_chat_contract_returns_reply_slots_and_recommendations(client):
    data = unwrap_success(client.post("/chat", json={"message": "预算 3000，送女生数码产品"}))

    assert data["reply"]
    assert data["conversation_id"].startswith("conv_")
    assert data["intent"] == "recommend"
    assert data["slots"]["budget_max"] == 3000
    assert data["slots"]["recipient"] == "女生"
    assert data["recommendations"]
    assert data["next_action"] in {"compare", "ask_followup", "view_product", "handoff"}
    for product in data["recommendations"]:
        assert_product_contract(product)
        assert product["recommendation_reason"]


def test_recommend_contract_returns_catalog_products(client):
    data = unwrap_success(client.post("/recommend", json={"query": "5000 内游戏本", "limit": 3}))

    assert data["intent"] == "recommend"
    assert data["category"] == "laptop"
    assert data["slots"]["budget_max"] == 5000
    assert 1 <= len(data["recommendations"]) <= 3
    for product in data["recommendations"]:
        assert_product_contract(product)
        assert product["category"] == "laptop"


def test_compare_contract_for_two_products(client):
    data = unwrap_success(
        client.post("/compare", json={"product_ids": ["laptop-aurora-15", "laptop-redmi-g-pro"]})
    )

    assert [item["id"] for item in data["products"]] == ["laptop-aurora-15", "laptop-redmi-g-pro"]
    assert data["diff_groups"]
    assert data["ai_summary"]
    assert set(data["best_for"]) == {"laptop-aurora-15", "laptop-redmi-g-pro"}


def test_handoff_contract_creates_open_ticket(client):
    data = unwrap_success(
        client.post(
            "/handoff",
            json={"message": "我要投诉退款，售后一直不处理", "conversation_id": "conv_quality"},
        )
    )

    assert data["ticket_id"].startswith("ticket_")
    assert data["conversation_id"] == "conv_quality"
    assert data["reason"]
    assert data["summary"]
    assert data["status"] == "open"


def test_feedback_contract_records_event(client):
    data = unwrap_success(
        client.post(
            "/feedback",
            json={
                "conversation_id": "conv_quality",
                "product_id": "phone-pixelnova-8",
                "feedback_type": "buy",
                "note": "模拟下单",
                "payload": {"source": "e2e"},
            },
        )
    )

    assert data == {
        "feedback_id": data["feedback_id"],
        "conversation_id": "conv_quality",
        "product_id": "phone-pixelnova-8",
        "feedback_type": "buy",
        "status": "recorded",
    }
    assert data["feedback_id"].startswith("feedback_")
