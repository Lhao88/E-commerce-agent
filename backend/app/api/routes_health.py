from fastapi import APIRouter, Request

from app.core.config import get_settings
from app.core.responses import ok

router = APIRouter()


@router.get("/health")
def health(request: Request):
    settings = get_settings()
    data = {
        "status": "ok",
        "api": "ok",
        "database": "not_configured" if not settings.database_url else "ok",
        "redis": "not_configured" if not settings.redis_url else "ok",
        "version": settings.app_version,
    }
    return ok(data, request)
