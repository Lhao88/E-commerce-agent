from typing import Any, Optional
from uuid import uuid4

from fastapi import Request
from pydantic import BaseModel, Field


class ErrorPayload(BaseModel):
    code: str
    message: str


class ApiResponse(BaseModel):
    success: bool = True
    data: Any = Field(default_factory=dict)
    error: Optional[ErrorPayload] = None
    trace_id: str


def new_trace_id() -> str:
    return f"req_{uuid4().hex[:12]}"


def get_trace_id(request: Request) -> str:
    trace_id = getattr(request.state, "trace_id", None)
    if not trace_id:
        trace_id = new_trace_id()
        request.state.trace_id = trace_id
    return trace_id


def ok(data: Any, request: Request) -> dict[str, Any]:
    return ApiResponse(data=data, trace_id=get_trace_id(request)).model_dump()


def fail(code: str, message: str, request: Request) -> dict[str, Any]:
    return ApiResponse(
        success=False,
        data=None,
        error=ErrorPayload(code=code, message=message),
        trace_id=get_trace_id(request),
    ).model_dump()
