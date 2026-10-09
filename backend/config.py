from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    # LLM Configuration
    OPENAI_API_KEY: str = Field(default="", description="API Key for LLM provider")
    OPENAI_BASE_URL: str = Field(default="https://api.openai.com/v1", description="API Base URL")
    LLM_MODEL: str = Field(default="gpt-4o-mini", description="Model name")
    TEST_MODE: bool = Field(default=False, description="Deterministic test/offline mode")

    # Database
    DATABASE_URL: str = "sqlite:///./dealsignal.db"

    # Security & Agent Limits
    REQUEST_TIMEOUT_SECONDS: float = 10.0
    MAX_RESPONSE_SIZE_BYTES: int = 2 * 1024 * 1024  # 2 MB
    MAX_AGENT_ITERATIONS: int = 3

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def is_llm_configured(self) -> bool:
        return bool(self.OPENAI_API_KEY and not self.TEST_MODE)


settings = Settings()
