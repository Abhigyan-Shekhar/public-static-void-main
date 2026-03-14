from functools import lru_cache
from typing import Any

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Beyond Borders API"
    VERSION: str = "0.1.0"
    
    # Supabase (optional for demo)
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    
    # JWT / Security (mocked for demo)
    JWT_SECRET: str = "hackathon-secret-do-not-use-in-prod"
    
    # Mode
    REPO_BACKEND: str = "json" # 'json' or 'supabase'
    DEBUG: bool = True
    
    CORS_ORIGINS: list[str] = ["*"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: Any) -> Any:
        if isinstance(value, str) and value != "*":
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

@lru_cache
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
