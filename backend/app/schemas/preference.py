from pydantic import BaseModel
from typing import List, Optional

class GenrePreferenceResponse(BaseModel):
    genre: str
    score: int

    class Config:
        from_attributes = True

class UserPreferencesSummaryResponse(BaseModel):
    preferences: List[GenrePreferenceResponse]
    interested_genres: List[str]
    notifications_enabled: bool

class UserSettingsUpdate(BaseModel):
    notifications_enabled: bool

class UserSettingsResponse(BaseModel):
    notifications_enabled: bool
