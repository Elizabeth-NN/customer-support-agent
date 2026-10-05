from fastapi import APIRouter, Request

from app.core.config import get_settings
from app.core.rate_limit import limiter
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.rag import generate_answer


settings = get_settings()

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("")
@limiter.limit(settings.rate_limit_chat)
def chat(request: Request, chat_request: ChatRequest) -> ChatResponse:
    answer = generate_answer(chat_request.question)

    return ChatResponse(answer=answer)
