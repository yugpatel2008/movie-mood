"""
Notification service for MovieMood.
Handles creating, deduplicating, fetching, and reading personalized in-app notifications.
"""

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.user import User
from app.models.review import Review
from app.models.notification import Notification
from app.services.preference_service import get_interested_genres
from app.services.tvmaze_service import get_shows, get_show


def format_matched_genres_string(genres: list[str]) -> str:
    """Formats a list of matched genres into a clean readable string (e.g. 'Crime & Thriller')."""
    if not genres:
        return ""
    if len(genres) == 1:
        return genres[0]
    if len(genres) == 2:
        return f"{genres[0]} & {genres[1]}"
    return f"{', '.join(genres[:-1])} & {genres[-1]}"


def generate_recommendations_for_shows(db: Session, shows: list[dict]) -> int:
    """
    Evaluates candidate shows from TVmaze against all active users' genre preferences.
    Creates deduplicated in-app notifications for users whose preferences match the show genres.
    """
    if not shows:
        return 0

    # Get users with notifications enabled
    active_users = db.query(User).filter(User.notifications_enabled == True).all()
    if not active_users:
        return 0

    created_count = 0

    for user in active_users:
        interested_genres = get_interested_genres(db, user.id, threshold=2)
        if not interested_genres:
            continue

        # Get set of movie_ids user has already reviewed
        reviewed_show_ids = set(
            r[0] for r in db.query(Review.movie_id).filter(Review.user_id == user.id).all()
        )

        # Get set of show_ids already notified to user
        notified_show_ids = set(
            n[0] for n in db.query(Notification.external_movie_id).filter(Notification.user_id == user.id).all()
        )

        for show in shows:
            show_id = show.get("id")
            if not show_id:
                continue

            # Skip if user reviewed or was already notified
            if show_id in reviewed_show_ids or show_id in notified_show_ids:
                continue

            show_genres = show.get("genres", [])
            matched = [g for g in show_genres if g in interested_genres]

            if matched:
                matched_str = format_matched_genres_string(matched)
                title = show.get("title", "New Title")
                poster_url = show.get("poster_url")
                message = f"New {matched_str} title you might like: {title}"

                notif = Notification(
                    user_id=user.id,
                    external_movie_id=show_id,
                    title=title,
                    poster_url=poster_url,
                    message=message,
                    matched_genres=matched_str,
                    is_read=False,
                )
                db.add(notif)
                try:
                    db.commit()
                    notified_show_ids.add(show_id)
                    created_count += 1
                except IntegrityError:
                    db.rollback()

    return created_count


def check_and_generate_new_content_notifications(db: Session) -> int:
    """Fetches recent TVmaze shows and generates notifications for interested users."""
    shows = get_shows(page=0)
    return generate_recommendations_for_shows(db, shows)


def get_user_notifications(db: Session, user_id: int, limit: int = 50) -> list[Notification]:
    """Retrieve notifications for a user ordered by creation date descending."""
    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .limit(limit)
        .all()
    )


def get_unread_count(db: Session, user_id: int) -> int:
    """Get count of unread notifications for a user."""
    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id, Notification.is_read == False)
        .count()
    )


def mark_notification_as_read(db: Session, user_id: int, notification_id: int) -> Notification | None:
    """Mark a specific notification as read if it belongs to user_id."""
    notif = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.user_id == user_id)
        .first()
    )
    if notif:
        notif.is_read = True
        db.commit()
        db.refresh(notif)
    return notif


def mark_all_notifications_as_read(db: Session, user_id: int) -> int:
    """Mark all notifications for a user as read."""
    count = (
        db.query(Notification)
        .filter(Notification.user_id == user_id, Notification.is_read == False)
        .update({"is_read": True})
    )
    db.commit()
    return count
