from fastapi.testclient import TestClient

from app.core.auth import require_auth
from app.main import app


client = TestClient(app)


def fake_authenticated_user() -> dict:
    return {
        "sub": "test_user_123",
    }


def setup_authenticated_client() -> None:
    app.dependency_overrides[require_auth] = fake_authenticated_user


def teardown_authenticated_client() -> None:
    app.dependency_overrides.pop(require_auth, None)


def test_chat_endpoint(monkeypatch):
    setup_authenticated_client()

    try:
        def mock_generate_answer(question: str, limit: int = 5) -> str:
            assert question == "When is customer support available?"
            return "Customer support is available from Monday to Friday, 8 AM to 5 PM."

        monkeypatch.setattr(
            "app.api.routes.chat.generate_answer",
            mock_generate_answer,
        )

        response = client.post(
            "/api/chat",
            json={"question": "When is customer support available?"},
        )

        assert response.status_code == 200

        data = response.json()

        assert data == {
            "answer": "Customer support is available from Monday to Friday, 8 AM to 5 PM."
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

        def mock_generate_answer(question: str, limit: int = 5) -> str:
            return "Customer support is available from Monday to Friday, 8 AM to 5 PM."

        monkeypatch.setattr(
            "app.api.routes.chat.generate_answer",
            mock_generate_answer,
        )

        # Clear requests made by previous tests.
        limiter._storage.reset()

        responses = []

        for _ in range(21):
            responses.append(
                client.post(
                    "/api/chat",
                    json={"question": "When is customer support available?"},
                )
            )

        assert all(response.status_code == 200 for response in responses[:20])
        assert responses[20].status_code == 429

    finally:
        limiter._storage.reset()
        teardown_authenticated_client()
