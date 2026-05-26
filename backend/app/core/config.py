from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    OPENAI_API_KEY: str = ""
    RESEND_API_KEY: str = ""
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "https://aispendaudit.com"]
    FROM_EMAIL: str = "hello@aispendaudit.com"
    FRONTEND_URL: str = "https://aispendaudit.com"

    class Config:
        env_file = ".env"


settings = Settings()
