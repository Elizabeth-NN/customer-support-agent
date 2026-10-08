from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class OrderLookupResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    order_number: str
    status: str
    total_amount: Decimal
    currency: str
    created_at: datetime
    updated_at: datetime
    customer_id: UUID
    customer_name: str
    customer_email: str
    customer_phone: str | None


class CustomerLookupResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    external_id: str | None
    name: str
    email: str
    phone: str | None
    created_at: datetime
    updated_at: datetime
