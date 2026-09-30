from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NotificationResponse(BaseModel):
    id: int
    external_movie_id: int
    title: str
    poster_url: Optional[str] = None
    message: str
    matched_genres: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UnreadCountResponse(BaseModel):
    count: int
