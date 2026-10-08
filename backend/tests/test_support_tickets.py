from datetime import datetime, timezone
from uuid import UUID

from fastapi.testclient import TestClient

from app.core.auth import require_auth
from app.main import app


client = TestClient(app)

TEST_CLERK_USER_ID = "user_3KJyYGDtv0ysYHixbueDC8VHmLb"
TEST_BUSINESS_ID = UUID("cf1a1025-66cd-4552-b7fd-dadebb0beebe")

TEST_CREATED_AT = datetime(
    2026,
    10,
    1,
    10,
    0,
    0,
    tzinfo=timezone.utc,
)

TEST_UPDATED_AT = datetime(
    2026,
    10,
    1,
    10,
    30,
    0,
    tzinfo=timezone.utc,
)

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
                "created_at": TEST_CREATED_AT,
                "updated_at": TEST_UPDATED_AT,
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

def test_list_support_tickets(monkeypatch):
    setup_authenticated_client()

    try:
        def mock_get_business_id(clerk_user_id: str) -> UUID:
            assert clerk_user_id == TEST_CLERK_USER_ID
            return TEST_BUSINESS_ID

        monkeypatch.setattr(
            "app.api.routes.support_tickets.get_business_id_for_user",
            mock_get_business_id,
        )

        def mock_list_tickets(
            business_id: UUID,
        ):
            assert business_id == TEST_BUSINESS_ID

            return [
                {
                    "id": "33333333-3333-3333-3333-333333333333",
                    "business_id": str(TEST_BUSINESS_ID),
                    "customer_question": (
                        "Can I change my delivery address?"
                    ),
                    "escalation_reason": (
                        "The knowledge base does not contain "
                        "enough information."
                    ),
                    "status": "open",
                    "created_at": TEST_CREATED_AT,
                    "updated_at": TEST_UPDATED_AT,
                },
                {
                    "id": "44444444-4444-4444-4444-444444444444",
                    "business_id": str(TEST_BUSINESS_ID),
                    "customer_question": (
                        "Where is my replacement order?"
                    ),
                    "escalation_reason": (
                        "No order status information was available."
                    ),
                    "status": "open",
                    "created_at": TEST_CREATED_AT,
                    "updated_at": TEST_UPDATED_AT,
                },
            ]

        monkeypatch.setattr(
            "app.api.routes.support_tickets.list_support_tickets",
            mock_list_tickets,
        )

        response = client.get("/api/support-tickets")

        assert response.status_code == 200

        data = response.json()

        assert len(data) == 2

        assert data[0]["id"] == (
            "33333333-3333-3333-3333-333333333333"
        )
        assert data[0]["business_id"] == str(TEST_BUSINESS_ID)
        assert data[0]["status"] == "open"

        assert data[1]["id"] == (
            "44444444-4444-4444-4444-444444444444"
        )
        assert data[1]["business_id"] == str(TEST_BUSINESS_ID)

    finally:
        teardown_authenticated_client()

def test_list_support_tickets_requires_authentication():
    response = client.get("/api/support-tickets")

    assert response.status_code in {401, 403}

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

def test_get_support_ticket(monkeypatch):
    setup_authenticated_client()

    try:
        ticket_id = UUID(
            "33333333-3333-3333-3333-333333333333"
        )

        def mock_get_business_id(clerk_user_id: str) -> UUID:
            assert clerk_user_id == TEST_CLERK_USER_ID
            return TEST_BUSINESS_ID

        monkeypatch.setattr(
            "app.api.routes.support_tickets.get_business_id_for_user",
            mock_get_business_id,
        )

        def mock_get_ticket(
            business_id: UUID,
            ticket_id: UUID,
        ):
            assert business_id == TEST_BUSINESS_ID
            assert ticket_id == UUID(
                "33333333-3333-3333-3333-333333333333"
            )

            return {
                "id": str(ticket_id),
                "business_id": str(TEST_BUSINESS_ID),
                "customer_question": (
                    "Can I change my delivery address?"
                ),
                "escalation_reason": (
                    "The knowledge base does not contain "
                    "enough information."
                ),
                "status": "open",
                "created_at": TEST_CREATED_AT,
                "updated_at": TEST_UPDATED_AT,
            }

        monkeypatch.setattr(
            "app.api.routes.support_tickets.get_support_ticket",
            mock_get_ticket,
        )

        response = client.get(
            "/api/support-tickets/"
            "33333333-3333-3333-3333-333333333333"
        )

        assert response.status_code == 200

        data = response.json()

        assert data["id"] == (
            "33333333-3333-3333-3333-333333333333"
        )
        assert data["business_id"] == str(TEST_BUSINESS_ID)
        assert data["customer_question"] == (
            "Can I change my delivery address?"
        )
        assert data["status"] == "open"

    finally:
        teardown_authenticated_client()


