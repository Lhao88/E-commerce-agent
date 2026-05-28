from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes_chat import router as chat_router
from app.api.routes_compare import router as compare_router
from app.api.routes_feedback import router as feedback_router
from app.api.routes_handoff import router as handoff_router
from app.api.routes_health import router as health_router
from app.api.routes_recommend import router as recommend_router
from app.core.config import get_settings
from app.core.errors import AppError
from app.core.responses import fail, new_trace_id


settings = get_settings()
app = FastAPI(title=settings.app_name, version=settings.app_version)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def trace_id_middleware(request: Request, call_next):
    request.state.trace_id = request.headers.get("X-Trace-Id") or new_trace_id()
    response = await call_next(request)
    response.headers["X-Trace-Id"] = request.state.trace_id
    return response


@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError):
    return JSONResponse(
        status_code=exc.status_code,
        content=fail(exc.code, exc.message, request),
    )


@app.exception_handler(Exception)
async def unexpected_error_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content=fail("INTERNAL_ERROR", "服务暂时不可用，请稍后重试。", request),
    )


app.include_router(health_router)
app.include_router(chat_router)
app.include_router(recommend_router)
app.include_router(compare_router)
app.include_router(handoff_router)
app.include_router(feedback_router)
