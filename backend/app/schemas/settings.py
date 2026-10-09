from pydantic import BaseModel, Field


class SettingsUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None
    support_email: str | None
    support_phone: str | None
    assistant_name: str = Field(min_length=1, max_length=100)
    welcome_message: str = Field(min_length=1, max_length=2000)
    fallback_message: str = Field(min_length=1, max_length=2000)
    escalate_on_low_confidence: bool


class SettingsResponse(SettingsUpdate):
    pass
