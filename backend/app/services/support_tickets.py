from uuid import UUID, uuid4

from sqlalchemy import insert

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
