from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime

class ReviewCreate(BaseModel):
    rating: int
    review_text: str

    @field_validator('rating')
    @classmethod
    def validate_rating(cls, v):
        if v < 1 or v > 5:
            raise ValueError('Rating must be between 1 and 5')
        return v

    @field_validator('review_text')
    @classmethod
    def validate_review_text(cls, v):
        if len(v.strip()) < 10:
            raise ValueError('Review must be at least 10 characters')
        if len(v) > 5000:
            raise ValueError('Review must be less than 5000 characters')
        return v.strip()

class ReviewUpdate(BaseModel):
    rating: Optional[int] = None
    review_text: Optional[str] = None

    @field_validator('rating')
    @classmethod
    def validate_rating(cls, v):
        if v is not None and (v < 1 or v > 5):
            raise ValueError('Rating must be between 1 and 5')
        return v

    @field_validator('review_text')
    @classmethod
    def validate_review_text(cls, v):
        if v is not None:
            if len(v.strip()) < 10:
                raise ValueError('Review must be at least 10 characters')
            if len(v) > 5000:
                raise ValueError('Review must be less than 5000 characters')
            return v.strip()
        return v

class ReviewResponse(BaseModel):
    id: int
    movie_id: int
    user_id: int
    username: str
    rating: int
    review_text: str
    sentiment: Optional[str] = None
    confidence: Optional[float] = None
    rating_sentiment_mismatch: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserReviewResponse(ReviewResponse):
    movie_title: Optional[str] = None
    movie_poster_url: Optional[str] = None
