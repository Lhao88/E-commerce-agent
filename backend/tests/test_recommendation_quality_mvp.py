from decimal import Decimal

from app.catalog import retriever


def product(
    product_id,
    *,
    category="phone",
    brand="TestBrand",
    price=2999,
    stock=10,
    tags=None,
    selling_points=None,
):
    return {
        "id": product_id,
        "name": f"{brand} 测试商品",
        "category": category,
        "brand": brand,
        "price": Decimal(str(price)),
        "stock": stock,
        "tags": tags or ["拍照", "长续航"],
        "specs": {"battery": "5000mAh", "camera": "5000万像素主摄"},
        "selling_points": selling_points or ["拍照稳定", "续航强", "库存可售"],
        "after_sales_policy": "7天无理由退换，1年保修。",
    }


def test_recommendations_must_come_from_catalog():
    catalog_ids = {item["id"] for item in retriever.get_catalog_products()}

    data = retriever.recommend_products("拍照好续航强的手机", limit=5)

    assert data["recommendations"]
    assert {item["id"] for item in data["recommendations"]}.issubset(catalog_ids)


def test_recommendations_stay_within_explicit_budget():
    data = retriever.recommend_products("预算 3000，送女生数码产品", limit=5)

    assert data["slots"]["budget_max"] == 3000
    assert data["recommendations"]
    assert all(Decimal(str(item["price"])) <= Decimal("3000") for item in data["recommendations"])


def test_recommendation_reason_references_real_product_fields():
    data = retriever.recommend_products("拍照好续航强的手机", limit=3)

    for item in data["recommendations"]:
        reason = item["recommendation_reason"]
        assert any(tag in reason for tag in item["tags"])
        assert any(point in reason for point in item["selling_points"])


def test_frontend_static_product_ids_exist_in_backend_catalog():
    frontend_product_ids = {
        "laptop-aurora-15",
        "laptop-redmi-g-pro",
        "laptop-feather-14",
        "phone-017",
        "phone-011",
        "phone-004",
        "tablet-002",
        "tablet-007",
        "tablet-013",
        "earphone-008",
        "earphone-005",
        "earphone-030",
        "camera-003",
        "camera-013",
        "camera-005",
        "smartwatch-002",
        "smartwatch-004",
        "smartwatch-012",
    }
    catalog_ids = {item["id"] for item in retriever.get_catalog_products()}

    assert frontend_product_ids <= catalog_ids


def test_out_of_stock_product_cannot_be_top_recommendation(monkeypatch):
    monkeypatch.setattr(
        retriever,
        "load_products_from_db",
        lambda: [
            product("phone-oos", stock=0, tags=["拍照", "长续航", "送礼"], selling_points=["缺货但高匹配"]),
            product("phone-in-stock", stock=5, tags=["拍照", "长续航"], selling_points=["有货可售"]),
        ],
    )

    data = retriever.recommend_products("拍照好续航强的手机", limit=2)

    assert data["recommendations"][0]["stock"] > 0


def test_excluded_brand_cannot_be_recommended(monkeypatch):
    monkeypatch.setattr(
        retriever,
        "load_products_from_db",
        lambda: [
            product("phone-apple", brand="Apple", tags=["拍照", "长续航"]),
            product("phone-vivo", brand="vivo", tags=["拍照", "长续航"]),
        ],
    )

    data = retriever.recommend_products("不要 Apple，拍照好续航强的手机", limit=2)

    assert all(item["brand"] != "Apple" for item in data["recommendations"])
