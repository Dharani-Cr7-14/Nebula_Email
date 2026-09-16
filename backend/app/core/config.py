from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/auth/google/callback"
    FRONTEND_URL: str = "http://localhost:5173"
    JWT_SECRET: str = "change_me_in_production"
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    
    # Scopes needed for the application
    GMAIL_SCOPES: list[str] = [
        "openid",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.send",
        "https://www.googleapis.com/auth/gmail.modify"
    ]

    class Config:
        env_file = ".env"

settings = Settings()
