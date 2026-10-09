import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Business(Base):
    __tablename__ = "businesses"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
    )

    clerk_user_id: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        unique=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    support_email: Mapped[str | None] = mapped_column(
        String(320),
        nullable=True,
    )

    support_phone: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    assistant_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="Support Assistant",
        server_default="Support Assistant",
    )

    welcome_message: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        default="Hi! How can I help you today?",
        server_default="Hi! How can I help you today?",
    )

    fallback_message: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        default="I don't have enough information to answer that question.",
        server_default="I don't have enough information to answer that question.",
    )

    escalate_on_low_confidence: Mapped[bool] = mapped_column(
        nullable=False,
        default=True,
        server_default="true",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    knowledge_documents = relationship(
        "KnowledgeDocument",
        back_populates="business",
        cascade="all, delete-orphan",
    )

    support_tickets = relationship(
        "SupportTicket",
        back_populates="business",
        cascade="all, delete-orphan",
    )

    customers = relationship(
        "Customer",
        back_populates="business",
        cascade="all, delete-orphan",
    )

    orders = relationship(
        "Order",
        back_populates="business",
        cascade="all, delete-orphan",
    )
