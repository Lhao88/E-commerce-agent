from fastapi import APIRouter, Request

from app.catalog.retriever import recommend_products
from app.core.responses import ok
from app.schemas.recommendation import RecommendRequest

router = APIRouter()


@router.post("/recommend")
def recommend(payload: RecommendRequest, request: Request):
    data = recommend_products(
        payload.query,
        category=payload.category,
        brand=payload.brand,
        budget_min=payload.budget_min,
        budget_max=payload.budget_max,
        limit=payload.limit,
    )
    return ok(data, request)
