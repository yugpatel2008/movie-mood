from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.database.database import Base

class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    poster_url = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    genre = Column(String, nullable=True)
    release_year = Column(Integer, nullable=True)

    reviews = relationship("Review", back_populates="movie")
