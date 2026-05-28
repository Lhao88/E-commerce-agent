import re
from decimal import Decimal
from typing import Any, Optional

import psycopg

from app.catalog.seed_data import PRODUCTS
from app.core.config import get_settings


CATEGORY_KEYWORDS = {
    "laptop": ["笔记本", "游戏本", "电脑", "轻薄本", "办公本"],
    "phone": ["手机", "拍照", "续航"],
    "tablet": ["平板", "学习", "笔记"],
    "earphone": ["耳机", "降噪", "通勤"],
    "camera": ["相机", "拍摄", "vlog", "视频"],
    "smartwatch": ["手表", "运动", "健康", "长辈"],
}

USE_KEYWORDS = {
    "游戏": ["游戏", "显卡", "电竞", "高性能"],
    "办公": ["办公", "轻薄", "便携"],
    "送礼": ["送", "礼物", "女生", "女友", "生日"],
    "拍照": ["拍照", "影像", "人像"],
    "运动": ["运动", "健身", "跑步"],
    "学习": ["学习", "笔记", "网课"],
    "长续航": ["续航", "长辈", "通勤"],
}


def parse_query(query: str, category: Optional[str] = None, brand: Optional[str] = None) -> dict[str, Any]:
    normalized = query.lower()
    budget_max = _parse_budget(normalized)
    detected_category = category or _detect_category(normalized)
    uses = [
        use for use, keywords in USE_KEYWORDS.items() if any(keyword.lower() in normalized for keyword in keywords)
    ]
    recipient = "女生" if "女生" in query or "女友" in query else None

    return {
        "budget_max": budget_max,
        "category": detected_category,
        "brand": brand,
        "uses": uses,
        "recipient": recipient,
        "keywords": query,
    }


def recommend_products(
    query: str,
    *,
    category: Optional[str] = None,
    brand: Optional[str] = None,
    budget_min: Optional[int] = None,
    budget_max: Optional[int] = None,
    limit: int = 5,
) -> dict[str, Any]:
    slots = parse_query(query, category=category, brand=brand)
    if budget_max is not None:
        slots["budget_max"] = budget_max
    if budget_min is not None:
        slots["budget_min"] = budget_min

    catalog = get_catalog_products()
    products = list(catalog)
    if slots.get("category"):
        products = [item for item in products if item["category"] == slots["category"]]
    if brand:
        products = [item for item in products if item["brand"].lower() == brand.lower()]
    if slots.get("budget_max"):
        products = [item for item in products if item["price"] <= Decimal(str(slots["budget_max"]))]
    if slots.get("budget_min"):
        products = [item for item in products if item["price"] >= Decimal(str(slots["budget_min"]))]

    ranked = sorted(products, key=lambda item: _score_product(item, slots), reverse=True)
    if not ranked and slots.get("category"):
        relaxed = [item for item in catalog if item["category"] == slots["category"]]
        ranked = sorted(relaxed, key=lambda item: _score_product(item, slots), reverse=True)
    if not ranked:
        ranked = sorted(catalog, key=lambda item: _score_product(item, slots), reverse=True)

    recommendations = []
    for item in ranked[:limit]:
        product = dict(item)
        product["recommendation_reason"] = build_reason(product, slots)
        recommendations.append(product)

    return {
        "intent": "recommend",
        "category": slots.get("category"),
        "slots": slots,
        "recommendations": recommendations,
    }


def get_products_by_ids(product_ids: list[str]) -> list[dict[str, Any]]:
    by_id = {item["id"]: item for item in get_catalog_products()}
    return [dict(by_id[product_id]) for product_id in product_ids if product_id in by_id]


def get_catalog_products() -> list[dict[str, Any]]:
    products = load_products_from_db()
    return products or list(PRODUCTS)


