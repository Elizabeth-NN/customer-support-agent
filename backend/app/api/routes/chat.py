from fastapi import APIRouter, Depends, Request

from app.core.auth import require_auth
from app.core.rate_limit import limiter
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.rag import generate_answer


router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
@limiter.limit("20/minute")
def chat(
    request: Request,
    chat_request: ChatRequest,
    _: dict = Depends(require_auth),
) -> ChatResponse:
    answer = generate_answer(chat_request.question)

    return ChatResponse(answer=answer)
