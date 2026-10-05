from fastapi import APIRouter

from app.schemas.chat import ChatRequest, ChatResponse
from app.services.rag import generate_answer


router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    answer = generate_answer(request.question)

    return ChatResponse(answer=answer)
