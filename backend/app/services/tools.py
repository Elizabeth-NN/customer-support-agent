from uuid import UUID

from sqlalchemy import or_, select

from app.db.session import engine
from app.models.customer import Customer
from app.models.order import Order


def lookup_order(
    business_id: UUID,
    order_number: str,
) -> dict | None:
    """Look up an order belonging to a business."""

    statement = (
        select(
            Order.id,
            Order.order_number,
            Order.status,
            Order.total_amount,
            Order.currency,
            Order.created_at,
            Order.updated_at,
            Customer.id.label("customer_id"),
            Customer.name.label("customer_name"),
            Customer.email.label("customer_email"),
            Customer.phone.label("customer_phone"),
        )
        .join(Customer, Order.customer_id == Customer.id)
        .where(
            Order.business_id == business_id,
            Order.order_number == order_number,
        )
    )

    with engine.connect() as conn:
        row = conn.execute(statement).mappings().one_or_none()

    if row is None:
        return None

    return dict(row)


def lookup_customer(
    business_id: UUID,
    identifier: str,
) -> dict | None:
    """Look up a customer belonging to a business.

    The identifier may be an external customer ID, email address,
    or phone number.
    """

    statement = (
        select(
            Customer.id,
            Customer.external_id,
            Customer.name,
            Customer.email,
            Customer.phone,
            Customer.created_at,
            Customer.updated_at,
        )
        .where(
            Customer.business_id == business_id,
            or_(
                Customer.external_id == identifier,
                Customer.email == identifier,
                Customer.phone == identifier,
            ),
        )
    )

    with engine.connect() as conn:
        row = conn.execute(statement).mappings().one_or_none()

    if row is None:
        return None

    return dict(row)
