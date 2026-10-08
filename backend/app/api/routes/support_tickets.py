from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text

from app.core.auth import require_auth
from app.db.session import engine
from app.schemas.support_ticket import (
    SupportTicketCreate,
    SupportTicketResponse,
)
from app.services.support_tickets import create_support_ticket


router = APIRouter(
    prefix="/api/support-tickets",
    tags=["support-tickets"],
)


def get_business_id_for_user(clerk_user_id: str) -> UUID:
    """Return the business owned by the authenticated Clerk user."""

    with engine.connect() as conn:
        business_id = conn.execute(
            text(
                """
                SELECT id
                FROM businesses
                WHERE clerk_user_id = :clerk_user_id
                """
            ),
            {"clerk_user_id": clerk_user_id},
        ).scalar_one_or_none()

    if business_id is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No business is associated with this account.",
        )

    return business_id


@router.post(
    "",
    response_model=SupportTicketResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_ticket(
    ticket: SupportTicketCreate,
    auth_payload: dict = Depends(require_auth),
) -> dict:
    clerk_user_id = auth_payload.get("sub")

    if not clerk_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user ID is missing.",
        )

    business_id = get_business_id_for_user(clerk_user_id)

    return create_support_ticket(
        business_id=business_id,
        customer_question=ticket.customer_question,
        escalation_reason=ticket.escalation_reason,
    )
