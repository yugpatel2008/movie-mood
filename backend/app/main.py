from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.database import create_tables
from app.api import auth, movies, reviews, notifications, preferences
from app.models.user import User
from app.models.review import Review
from app.models.genre_preference import UserGenrePreference
from app.models.notification import Notification
from app.ml.predict import load_model

app = FastAPI(title=settings.PROJECT_NAME, docs_url="/api/docs", openapi_url="/api/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(movies.router, prefix=settings.API_PREFIX)
app.include_router(reviews.router, prefix=settings.API_PREFIX)
app.include_router(notifications.router, prefix=settings.API_PREFIX)
app.include_router(preferences.router, prefix=settings.API_PREFIX)


@app.on_event("startup")
def startup():
    create_tables()
    load_model()
    print("MovieMood started — TVmaze API & Personalized Genre Notifications active")


@app.get("/")
@app.head("/")
def root():
    return {"message": "MovieMood Backend API is running", "docs": "/api/docs"}


@app.get("/health")
@app.get("/api/health")
def health_check():
    return {"status": "ok", "project": settings.PROJECT_NAME}
