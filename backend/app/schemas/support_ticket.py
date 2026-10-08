from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


SupportTicketStatus = Literal[
    "open",
    "in_progress",
    "resolved",
]


class SupportTicketCreate(BaseModel):
    customer_question: str = Field(min_length=1, max_length=2000)
    escalation_reason: str = Field(min_length=1, max_length=2000)


class SupportTicketUpdate(BaseModel):
    status: SupportTicketStatus


class SupportTicketResponse(BaseModel):
    id: UUID
    business_id: UUID
    customer_question: str
    escalation_reason: str
    status: str

    model_config = {
        "from_attributes": True,
    }