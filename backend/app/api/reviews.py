from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone
from app.database.database import get_db
from app.models.review import Review
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewUpdate, ReviewResponse, UserReviewResponse
from app.core.security import get_current_user
from app.services.sentiment_service import analyze_sentiment, check_rating_sentiment_mismatch
from app.services.tvmaze_service import get_show
from app.services.preference_service import recalculate_user_preferences
from app.services.notification_service import check_and_generate_new_content_notifications

router = APIRouter(tags=["Reviews"])


def _review_to_response(review: Review) -> ReviewResponse:
    mismatch = check_rating_sentiment_mismatch(review.rating, review.sentiment)
    return ReviewResponse(
        id=review.id,
        movie_id=review.movie_id,
        user_id=review.user_id,
        username=review.user.username,
        rating=review.rating,
        review_text=review.review_text,
        sentiment=review.sentiment,
        confidence=review.confidence,
        rating_sentiment_mismatch=mismatch,
        created_at=review.created_at,
        updated_at=review.updated_at,
    )


@router.get("/movies/{movie_id}/reviews", response_model=List[ReviewResponse])
def get_movie_reviews(movie_id: int, db: Session = Depends(get_db)):
    reviews = (
        db.query(Review)
        .filter(Review.movie_id == movie_id)
        .order_by(Review.created_at.desc())
        .all()
    )
    return [_review_to_response(r) for r in reviews]


@router.post(
    "/movies/{movie_id}/reviews",
    response_model=ReviewResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_review(
    movie_id: int,
    data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify show exists on TVmaze
    show = get_show(movie_id)
    if not show:
        raise HTTPException(status_code=404, detail="Show not found on TVmaze")

    # Check duplicate review
    existing = (
        db.query(Review)
        .filter(Review.user_id == current_user.id, Review.movie_id == movie_id)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=400,
            detail="You have already reviewed this title. Edit your existing review instead.",
        )

    # Run ML sentiment analysis
    result = analyze_sentiment(data.review_text)

    review = Review(
        movie_id=movie_id,
        user_id=current_user.id,
        rating=data.rating,
        review_text=data.review_text,
        sentiment=result["sentiment"],
        confidence=result["confidence"],
        movie_title=show["title"],
        movie_poster_url=show["poster_url"],
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    # Automatically recalculate user genre preferences and check new content notifications
    recalculate_user_preferences(db, current_user.id)
    check_and_generate_new_content_notifications(db)

    return _review_to_response(review)


@router.put("/reviews/{review_id}", response_model=ReviewResponse)
def update_review(
    review_id: int,
    data: ReviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only edit your own reviews")

    if data.rating is not None:
        review.rating = data.rating
    if data.review_text is not None:
        review.review_text = data.review_text
        # Re-run sentiment analysis on updated text
        result = analyze_sentiment(data.review_text)
        review.sentiment = result["sentiment"]
        review.confidence = result["confidence"]

    review.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(review)

    # Automatically recalculate user genre preferences and check new content notifications
    recalculate_user_preferences(db, current_user.id)
    check_and_generate_new_content_notifications(db)

    return _review_to_response(review)


@router.delete("/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own reviews")

    db.delete(review)
    db.commit()

    # Automatically recalculate user genre preferences
    recalculate_user_preferences(db, current_user.id)


@router.get("/users/me/reviews", response_model=List[UserReviewResponse])
def get_my_reviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reviews = (
        db.query(Review)
        .filter(Review.user_id == current_user.id)
        .order_by(Review.created_at.desc())
        .all()
    )
    result = []
    for r in reviews:
        mismatch = check_rating_sentiment_mismatch(r.rating, r.sentiment)
        result.append(
            UserReviewResponse(
                id=r.id,
                movie_id=r.movie_id,
                user_id=r.user_id,
                username=r.user.username,
                rating=r.rating,
                review_text=r.review_text,
                sentiment=r.sentiment,
                confidence=r.confidence,
                rating_sentiment_mismatch=mismatch,
                created_at=r.created_at,
                updated_at=r.updated_at,
                movie_title=r.movie_title,
                movie_poster_url=r.movie_poster_url,
            )
        )
    return result
