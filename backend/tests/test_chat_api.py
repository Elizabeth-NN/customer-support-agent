from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_chat_endpoint(monkeypatch):
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
