from pydantic import BaseModel, Field


class CompareRequest(BaseModel):
    product_ids: list[str] = Field(min_length=2, max_length=3)
