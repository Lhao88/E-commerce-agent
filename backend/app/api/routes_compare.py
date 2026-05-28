from fastapi import APIRouter, Request

from app.catalog.retriever import compare_products
from app.core.errors import AppError
from app.core.responses import ok
from app.schemas.compare import CompareRequest

router = APIRouter()


@router.post("/compare")
def compare(payload: CompareRequest, request: Request):
    data = compare_products(payload.product_ids)
    if len(data["products"]) != len(payload.product_ids):
        raise AppError("PRODUCT_NOT_FOUND", "一个或多个商品不存在。", status_code=404)
    return ok(data, request)
