import json
from uuid import UUID

from fastapi.testclient import TestClient

from app.core.auth import require_auth
from app.main import app


client = TestClient(app)

TEST_CLERK_USER_ID = "user_3KJyYGDtv0ysYHixbueDC8VHmLb"
TEST_BUSINESS_ID = UUID("cf1a1025-66cd-4552-b7fd-dadebb0beebe")


def fake_authenticated_user() -> dict:
    return {
        "sub": TEST_CLERK_USER_ID,
    }


def setup_authenticated_client() -> None:
    app.dependency_overrides[require_auth] = fake_authenticated_user


def teardown_authenticated_client() -> None:
    app.dependency_overrides.pop(require_auth, None)


def test_create_support_ticket(monkeypatch):
    setup_authenticated_client()

    try:
        def mock_get_business_id(clerk_user_id: str) -> UUID:
            assert clerk_user_id == TEST_CLERK_USER_ID
            return TEST_BUSINESS_ID

        monkeypatch.setattr(
            "app.api.routes.support_tickets.get_business_id_for_user",
            mock_get_business_id,
        )

        def mock_create_ticket(
            business_id: UUID,
            customer_question: str,
            escalation_reason: str,
        ):
            assert business_id == TEST_BUSINESS_ID
            assert customer_question == (
                "Can I change my delivery address?"
            )
            assert escalation_reason == (
                "The knowledge base does not contain enough information."
            )

            return {
                "id": "33333333-3333-3333-3333-333333333333",
                "business_id": str(TEST_BUSINESS_ID),
                "customer_question": customer_question,
                "escalation_reason": escalation_reason,
                "status": "open",
            }

        monkeypatch.setattr(
            "app.api.routes.support_tickets.create_support_ticket",
            mock_create_ticket,
        )

        response = client.post(
            "/api/support-tickets",
            json={
                "customer_question": "Can I change my delivery address?",
                "escalation_reason": (
                    "The knowledge base does not contain enough information."
                ),
            },
        )

        assert response.status_code == 201

        data = response.json()

        assert data["id"] == (
            "33333333-3333-3333-3333-333333333333"
        )
        assert data["business_id"] == str(TEST_BUSINESS_ID)
        assert data["customer_question"] == (
            "Can I change my delivery address?"
        )
        assert data["escalation_reason"] == (
            "The knowledge base does not contain enough information."
        )
        assert data["status"] == "open"

    finally:
        teardown_authenticated_client()


def test_create_support_ticket_requires_authentication():
    response = client.post(
        "/api/support-tickets",
        json={
            "customer_question": "Can I change my delivery address?",
            "escalation_reason": "Insufficient knowledge.",
        },
    )

    assert response.status_code in {401, 403}


def test_create_support_ticket_rejects_empty_question():
    setup_authenticated_client()

    try:
        response = client.post(
            "/api/support-tickets",
            json={
                "customer_question": "",
                "escalation_reason": "Insufficient knowledge.",
            },
        )

        assert response.status_code == 422

    finally:
        teardown_authenticated_client()


def test_create_support_ticket_rejects_empty_reason():
    setup_authenticated_client()

    try:
        response = client.post(
            "/api/support-tickets",
            json={
                "customer_question": "Can I change my delivery address?",
                "escalation_reason": "",
            },
        )

        assert response.status_code == 422

    finally:
        teardown_authenticated_client()
