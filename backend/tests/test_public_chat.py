import json
from uuid import UUID

from fastapi import HTTPException
from fastapi.testclient import TestClient

from app.main import app
from app.api.routes import public_chat as public_chat_module


client = TestClient(app)

TEST_WIDGET_ID = "test-public-widget-token"
TEST_BUSINESS_ID = UUID("cf1a1025-66cd-4552-b7fd-dadebb0beebe")


def fake_business(**overrides):
    business = {
        "id": TEST_BUSINESS_ID,
        "name": "Example Business",
        "assistant_name": "Alex",
        "welcome_message": "Welcome! How can I help?",
        "fallback_message": (
            "I don't have enough information to answer that question."
        ),
        "escalate_on_low_confidence": True,
    }
    business.update(overrides)
    return business


def parse_events(response):
    return [
        json.loads(line)
        for line in response.text.splitlines()
        if line.strip()
    ]


def test_public_widget_config_requires_no_login(monkeypatch):
    monkeypatch.setattr(
        public_chat_module,
        "get_public_business",
        lambda widget_id: fake_business(),
    )

    response = client.get(f"/api/public/{TEST_WIDGET_ID}")

    assert response.status_code == 200
    assert response.json() == {
        "business_name": "Example Business",
        "assistant_name": "Alex",
        "welcome_message": "Welcome! How can I help?",
    }

    # Private business details must not be returned.
    assert "support_email" not in response.json()
    assert "clerk_user_id" not in response.json()
    assert "id" not in response.json()


def test_unknown_public_widget_returns_404(monkeypatch):
    def missing_business(widget_id):
        raise HTTPException(
            status_code=404,
            detail="Chat widget not found.",
        )

    monkeypatch.setattr(
        public_chat_module,
        "get_public_business",
        missing_business,
    )

    response = client.get("/api/public/unknown-widget")

    assert response.status_code == 404


def test_public_chat_uses_published_knowledge_only(monkeypatch):
    monkeypatch.setattr(
        public_chat_module,
        "get_public_business",
        lambda widget_id: fake_business(),
    )

    def mock_retrieve_answer_context(
        question,
        business_id,
        limit=5,
        public_only=False,
    ):
        assert question == "What are your support hours?"
        assert business_id == TEST_BUSINESS_ID
        assert public_only is True

        return (
            "Support is available Monday to Friday, 8 AM to 5 PM.",
            [
                {
                    "document_id": "private-document-id",
                    "document_title": "Support FAQ",
                    "source_type": "document",
                    "source_uri": "private://internal/path",
                    "chunk_id": "private-chunk-id",
                    "distance": 0.12,
                    "content": "Private chunk content",
                }
            ],
            True,
        )

    def mock_generate_text(prompt):
        assert "Example Business" in prompt
        assert "Alex" in prompt
        assert "What are your support hours?" in prompt
        return "We are available Monday to Friday, 8 AM to 5 PM."

    def fail_ticket_creation(**kwargs):
        raise AssertionError("No ticket should be created for a confident answer.")

    monkeypatch.setattr(
        public_chat_module,
        "retrieve_answer_context",
        mock_retrieve_answer_context,
    )
    monkeypatch.setattr(
        public_chat_module,
        "generate_text",
        mock_generate_text,
    )
    monkeypatch.setattr(
        public_chat_module,
        "create_support_ticket",
        fail_ticket_creation,
    )

    response = client.post(
        f"/api/public/{TEST_WIDGET_ID}/chat",
        json={"question": "What are your support hours?"},
    )

    assert response.status_code == 200
    assert response.headers["content-type"].startswith(
        "application/x-ndjson"
    )

    events = parse_events(response)

    assert events[0]["type"] == "sources"
    assert events[0]["sources"] == [
        {
            "document_title": "Support FAQ",
            "source_type": "document",
        }
    ]

    # No private IDs, file paths, chunk content, or similarity scores.
    serialized_events = response.text
    assert "private-document-id" not in serialized_events
    assert "private-chunk-id" not in serialized_events
    assert "private://internal/path" not in serialized_events
    assert "Private chunk content" not in serialized_events
    assert '"distance"' not in serialized_events

    token_events = [
        event for event in events if event["type"] == "token"
    ]
    assert token_events[0]["content"] == (
        "We are available Monday to Friday, 8 AM to 5 PM."
    )

    assert events[-1]["type"] == "done"


