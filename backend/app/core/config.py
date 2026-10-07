from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str

    r2_endpoint_url: str
    r2_access_key_id: str
    r2_secret_access_key: str
    r2_bucket_name: str

    # Clerk
    clerk_secret_key: str
    clerk_jwt_key: str
    clerk_authorized_parties: list[str] = ["http://localhost:3000"]

    # LLM
    llm_provider: str = "ollama"

    # Ollama
    llm_base_url: str = "http://localhost:11434"
    llm_embedding_model: str = "nomic-embed-text"
    llm_chat_model: str = "qwen3:1.7b"
    llm_thinking: bool = False

    # Gemini
    gemini_api_key: str = ""
    gemini_model: str = "gemini-3.1-flash-lite"

    llm_timeout: float = 180.0

    app_env: str = "development"

    # Rate limiting
    rate_limit_enabled: bool = True
    rate_limit_chat: str = "20/minute"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @field_validator("clerk_authorized_parties", mode="before")
    @classmethod
    def parse_authorized_parties(cls, value):
        if isinstance(value, str):
            return [
                origin.strip()
                for origin in value.split(",")
                if origin.strip()
            ]

        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()