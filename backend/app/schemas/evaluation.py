
from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class EvaluationTestCaseCreate(BaseModel):
    question: str = Field(min_length=1, max_length=2000)
    expected_answer: str = Field(min_length=1, max_length=5000)
    expected_source: str | None = Field(default=None, max_length=500)
    expected_escalation: bool = False

    @field_validator("question", "expected_answer")
    @classmethod
    def validate_non_empty_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field cannot be empty.")
        return value

    @field_validator("expected_source")
    @classmethod
    def validate_expected_source(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None


class EvaluationTestCaseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    question: str
    expected_answer: str
    expected_source: str | None
    expected_escalation: bool
    created_at: datetime
    updated_at: datetime


class EvaluationRunResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    test_case_id: UUID
    generated_answer: str
    retrieved_sources: list[dict[str, Any]]
    passed: bool
    expected_escalation: bool
    actual_escalation: bool
    duration_ms: int
    failure_reason: str | None
    created_at: datetime
