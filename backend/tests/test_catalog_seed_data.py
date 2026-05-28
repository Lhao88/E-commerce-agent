from decimal import Decimal

from app.catalog.seed_data import PRODUCTS


REQUIRED_FIELDS = {
    "id",
    "name",
    "category",
    "brand",
    "price",
    "stock",
    "tags",
    "specs",
    "selling_points",
    "after_sales_policy",
}


def test_catalog_has_200_complete_products_across_core_categories():
    assert len(PRODUCTS) >= 200
    assert len({item["id"] for item in PRODUCTS}) == len(PRODUCTS)
    assert {item["category"] for item in PRODUCTS} >= {
        "phone",
        "laptop",
        "tablet",
        "earphone",
        "camera",
        "smartwatch",
    }

    for product in PRODUCTS:
        assert REQUIRED_FIELDS <= product.keys()
        assert product["id"]
        assert product["name"]
        assert product["brand"]
        assert isinstance(product["price"], Decimal)
        assert product["price"] > 0
        assert isinstance(product["stock"], int)
        assert product["stock"] >= 0
        assert product["tags"]
        assert product["specs"]
        assert product["selling_points"]
        assert product["after_sales_policy"]
