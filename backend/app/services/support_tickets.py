from uuid import UUID, uuid4

from sqlalchemy import insert, select

from app.db.session import engine
from app.models.support_ticket import SupportTicket


def create_support_ticket(
    business_id: UUID,
    customer_question: str,
    escalation_reason: str,
) -> dict:
    """Create an open support ticket for a business."""

    ticket_id = uuid4()

    statement = (
        insert(SupportTicket)
        .values(
            id=ticket_id,
            business_id=business_id,
            customer_question=customer_question,
            escalation_reason=escalation_reason,
            status="open",
        )
        .returning(
            SupportTicket.id,
            SupportTicket.business_id,
            SupportTicket.customer_question,
            SupportTicket.escalation_reason,
            SupportTicket.status,
        )
    )

    with engine.begin() as conn:
        row = conn.execute(statement).mappings().one()

    return dict(row)


def list_support_tickets(
    business_id: UUID,
) -> list[dict]:
    """Return support tickets belonging to a business, newest first."""

    statement = (
        select(
            SupportTicket.id,
            SupportTicket.business_id,
            SupportTicket.customer_question,
            SupportTicket.escalation_reason,
            SupportTicket.status,
        )
        .where(SupportTicket.business_id == business_id)
        .order_by(SupportTicket.created_at.desc())
    )

    with engine.connect() as conn:
        rows = conn.execute(statement).mappings().all()

    return [dict(row) for row in rows]
