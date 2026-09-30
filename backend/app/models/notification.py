from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, UniqueConstraint
from datetime import datetime, timezone
from app.database.database import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    external_movie_id = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    poster_url = Column(String, nullable=True)
    message = Column(Text, nullable=False)
    matched_genres = Column(String, nullable=True)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("user_id", "external_movie_id", name="uq_user_external_movie_notification"),
    )
