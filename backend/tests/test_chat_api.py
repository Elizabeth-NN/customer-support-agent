
import json
from uuid import UUID

from fastapi.testclient import TestClient

from app.core.auth import require_auth
from app.main import app


client = TestClient(app)

TEST_CLERK_USER_ID = "user_3KJyYGDtv0ysYHixbueDC8VHmLb"
TEST_BUSINESS_ID = UUID("cf1a1025-66cd-4552-b7fd-dadebb0beebe")
TEST_DOCUMENT_ID = UUID("11111111-1111-1111-1111-111111111111")
TEST_CHUNK_ID = UUID("22222222-2222-2222-2222-222222222222")


def fake_authenticated_user() -> dict:
    return {
        "sub": TEST_CLERK_USER_ID,
    }


def setup_authenticated_client() -> None:
    app.dependency_overrides[require_auth] = fake_authenticated_user


def teardown_authenticated_client() -> None:
    app.dependency_overrides.pop(require_auth, None)


def test_chat_endpoint(monkeypatch):
    setup_authenticated_client()

    try:

        def mock_retrieve_answer_context(
            question: str,
            business_id: UUID,
            limit: int = 5,
        ):
            assert question == "When is customer support available?"
            assert business_id == TEST_BUSINESS_ID
            assert limit == 5

            return (
                "mock grounded prompt",
                [
                    {
                        "document_id": str(TEST_DOCUMENT_ID),
                        "document_title": "Customer Support FAQ",
                        "source_type": "document",
                        "source_uri": None,
                        "chunk_id": str(TEST_CHUNK_ID),
                        "chunk_index": 0,
                        "distance": 0.12,
                        "content": (
                            "Customer support hours are Monday to Friday, "
                            "8 AM to 5 PM."
                        ),
                    }
                ],
                True,
            )

        def mock_generate_text_with_tools(
            prompt: str,
            business_id: UUID,
        ):
            assert "When is customer support available?" in prompt
            assert business_id == TEST_BUSINESS_ID

            return (
                "Customer support is available "
                "from Monday to Friday, "
                "8 AM to 5 PM."
            )

        monkeypatch.setattr(
            "app.api.routes.chat.retrieve_answer_context",
            mock_retrieve_answer_context,
        )

        monkeypatch.setattr(
            "app.api.routes.chat.generate_text_with_tools",
            mock_generate_text_with_tools,
        )

        response = client.post(
            "/api/chat",
            json={"question": "When is customer support available?"},
        )

        assert response.status_code == 200
        assert response.headers["content-type"].startswith(
            "application/x-ndjson"
        )

        lines = [
            line
            for line in response.text.splitlines()
            if line.strip()
        ]

        events = [json.loads(line) for line in lines]

        assert events[0]["type"] == "sources"
        assert len(events[0]["sources"]) == 1

        source = events[0]["sources"][0]

        assert source["document_id"] == str(TEST_DOCUMENT_ID)
        assert source["document_title"] == "Customer Support FAQ"
        assert source["chunk_id"] == str(TEST_CHUNK_ID)
        assert source["distance"] == 0.12
        assert source["content"] == (
            "Customer support hours are Monday to Friday, "
            "8 AM to 5 PM."
        )

        escalation_events = [
            event
            for event in events
            if event["type"] == "escalation"
        ]

        assert len(escalation_events) == 1
        assert escalation_events[0]["required"] is False

        token_events = [
            event
            for event in events
            if event["type"] == "token"
        ]

        answer = "".join(
            event["content"]
            for event in token_events
        )

        assert answer == (
            "Customer support is available "
            "from Monday to Friday, "
            "8 AM to 5 PM."
        )

        assert events[-1]["type"] == "done"

    finally:
        teardown_authenticated_client()

