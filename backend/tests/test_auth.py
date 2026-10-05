from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_chat_requires_authentication():
    response = client.post(
        "/api/chat",
        json={"question": "When is customer support available?"},
    )

    assert response.status_code == 401
