from decimal import Decimal

from app.catalog import retriever


def test_recommend_products_prefers_database_catalog(monkeypatch):
    db_product = {
        "id": "db-laptop-game",
        "name": "DB 游戏本",
        "category": "laptop",
        "brand": "DBBrand",
        "price": Decimal("4999"),
        "stock": 8,
        "tags": ["游戏", "高性能", "散热"],
        "specs": {"gpu": "RTX 4060", "cpu": "Intel Core i7"},
        "selling_points": ["来自数据库", "适合游戏", "散热稳定"],
        "after_sales_policy": "7 天无理由退换，1 年保修。",
    }
    monkeypatch.setattr(retriever, "load_products_from_db", lambda: [db_product], raising=False)

    data = retriever.recommend_products("5000 内游戏本", limit=1)

    assert data["recommendations"][0]["id"] == "db-laptop-game"
