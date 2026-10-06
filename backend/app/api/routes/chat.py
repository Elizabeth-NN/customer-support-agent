from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import text

from app.core.auth import require_auth
from app.core.rate_limit import limiter
from app.db.session import engine
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.rag import generate_answer


router = APIRouter(prefix="/api/chat", tags=["chat"])


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


@router.post("", response_model=ChatResponse)
@limiter.limit("20/minute")
def chat(
    request: Request,
    chat_request: ChatRequest,
    auth_payload: dict = Depends(require_auth),
) -> ChatResponse:
    clerk_user_id = auth_payload.get("sub")

    if not clerk_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user ID is missing.",
        )

    business_id = get_business_id_for_user(clerk_user_id)

    answer = generate_answer(
        chat_request.question,
        business_id=business_id,
    )

    return ChatResponse(answer=answer)