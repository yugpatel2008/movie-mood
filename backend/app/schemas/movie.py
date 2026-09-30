from pydantic import BaseModel
from typing import Optional

class MovieResponse(BaseModel):
    id: int
    title: str
    poster_url: Optional[str] = None
    description: Optional[str] = None
    genre: Optional[str] = None
    release_year: Optional[int] = None
    average_rating: Optional[float] = None
    total_reviews: int = 0
    external_rating: Optional[float] = None
    language: Optional[str] = None
    status: Optional[str] = None

class MovieDetailResponse(MovieResponse):
    positive_percentage: float = 0.0
    negative_percentage: float = 0.0
    summary: Optional[str] = None
    release_date: Optional[str] = None