def load_products_from_db() -> list[dict[str, Any]]:
    settings = get_settings()
    if not settings.database_url:
        return []

    try:
        with psycopg.connect(_psycopg_url(settings.database_url)) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT
                        p.id,
                        p.name,
                        p.category,
                        p.brand,
                        p.price,
                        p.stock,
                        p.tags,
                        ps.specs,
                        p.selling_points,
                        p.after_sales_policy
                    FROM products p
                    LEFT JOIN product_specs ps ON ps.product_id = p.id
                    ORDER BY p.category, p.brand, p.price, p.id
                    """
                )
                return [
                    {
                        "id": row[0],
                        "name": row[1],
                        "category": row[2],
                        "brand": row[3],
                        "price": row[4],
                        "stock": row[5],
                        "tags": list(row[6] or []),
                        "specs": row[7] or {},
                        "selling_points": list(row[8] or []),
                        "after_sales_policy": row[9],
                    }
                    for row in cur.fetchall()
                ]
    except Exception:
        return []


def _psycopg_url(url: str) -> str:
    return url.replace("postgresql+psycopg://", "postgresql://", 1)


def compare_products(product_ids: list[str]) -> dict[str, Any]:
    products = get_products_by_ids(product_ids)
    all_keys = sorted({key for product in products for key in product["specs"].keys()})
    diff_groups = []
    for key in all_keys:
        values = {product["id"]: product["specs"].get(key) for product in products}
        if len(set(values.values())) > 1:
            diff_groups.append(
                {
                    "group": _spec_group(key),
                    "field": key,
                    "values": values,
                    "decision_weight": _decision_weight(key),
                }
            )

    best_for = {product["id"]: _best_for(product) for product in products}
    ai_summary = _compare_summary(products)
    return {
        "products": products,
        "diff_groups": diff_groups,
        "ai_summary": ai_summary,
        "best_for": best_for,
    }


def _parse_budget(query: str) -> Optional[int]:
    match = re.search(r"(\d{3,6})\s*(?:元|块|以内|内)?", query)
    if not match:
        return None
    return int(match.group(1))


def _detect_category(query: str) -> Optional[str]:
    if "数码产品" in query or "礼物" in query or "送女生" in query:
        return None
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(keyword.lower() in query for keyword in keywords):
            return category
    return None


def _score_product(product: dict[str, Any], slots: dict[str, Any]) -> int:
    score = 0
    uses = slots.get("uses") or []
    for use in uses:
        if use in product["tags"]:
            score += 8
    if slots.get("recipient") and slots["recipient"] in product["tags"]:
        score += 6
    if slots.get("budget_max"):
        budget = Decimal(str(slots["budget_max"]))
        if product["price"] <= budget:
            score += 4
            if product["price"] >= budget * Decimal("0.55"):
                score += 2
    score += min(product["stock"], 20) // 10
    return score


def build_reason(product: dict[str, Any], slots: dict[str, Any]) -> str:
    reasons = []
    if slots.get("budget_max") and product["price"] <= Decimal(str(slots["budget_max"])):
        reasons.append(f"价格 {product['price']} 元在 {slots['budget_max']} 元预算内")
    for use in slots.get("uses") or []:
        if use in product["tags"]:
            reasons.append(f"标签匹配{use}场景")
    if slots.get("recipient") and slots["recipient"] in product["tags"]:
        reasons.append("外观和定位适合送女生")
    if not reasons:
        reasons.append("核心参数和库存状态适合作为候选")
    return "；".join(reasons) + f"。主要卖点：{'、'.join(product['selling_points'][:3])}。"


def _spec_group(key: str) -> str:
    groups = {
        "cpu": "性能",
        "gpu": "性能",
        "memory": "性能",
        "storage": "性能",
        "screen": "屏幕",
        "battery": "续航",
        "weight": "便携",
        "camera": "影像",
    }
    return groups.get(key, "参数")


def _decision_weight(key: str) -> str:
    return "high" if key in {"gpu", "cpu", "battery", "screen", "camera"} else "medium"


def _best_for(product: dict[str, Any]) -> str:
    tags = product["tags"]
    if "游戏" in tags:
        return "适合看重游戏性能、显卡和散热的用户。"
    if "送礼" in tags:
        return "适合作为预算友好的数码礼物。"
    if "办公" in tags:
        return "适合通勤办公和学习。"
    return "适合对该品类有明确需求的用户。"


def _compare_summary(products: list[dict[str, Any]]) -> str:
    if not products:
        return "未找到可对比商品。"
    cheapest = min(products, key=lambda item: item["price"])
    strongest = max(products, key=lambda item: _score_product(item, {"uses": ["游戏"]}))
    if cheapest["id"] == strongest["id"]:
        return f"{cheapest['name']} 同时具备更低价格和较强场景匹配度，优先推荐。"
    return f"{cheapest['name']} 预算压力更小；{strongest['name']} 更适合追求性能或核心参数的用户。"