def test_public_chat_escalates_without_exposing_ticket_id(monkeypatch):
    monkeypatch.setattr(
        public_chat_module,
        "get_public_business",
        lambda widget_id: fake_business(),
    )

    def mock_retrieve_answer_context(
        question,
        business_id,
        limit=5,
        public_only=False,
    ):
        assert public_only is True
        return None, [], False

    created_tickets = []

    def mock_create_support_ticket(
        business_id,
        customer_question,
        escalation_reason,
    ):
        created_tickets.append({
            "business_id": business_id,
            "customer_question": customer_question,
            "escalation_reason": escalation_reason,
        })
        return {"id": UUID("33333333-3333-3333-3333-333333333333")}

    def fail_generate_text(prompt):
        raise AssertionError(
            "The LLM must not run without confident knowledge."
        )

    monkeypatch.setattr(
        public_chat_module,
        "retrieve_answer_context",
        mock_retrieve_answer_context,
    )
    monkeypatch.setattr(
        public_chat_module,
        "create_support_ticket",
        mock_create_support_ticket,
    )
    monkeypatch.setattr(
        public_chat_module,
        "generate_text",
        fail_generate_text,
    )

    response = client.post(
        f"/api/public/{TEST_WIDGET_ID}/chat",
        json={"question": "Where is my order?"},
    )

    assert response.status_code == 200

    events = parse_events(response)

    assert events[0] == {"type": "sources", "sources": []}
    assert events[1]["type"] == "token"
    assert "enough information" in events[1]["content"].lower()

    escalation = next(
        event for event in events if event["type"] == "escalation"
    )
    assert escalation["required"] is True
    assert escalation["ticket_created"] is True
    assert "ticket_id" not in escalation

    assert len(created_tickets) == 1
    assert created_tickets[0]["business_id"] == TEST_BUSINESS_ID
    assert created_tickets[0]["customer_question"] == "Where is my order?"

    assert "33333333-3333-3333-3333-333333333333" not in response.text
    assert events[-1]["type"] == "done"


def test_public_chat_rejects_empty_question(monkeypatch):
    monkeypatch.setattr(
        public_chat_module,
        "get_public_business",
        lambda widget_id: fake_business(),
    )

    response = client.post(
        f"/api/public/{TEST_WIDGET_ID}/chat",
        json={"question": "   "},
    )

    assert response.status_code == 422


def test_public_chat_does_not_escalate_when_disabled(monkeypatch):
    monkeypatch.setattr(
        public_chat_module,
        "get_public_business",
        lambda widget_id: fake_business(
            escalate_on_low_confidence=False,
        ),
    )

    monkeypatch.setattr(
        public_chat_module,
        "retrieve_answer_context",
        lambda *args, **kwargs: (None, [], False),
    )

    def fail_ticket_creation(**kwargs):
        raise AssertionError("Escalation is disabled for this business.")

    monkeypatch.setattr(
        public_chat_module,
        "create_support_ticket",
        fail_ticket_creation,
    )

    response = client.post(
        f"/api/public/{TEST_WIDGET_ID}/chat",
        json={"question": "Where is my order?"},
    )

    assert response.status_code == 200

    events = parse_events(response)
    escalation = next(
        event for event in events if event["type"] == "escalation"
    )

    assert escalation["required"] is False
    assert escalation["ticket_created"] is False
    assert events[-1]["type"] == "done"
