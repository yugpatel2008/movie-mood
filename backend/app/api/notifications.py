from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.database import get_db
from app.models.user import User
from app.schemas.notification import NotificationResponse, UnreadCountResponse
from app.core.security import get_current_user
from app.services import notification_service

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=List[NotificationResponse])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve in-app notifications for the authenticated user."""
    # Check for new TVmaze content recommendations
    notification_service.check_and_generate_new_content_notifications(db)
    return notification_service.get_user_notifications(db, current_user.id)


@router.get("/unread-count", response_model=UnreadCountResponse)
def get_unread_notification_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get total unread notification count for the authenticated user."""
    count = notification_service.get_unread_count(db, current_user.id)
    return UnreadCountResponse(count=count)


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark a single notification as read."""
    notif = notification_service.mark_notification_as_read(db, current_user.id, notification_id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notif


@router.patch("/read-all")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark all notifications as read for the authenticated user."""
    updated_count = notification_service.mark_all_notifications_as_read(db, current_user.id)
    return {"message": "All notifications marked as read", "updated_count": updated_count}
