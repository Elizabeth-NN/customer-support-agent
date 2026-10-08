from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.auth import require_auth
from app.schemas.tools import (
    CustomerLookupResponse,
    OrderLookupResponse,
)
from app.services.tools import lookup_customer, lookup_order


router = APIRouter(
    prefix="/api/tools",
    tags=["tools"],
)


def get_business_id_for_user(clerk_user_id: str) -> UUID:
    """Return the business owned by the authenticated Clerk user."""

    from sqlalchemy import text

    from app.db.session import engine

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


@router.get(
    "/orders/{order_number}",
    response_model=OrderLookupResponse,
)
def get_order(
    order_number: str,
    auth_payload: dict = Depends(require_auth),
) -> dict:
    """Look up an order belonging to the authenticated business."""

    clerk_user_id = auth_payload.get("sub")

    if not clerk_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user ID is missing.",
        )

    business_id = get_business_id_for_user(clerk_user_id)

    order = lookup_order(
        business_id=business_id,
        order_number=order_number,
    )

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found.",
        )

    return order


@router.get(
    "/customers/{identifier}",
    response_model=CustomerLookupResponse,
)
def get_customer(
    identifier: str,
    auth_payload: dict = Depends(require_auth),
) -> dict:
    """Look up a customer belonging to the authenticated business."""

    clerk_user_id = auth_payload.get("sub")

    if not clerk_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user ID is missing.",
        )

    business_id = get_business_id_for_user(clerk_user_id)

    customer = lookup_customer(
        business_id=business_id,
        identifier=identifier,
    )

    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found.",
        )

    return customer