def test_chat_creates_support_ticket_on_low_confidence(monkeypatch):
    setup_authenticated_client()

    try:
        def mock_retrieve_answer_context(
            question: str,
            business_id: UUID,
            limit: int = 5,
        ):
            assert question == "What is the status of my replacement order?"
            assert business_id == TEST_BUSINESS_ID

            return (
                None,
                [],
                False,
            )

        def mock_create_support_ticket(
            business_id: UUID,
            customer_question: str,
            escalation_reason: str,
        ):
            assert business_id == TEST_BUSINESS_ID
            assert customer_question == (
                "What is the status of my replacement order?"
            )
            assert escalation_reason == (
                "The available business knowledge "
                "and business tools do not contain "
                "enough information to answer confidently."
            )

            return {
                "id": UUID("33333333-3333-3333-3333-333333333333"),
                "business_id": TEST_BUSINESS_ID,
                "customer_question": customer_question,
                "escalation_reason": escalation_reason,
                "status": "open",
            }

        def mock_generate_text_with_tools(
            prompt: str,
            business_id: UUID,
        ):
            assert business_id == TEST_BUSINESS_ID

            return "I don't have enough information to answer that question."

        monkeypatch.setattr(
            "app.api.routes.chat.retrieve_answer_context",
            mock_retrieve_answer_context,
        )

        monkeypatch.setattr(
            "app.api.routes.chat.create_support_ticket",
            mock_create_support_ticket,
        )

        monkeypatch.setattr(
            "app.api.routes.chat.generate_text_with_tools",
            mock_generate_text_with_tools,
        )

        response = client.post(
            "/api/chat",
            json={
                "question": (
                    "What is the status of my replacement order?"
                )
            },
        )

        assert response.status_code == 200
        assert response.headers["content-type"].startswith(
            "application/x-ndjson"
        )

        lines = [
            line
            for line in response.text.splitlines()
            if line.strip()
        ]

        events = [json.loads(line) for line in lines]

        assert events[0]["type"] == "sources"
        assert events[0]["sources"] == []

        token_events = [
            event
            for event in events
            if event["type"] == "token"
        ]

        assert len(token_events) == 1
        assert token_events[0]["content"] == (
            "I don't have enough information "
            "to answer that question."
        )

        escalation_events = [
            event
            for event in events
            if event["type"] == "escalation"
        ]

        assert len(escalation_events) == 1

        escalation = escalation_events[0]

        assert escalation["required"] is True
        assert escalation["reason"] == (
            "The available business knowledge "
            "and business tools do not contain "
            "enough information to answer confidently."
        )
        assert escalation["ticket_id"] == (
            "33333333-3333-3333-3333-333333333333"
        )
        assert escalation["ticket_created"] is True

        assert events[-1]["type"] == "done"

    finally:
        teardown_authenticated_client()

def test_chat_rejects_empty_question():
    setup_authenticated_client()

    try:
        response = client.post(
            "/api/chat",
            json={"question": ""},
        )

        assert response.status_code == 422

    finally:
        teardown_authenticated_client()


def test_chat_rejects_whitespace_question():
    setup_authenticated_client()

    try:
        response = client.post(
            "/api/chat",
            json={"question": "   "},
        )

        assert response.status_code == 422

    finally:
        teardown_authenticated_client()


def test_chat_rejects_question_over_2000_characters():
    setup_authenticated_client()

    try:
        response = client.post(
            "/api/chat",
            json={"question": "a" * 2001},
        )

        assert response.status_code == 422

    finally:
        teardown_authenticated_client()


def test_chat_rate_limit(monkeypatch):
    setup_authenticated_client()

    try:
        from app.core.rate_limit import limiter

        def mock_retrieve_answer_context(
            question: str,
            business_id: UUID,
            limit: int = 5,
        ):
            return (
                "mock grounded prompt",
                [
                    {
                        "document_id": str(TEST_DOCUMENT_ID),
                        "document_title": "Customer Support FAQ",
                        "source_type": "document",
                        "source_uri": None,
                        "chunk_id": str(TEST_CHUNK_ID),
                        "chunk_index": 0,
                        "distance": 0.12,
                        "content": (
                            "Customer support hours are Monday to Friday, "
                            "8 AM to 5 PM."
                        ),
                    }
                ],
                True,
            )

        def mock_generate_text_with_tools(
            prompt: str,
            business_id: UUID,
        ):
            assert "When is customer support available?" in prompt
            assert business_id == TEST_BUSINESS_ID

            return (
                "Customer support is available "
                "from Monday to Friday, "
                "8 AM to 5 PM."
            )

        monkeypatch.setattr(
            "app.api.routes.chat.retrieve_answer_context",
            mock_retrieve_answer_context,
        )

        monkeypatch.setattr(
            "app.api.routes.chat.generate_text_with_tools",
            mock_generate_text_with_tools,
        )

        limiter._storage.reset()

        responses = []

        for _ in range(21):
            responses.append(
                client.post(
                    "/api/chat",
                    json={
                        "question": "When is customer support available?"
                    },
                )
            )

        assert all(
            response.status_code == 200
            for response in responses[:20]
        )

        assert responses[20].status_code == 429

    finally:
        limiter._storage.reset()
        teardown_authenticated_client()


