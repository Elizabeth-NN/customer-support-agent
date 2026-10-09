
import uuid

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    JSON,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class EvaluationRun(Base):
    __tablename__ = "evaluation_runs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    business_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("businesses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    test_case_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("evaluation_test_cases.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    generated_answer: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    retrieved_sources: Mapped[list] = mapped_column(
        JSON,
        nullable=False,
        default=list,
    )
    passed: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
    )
    expected_escalation: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
    )
    actual_escalation: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
    )
    duration_ms: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    failure_reason: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    business = relationship("Business")
    test_case = relationship(
        "EvaluationTestCase",
        back_populates="runs",
    )
