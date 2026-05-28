import json
from uuid import uuid4

import psycopg

from app.catalog.seed_data import PRODUCTS
from app.core.config import get_settings


def psycopg_url(url: str) -> str:
    return url.replace("postgresql+psycopg://", "postgresql://", 1)


def seed_catalog() -> int:
    settings = get_settings()
    if not settings.database_url:
        raise RuntimeError("APP_DATABASE_URL is required")

    with psycopg.connect(psycopg_url(settings.database_url)) as conn:
        with conn.cursor() as cur:
            for item in PRODUCTS:
                cur.execute(
                    """
                    INSERT INTO products (
                        id, name, category, brand, price, stock,
                        selling_points, after_sales_policy, tags, embedding
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s::jsonb, %s, %s, NULL)
                    ON CONFLICT (id) DO UPDATE SET
                        name = EXCLUDED.name,
                        category = EXCLUDED.category,
                        brand = EXCLUDED.brand,
                        price = EXCLUDED.price,
                        stock = EXCLUDED.stock,
                        selling_points = EXCLUDED.selling_points,
                        after_sales_policy = EXCLUDED.after_sales_policy,
                        tags = EXCLUDED.tags
                    """,
                    (
                        item["id"],
                        item["name"],
                        item["category"],
                        item["brand"],
                        item["price"],
                        item["stock"],
                        json.dumps(item["selling_points"], ensure_ascii=False),
                        item["after_sales_policy"],
                        item["tags"],
                    ),
                )
                cur.execute(
                    """
                    INSERT INTO product_specs (id, product_id, specs)
                    VALUES (%s, %s, %s::jsonb)
                    ON CONFLICT (product_id) DO UPDATE SET
                        specs = EXCLUDED.specs
                    """,
                    (str(uuid4()), item["id"], json.dumps(item["specs"], ensure_ascii=False)),
                )
        conn.commit()
    return len(PRODUCTS)


if __name__ == "__main__":
    count = seed_catalog()
    print(f"seeded_products={count}")