def test_chat_continues_when_retrieval_fails(monkeypatch):
    setup_authenticated_client()

    try:
        def mock_retrieve_answer_context(*args, **kwargs):
            raise RuntimeError("private database error")

        def mock_generate_text_with_tools(prompt, business_id):
            assert "When does support open?" in prompt
            assert business_id == TEST_BUSINESS_ID
            return "Support opens at 8 AM."

        monkeypatch.setattr(
            "app.api.routes.chat.retrieve_answer_context",
            mock_retrieve_answer_context,
        )
        monkeypatch.setattr(
            "app.api.routes.chat.generate_text_with_tools",
            mock_generate_text_with_tools,
        )

        response = client.post(
            "/api/chat",
            json={"question": "When does support open?"},
        )

        assert response.status_code == 200
        events = [
            json.loads(line)
            for line in response.text.splitlines()
            if line.strip()
        ]

        assert events[0] == {"type": "sources", "sources": []}
        assert any(
            event.get("content") == "Support opens at 8 AM."
            for event in events
        )
        assert events[-1] == {"type": "done"}
        assert "private database error" not in response.text

    finally:
        teardown_authenticated_client()


def test_chat_handles_ticket_creation_failure_after_generation_error(
    monkeypatch,
):
    setup_authenticated_client()

    try:
        monkeypatch.setattr(
            "app.api.routes.chat.retrieve_answer_context",
            lambda *args, **kwargs: (None, [], False),
        )
        monkeypatch.setattr(
            "app.api.routes.chat.generate_text_with_tools",
            lambda *args, **kwargs: (_ for _ in ()).throw(
                RuntimeError("private model error")
            ),
        )
        monkeypatch.setattr(
            "app.api.routes.chat.create_support_ticket",
            lambda *args, **kwargs: (_ for _ in ()).throw(
                RuntimeError("private ticket database error")
            ),
        )

        response = client.post(
            "/api/chat",
            json={"question": "Where is my order?"},
        )

        assert response.status_code == 200
        events = [
            json.loads(line)
            for line in response.text.splitlines()
            if line.strip()
        ]

        escalation = next(
            event for event in events if event["type"] == "escalation"
        )
        assert escalation["required"] is True
        assert escalation["ticket_created"] is False
        assert "ticket_id" not in escalation
        assert events[-1] == {"type": "done"}
        assert "private model error" not in response.text
        assert "private ticket database error" not in response.text

    finally:
        teardown_authenticated_client()


def test_chat_handles_ticket_creation_failure_on_low_confidence(
    monkeypatch,
):
    setup_authenticated_client()

    try:
        monkeypatch.setattr(
            "app.api.routes.chat.retrieve_answer_context",
            lambda *args, **kwargs: (None, [], False),
        )
        monkeypatch.setattr(
            "app.api.routes.chat.generate_text_with_tools",
            lambda *args, **kwargs: (
                "I don't have enough information to answer that question."
            ),
        )
        monkeypatch.setattr(
            "app.api.routes.chat.create_support_ticket",
            lambda *args, **kwargs: (_ for _ in ()).throw(
                RuntimeError("private ticket database error")
            ),
        )

        response = client.post(
            "/api/chat",
            json={"question": "Where is my order?"},
        )

        assert response.status_code == 200
        events = [
            json.loads(line)
            for line in response.text.splitlines()
            if line.strip()
        ]

        escalation = next(
            event for event in events if event["type"] == "escalation"
        )
        assert escalation["required"] is True
        assert escalation["ticket_created"] is False
        assert "ticket_id" not in escalation
        assert events[-1] == {"type": "done"}
        assert "private ticket database error" not in response.text

    finally:
        teardown_authenticated_client()
