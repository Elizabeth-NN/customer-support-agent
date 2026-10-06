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


def test_chat_endpoint(monkeypatch):
    setup_authenticated_client()

    try:
        def mock_generate_answer(
            question: str,
            business_id: UUID,
            limit: int = 5,
        ) -> str:
            assert question == "When is customer support available?"
            assert business_id == TEST_BUSINESS_ID

            return (
                "Customer support is available from Monday to Friday, "
                "8 AM to 5 PM."
            )

        monkeypatch.setattr(
            "app.api.routes.chat.generate_answer",
            mock_generate_answer,
        )

        response = client.post(
            "/api/chat",
            json={"question": "When is customer support available?"},
        )

        assert response.status_code == 200
        assert response.json() == {
            "answer": (
                "Customer support is available from Monday to Friday, "
                "8 AM to 5 PM."
            )
        }
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

        def mock_generate_answer(
            question: str,
            business_id: UUID,
            limit: int = 5,
        ) -> str:
            assert business_id == TEST_BUSINESS_ID

            return (
                "Customer support is available from Monday to Friday, "
                "8 AM to 5 PM."
            )

        monkeypatch.setattr(
            "app.api.routes.chat.generate_answer",
            mock_generate_answer,
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
