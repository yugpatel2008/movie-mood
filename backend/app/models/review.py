from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.database import Base

class Review(Base):
    __tablename__ = "reviews"
    __table_args__ = (
        UniqueConstraint('user_id', 'movie_id', name='uq_user_movie_review'),
    )

    id = Column(Integer, primary_key=True, index=True)
    movie_id = Column(Integer, nullable=False, index=True)  # TVmaze show ID (external)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    review_text = Column(Text, nullable=False)
    sentiment = Column(String, nullable=True)
    confidence = Column(Float, nullable=True)
    movie_title = Column(String, nullable=True)       # Cached from TVmaze
    movie_poster_url = Column(String, nullable=True)   # Cached from TVmaze
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="reviews")
