
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select, text

from app.core.auth import require_auth
from app.db.session import engine
from app.models.knowledge_document import KnowledgeDocument
from app.models.support_ticket import SupportTicket


router = APIRouter(
    prefix="/api/overview",
    tags=["overview"],
)


def get_business_id_for_user(clerk_user_id: str) -> UUID:
    """Return the business belonging to the authenticated user."""

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


@router.get("")
def get_overview(
    auth_payload: dict = Depends(require_auth),
) -> dict:
    """Return real dashboard metrics for the authenticated business."""

    clerk_user_id = auth_payload.get("sub")

    if not clerk_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user ID is missing.",
        )

    business_id = get_business_id_for_user(clerk_user_id)

    document_count_query = (
        select(func.count())
        .select_from(KnowledgeDocument)
        .where(KnowledgeDocument.business_id == business_id)
    )

    ticket_count_query = (
        select(func.count())
        .select_from(SupportTicket)
        .where(SupportTicket.business_id == business_id)
    )

    open_ticket_count_query = (
        select(func.count())
        .select_from(SupportTicket)
        .where(
            SupportTicket.business_id == business_id,
            SupportTicket.status == "open",
        )
    )

    in_progress_count_query = (
        select(func.count())
        .select_from(SupportTicket)
        .where(
            SupportTicket.business_id == business_id,
            SupportTicket.status == "in_progress",
        )
    )

    recent_tickets_query = (
        select(
            SupportTicket.id,
            SupportTicket.customer_question,
            SupportTicket.escalation_reason,
            SupportTicket.status,
            SupportTicket.created_at,
        )
        .where(SupportTicket.business_id == business_id)
        .order_by(SupportTicket.created_at.desc())
        .limit(5)
    )

    with engine.connect() as conn:
        document_count = conn.execute(
            document_count_query
        ).scalar_one()

        ticket_count = conn.execute(
            ticket_count_query
        ).scalar_one()

        open_ticket_count = conn.execute(
            open_ticket_count_query
        ).scalar_one()

        in_progress_count = conn.execute(
            in_progress_count_query
        ).scalar_one()

        recent_tickets = [
            dict(row)
            for row in conn.execute(
                recent_tickets_query
            ).mappings().all()
        ]

    return {
        "document_count": document_count,
        "ticket_count": ticket_count,
        "open_ticket_count": open_ticket_count,
        "in_progress_ticket_count": in_progress_count,
        "recent_tickets": recent_tickets,
    }
