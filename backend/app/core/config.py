import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "MovieMood"
    API_PREFIX: str = "/api"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "moviemood-dev-secret-key-change-in-production")
    if ENVIRONMENT == "production" and (not os.getenv("SECRET_KEY") or SECRET_KEY == "moviemood-dev-secret-key-change-in-production"):
        raise ValueError("SECRET_KEY must be explicitly configured when ENVIRONMENT=production")

    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", str(60 * 24)))
    
    # Database URL with postgres:// -> postgresql:// conversion for Render
    _raw_db_url: str = os.getenv("DATABASE_URL", "sqlite:///./moviemood.db")
    if _raw_db_url.startswith("postgres://"):
        DATABASE_URL: str = _raw_db_url.replace("postgres://", "postgresql://", 1)
    else:
        DATABASE_URL: str = _raw_db_url
    
    # CORS
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    
    @property
    def cors_origins(self) -> list[str]:
        origins = [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174",
        ]
        if self.FRONTEND_URL:
            for item in self.FRONTEND_URL.split(","):
                cleaned = item.strip()
                if cleaned and cleaned not in origins:
                    origins.append(cleaned)
        return origins
    
    # TVmaze API Key
    TVMAZE_API_KEY: str = os.getenv("TVMAZE_API_KEY", "")

settings = Settings()
