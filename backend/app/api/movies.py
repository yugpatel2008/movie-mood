from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database.database import get_db
from app.models.review import Review
from app.schemas.movie import MovieResponse, MovieDetailResponse
from app.services.tvmaze_service import get_shows, search_shows, get_show

router = APIRouter(prefix="/movies", tags=["Movies"])


@router.get("", response_model=List[MovieResponse])
def get_movies(
    search: Optional[str] = Query(None),
    page: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """List or search shows. Data comes from TVmaze; stats from MovieMood DB."""
    if search and search.strip():
        shows = search_shows(search)
    else:
        shows = get_shows(page)

    # Limit for reasonable response
    shows = shows[:48]

    result = []
    for show in shows:
        show_id = show["id"]
        reviews = db.query(Review).filter(Review.movie_id == show_id).all()
        avg_rating = None
        if reviews:
            avg_rating = round(sum(r.rating for r in reviews) / len(reviews), 1)

        result.append(MovieResponse(
            id=show_id,
            title=show["title"],
            poster_url=show["poster_url"],
            description=show["description"],
            genre=show["genre"],
            release_year=show["release_year"],
            average_rating=avg_rating,
            total_reviews=len(reviews),
            external_rating=show.get("external_rating"),
            language=show.get("language"),
            status=show.get("status"),
        ))
    return result


@router.get("/{movie_id}", response_model=MovieDetailResponse)
def get_movie(movie_id: int, db: Session = Depends(get_db)):
    """Get show details from TVmaze + MovieMood review stats."""
    show = get_show(movie_id)
    if not show:
        raise HTTPException(status_code=404, detail="Show not found on TVmaze")

    reviews = db.query(Review).filter(Review.movie_id == movie_id).all()
    avg_rating = None
    positive_pct = 0.0
    negative_pct = 0.0

    if reviews:
        avg_rating = round(sum(r.rating for r in reviews) / len(reviews), 1)
        sentiment_reviews = [r for r in reviews if r.sentiment is not None]
        if sentiment_reviews:
            pos = sum(1 for r in sentiment_reviews if r.sentiment == "Positive")
            neg = sum(1 for r in sentiment_reviews if r.sentiment == "Negative")
            total = len(sentiment_reviews)
            positive_pct = round((pos / total) * 100, 1)
            negative_pct = round((neg / total) * 100, 1)

    return MovieDetailResponse(
        id=show["id"],
        title=show["title"],
        poster_url=show["poster_url"],
        description=show["description"],
        genre=show["genre"],
        release_year=show["release_year"],
        average_rating=avg_rating,
        total_reviews=len(reviews),
        positive_percentage=positive_pct,
        negative_percentage=negative_pct,
        external_rating=show.get("external_rating"),
        language=show.get("language"),
        status=show.get("status"),
        summary=show.get("summary"),
        release_date=show.get("release_date"),
    )
