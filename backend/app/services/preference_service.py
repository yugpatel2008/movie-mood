"""
Preference service for MovieMood.
Calculates user genre preference scores based on their ratings and ML review sentiment.
Supports clean recalculation on review create, edit, or delete.
"""

from sqlalchemy.orm import Session
from app.models.review import Review
from app.models.genre_preference import UserGenrePreference
from app.services.tvmaze_service import get_show

RATING_SCORE_MAP = {
    5: 3,
    4: 2,
    3: 0,
    2: -1,
    1: -2,
}

SENTIMENT_SCORE_MAP = {
    "Positive": 1,
    "Negative": -1,
}

INTERESTED_THRESHOLD = 2


def calculate_review_genre_impact(rating: int, sentiment: str | None) -> int:
    """Calculate the net genre preference score contribution of a single review."""
    rating_impact = RATING_SCORE_MAP.get(rating, 0)
    sentiment_impact = SENTIMENT_SCORE_MAP.get(sentiment, 0) if sentiment else 0
    return rating_impact + sentiment_impact


def recalculate_user_preferences(db: Session, user_id: int) -> dict[str, int]:
    """
    Recalculates a user's entire genre preference dictionary from all active reviews.
    This idempotently replaces previous preference records to prevent editing/deleting anomalies.
    """
    user_reviews = db.query(Review).filter(Review.user_id == user_id).all()

    genre_scores: dict[str, int] = {}

    for review in user_reviews:
        impact = calculate_review_genre_impact(review.rating, review.sentiment)

        # Get show details from TVmaze to extract genres
        show = get_show(review.movie_id)
        genres = show.get("genres", []) if show else []

        for genre in genres:
            genre_name = genre.strip()
            if genre_name:
                genre_scores[genre_name] = genre_scores.get(genre_name, 0) + impact

    # Clear existing preferences for this user
    db.query(UserGenrePreference).filter(UserGenrePreference.user_id == user_id).delete()
    db.flush()

    # Save newly calculated non-zero preferences
    for genre, score in genre_scores.items():
        pref = UserGenrePreference(
            user_id=user_id,
            genre=genre,
            score=score,
        )
        db.add(pref)

    db.commit()
    return genre_scores


def get_interested_genres(db: Session, user_id: int, threshold: int = INTERESTED_THRESHOLD) -> list[str]:
    """Return list of genre names where score >= threshold for the specified user."""
    prefs = (
        db.query(UserGenrePreference)
        .filter(UserGenrePreference.user_id == user_id, UserGenrePreference.score >= threshold)
        .all()
    )
    return [p.genre for p in prefs]


def get_user_preferences(db: Session, user_id: int) -> list[UserGenrePreference]:
    """Fetch all genre preferences for a user ordered by score descending."""
    return (
        db.query(UserGenrePreference)
        .filter(UserGenrePreference.user_id == user_id)
        .order_by(UserGenrePreference.score.desc())
        .all()
    )
