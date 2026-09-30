from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.user import User
from app.schemas.preference import UserPreferencesSummaryResponse, UserSettingsUpdate, UserSettingsResponse
from app.core.security import get_current_user
from app.services import preference_service

router = APIRouter(prefix="/users/me", tags=["Preferences"])


@router.get("/preferences", response_model=UserPreferencesSummaryResponse)
def get_my_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve learned genre preferences and privacy settings for the current user."""
    # Ensure preferences are recalculating from user's current reviews
    preference_service.recalculate_user_preferences(db, current_user.id)
    prefs = preference_service.get_user_preferences(db, current_user.id)
    interested = preference_service.get_interested_genres(db, current_user.id)

    return UserPreferencesSummaryResponse(
        preferences=prefs,
        interested_genres=interested,
        notifications_enabled=current_user.notifications_enabled,
    )


@router.patch("/settings", response_model=UserSettingsResponse)
def update_user_settings(
    data: UserSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Toggle personalized recommendations ON/OFF."""
    current_user.notifications_enabled = data.notifications_enabled
    db.commit()
    db.refresh(current_user)
    return {"notifications_enabled": current_user.notifications_enabled}
