from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select

from app.core.auth import require_auth
from app.db.session import SessionLocal
from app.models.business import Business
from app.schemas.settings import SettingsResponse, SettingsUpdate


router = APIRouter(
    prefix="/api/settings",
    tags=["settings"],
)


def get_business_for_user(clerk_user_id: str) -> Business:
    with SessionLocal() as session:
        business = session.execute(
            select(Business).where(
                Business.clerk_user_id == clerk_user_id
            )
        ).scalar_one_or_none()

        if business is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No business is associated with this account.",
            )

        # Return a detached copy with all required scalar fields loaded.
        session.expunge(business)
        return business


def get_user_id(auth_payload: dict) -> str:
    clerk_user_id = auth_payload.get("sub")

    if not clerk_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user ID is missing.",
        )

    return clerk_user_id


def serialize_settings(business: Business) -> SettingsResponse:
    return SettingsResponse(
        name=business.name,
        description=business.description,
        support_email=business.support_email,
        support_phone=business.support_phone,
        assistant_name=business.assistant_name,
        welcome_message=business.welcome_message,
        fallback_message=business.fallback_message,
        escalate_on_low_confidence=business.escalate_on_low_confidence,
    )


@router.get("", response_model=SettingsResponse)
def read_settings(
    auth_payload: dict = Depends(require_auth),
) -> SettingsResponse:
    business = get_business_for_user(get_user_id(auth_payload))
    return serialize_settings(business)


@router.put("", response_model=SettingsResponse)
def update_settings(
    payload: SettingsUpdate,
    auth_payload: dict = Depends(require_auth),
) -> SettingsResponse:
    clerk_user_id = get_user_id(auth_payload)

    with SessionLocal() as session:
        business = session.execute(
            select(Business).where(
                Business.clerk_user_id == clerk_user_id
            )
        ).scalar_one_or_none()

        if business is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No business is associated with this account.",
            )

        values = payload.model_dump()

        # Avoid saving whitespace-only values for required fields.
        values["name"] = values["name"].strip()
        values["assistant_name"] = values["assistant_name"].strip()

        if not values["name"] or not values["assistant_name"]:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Business name and assistant name cannot be empty.",
            )

        for field, value in values.items():
            if isinstance(value, str) and field in {
                "description",
                "support_email",
                "support_phone",
            }:
                value = value.strip() or None

            setattr(business, field, value)

        session.commit()
        session.refresh(business)

        return serialize_settings(business)