def test_get_support_ticket_not_found(monkeypatch):
    setup_authenticated_client()

    try:
        ticket_id = UUID(
            "44444444-4444-4444-4444-444444444444"
        )

        monkeypatch.setattr(
            "app.api.routes.support_tickets.get_business_id_for_user",
            lambda clerk_user_id: TEST_BUSINESS_ID,
        )

        monkeypatch.setattr(
            "app.api.routes.support_tickets.get_support_ticket",
            lambda business_id, ticket_id: None,
        )

        response = client.get(
            "/api/support-tickets/"
            "44444444-4444-4444-4444-444444444444"
        )

        assert response.status_code == 404
        assert response.json()["detail"] == (
            "Support ticket not found."
        )

    finally:
        teardown_authenticated_client()


def test_get_support_ticket_requires_authentication():
    response = client.get(
        "/api/support-tickets/"
        "33333333-3333-3333-3333-333333333333"
    )

    assert response.status_code in {401, 403}

def test_update_support_ticket_status(monkeypatch):
    setup_authenticated_client()

    try:
        ticket_id = UUID(
            "33333333-3333-3333-3333-333333333333"
        )

        def mock_get_business_id(clerk_user_id: str) -> UUID:
            assert clerk_user_id == TEST_CLERK_USER_ID
            return TEST_BUSINESS_ID

        monkeypatch.setattr(
            "app.api.routes.support_tickets.get_business_id_for_user",
            mock_get_business_id,
        )

        def mock_update_ticket(
            business_id: UUID,
            ticket_id: UUID,
            status: str,
        ):
            assert business_id == TEST_BUSINESS_ID
            assert ticket_id == UUID(
                "33333333-3333-3333-3333-333333333333"
            )
            assert status == "in_progress"

            return {
                "id": str(ticket_id),
                "business_id": str(TEST_BUSINESS_ID),
                "customer_question": (
                    "Can I change my delivery address?"
                ),
                "escalation_reason": (
                    "The knowledge base does not contain "
                    "enough information."
                ),
                "status": "in_progress",
                "created_at": TEST_CREATED_AT,
                "updated_at": TEST_UPDATED_AT,
            }

        monkeypatch.setattr(
            "app.api.routes.support_tickets."
            "update_support_ticket_status",
            mock_update_ticket,
        )

        response = client.patch(
            "/api/support-tickets/"
            "33333333-3333-3333-3333-333333333333",
            json={"status": "in_progress"},
        )

        assert response.status_code == 200

        data = response.json()

        assert data["id"] == (
            "33333333-3333-3333-3333-333333333333"
        )
        assert data["business_id"] == str(TEST_BUSINESS_ID)
        assert data["status"] == "in_progress"

    finally:
        teardown_authenticated_client()


def test_update_support_ticket_rejects_invalid_status():
    setup_authenticated_client()

    try:
        response = client.patch(
            "/api/support-tickets/"
            "33333333-3333-3333-3333-333333333333",
            json={"status": "closed"},
        )

        assert response.status_code == 422

    finally:
        teardown_authenticated_client()


def test_update_support_ticket_not_found(monkeypatch):
    setup_authenticated_client()

    try:
        ticket_id = UUID(
            "44444444-4444-4444-4444-444444444444"
        )

        monkeypatch.setattr(
            "app.api.routes.support_tickets."
            "get_business_id_for_user",
            lambda clerk_user_id: TEST_BUSINESS_ID,
        )

        monkeypatch.setattr(
            "app.api.routes.support_tickets."
            "update_support_ticket_status",
            lambda business_id, ticket_id, status: None,
        )

        response = client.patch(
            "/api/support-tickets/"
            "44444444-4444-4444-4444-444444444444",
            json={"status": "resolved"},
        )

        assert response.status_code == 404
        assert response.json()["detail"] == (
            "Support ticket not found."
        )

    finally:
        teardown_authenticated_client()

