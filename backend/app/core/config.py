from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str

    r2_endpoint_url: str
    r2_access_key_id: str
    r2_secret_access_key: str
    r2_bucket_name: str

    llm_provider: str = "ollama"
    llm_base_url: str = "http://localhost:11434"
    llm_embedding_model: str = "nomic-embed-text"
    llm_chat_model: str = "qwen3:1.7b"
    llm_thinking: bool = False
    llm_timeout: float = 180.0

    app_env: str = "development"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()