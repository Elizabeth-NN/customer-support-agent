import json
from collections.abc import Iterator
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import StreamingResponse
from sqlalchemy import text

from app.core.auth import require_auth
from app.core.rate_limit import limiter
from app.db.session import engine
from app.schemas.chat import ChatRequest
from app.services.llm import generate_text_with_tools
from app.services.rag import retrieve_answer_context
from app.services.support_tickets import create_support_ticket


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


def build_agent_prompt(
    question: str,
    prompt: str | None,
) -> str:
    """Build the prompt Gemini uses for RAG and business tools."""

    if prompt:
        return f"""
You are a helpful customer support agent.

You have access to business knowledge and secure business tools.

Use the business knowledge below to answer the customer's question when
it contains the required information.

If the customer is asking about a specific order, customer, or other
business record, use the appropriate business tool to retrieve the
information instead of guessing.

Never invent business information.

If the available knowledge and business tools do not provide enough
information to answer the question, say that you don't have enough
information.

Business knowledge:
{prompt}

Customer question:
{question}

Answer the customer directly and concisely.
""".strip()

    return f"""
You are a helpful customer support agent.

You have access to secure business tools.

If the customer is asking about a specific order, customer, or other
business record, use the appropriate business tool to retrieve the
information.

Never invent business information.

If a business tool can answer the question, use it.

If no available business tool can answer the question, say that you
don't have enough information.

Customer question:
{question}

Answer the customer directly and concisely.
""".strip()


@router.post("")
@limiter.limit("20/minute")
def chat(
    request: Request,
    chat_request: ChatRequest,
    auth_payload: dict = Depends(require_auth),
) -> StreamingResponse:
    clerk_user_id = auth_payload.get("sub")

    if not clerk_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user ID is missing.",
        )

    business_id = get_business_id_for_user(clerk_user_id)

    def stream() -> Iterator[str]:
        try:
            prompt, sources, confident = retrieve_answer_context(
                chat_request.question,
                business_id=business_id,
            )
        except Exception:
            # Continue without retrieved knowledge. The agent may still
            # be able to answer using an authorized business tool.
            prompt, sources, confident = None, [], False

        yield (
            json.dumps(
                {
                    "type": "sources",
                    "sources": sources,
                }
            )
            + "\n"
        )

        agent_prompt = build_agent_prompt(
            question=chat_request.question,
            prompt=prompt if confident else None,
        )

        try:
            answer = generate_text_with_tools(
                agent_prompt,
                business_id=business_id,
            )
        except Exception as exc:
            escalation_reason = (
                "The support agent could not retrieve enough information "
                "to answer the question."
            )

            try:
                ticket = create_support_ticket(
                    business_id=business_id,
                    customer_question=chat_request.question,
                    escalation_reason=escalation_reason,
                )
            except Exception:
                ticket = None

            yield (
                json.dumps(
                    {
                        "type": "token",
                        "content": (
                            "I’m unable to retrieve enough information "
                            "to answer that right now."
                        ),
                    }
                )
                + "\n"
            )

            yield (
                json.dumps(
                    {
                        "type": "escalation",
                        "required": True,
                        "reason": escalation_reason,
                        "ticket_created": ticket is not None,
                        **(
                            {"ticket_id": str(ticket["id"])}
                            if ticket is not None
                            else {}
                        ),
                    }
                )
                + "\n"
            )

            yield json.dumps({"type": "done"}) + "\n"
            return

        answer_indicates_insufficient_information = (
            "don't have enough information" in answer.lower()
            or "do not have enough information" in answer.lower()
            or "i don't have enough information" in answer.lower()
        )

        if not confident and answer_indicates_insufficient_information:
            escalation_reason = (
                "The available business knowledge and business tools "
                "do not contain enough information to answer confidently."
            )

            try:
                ticket = create_support_ticket(
                    business_id=business_id,
                    customer_question=chat_request.question,
                    escalation_reason=escalation_reason,
                )
            except Exception:
                ticket = None

            yield (
                json.dumps(
                    {
                        "type": "token",
                        "content": answer,
                    }
                )
                + "\n"
            )

            yield (
                json.dumps(
                    {
                        "type": "escalation",
                        "required": True,
                        "reason": escalation_reason,
                        "ticket_created": ticket is not None,
                        **(
                            {"ticket_id": str(ticket["id"])}
                            if ticket is not None
                            else {}
                        ),
                    }
                )
                + "\n"
            )
        else:
            yield (
                json.dumps(
                    {
                        "type": "escalation",
                        "required": False,
                    }
                )
                + "\n"
            )

            yield (
                json.dumps(
                    {
                        "type": "token",
                        "content": answer,
                    }
                )
                + "\n"
            )

        yield json.dumps({"type": "done"}) + "\n"

    return StreamingResponse(
        stream(),
        media_type="application/x-ndjson",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )