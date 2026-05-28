from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Digital Shopping Guide Agent"
    app_version: str = "0.1.0"
    database_url: Optional[str] = None
    redis_url: Optional[str] = None
    qwen_api_key: Optional[str] = None
    qwen_base_url: str = "https://dashscope.aliyuncs.com/compatible-mode/v1"
    qwen_model_name: str = "qwen3.6-plus"
    deepseek_api_key: Optional[str] = None
    deepseek_base_url: str = "https://api.deepseek.com"
    deepseek_model_name: str = "deepseek-v4-flash"
    model_timeout_seconds: int = 15

    model_config = SettingsConfigDict(env_file=".env", env_prefix="APP_", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
