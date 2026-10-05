from app.services.rag import generate_answer


def test_generate_answer_from_knowledge(monkeypatch):
    def mock_generate_text(prompt: str) -> str:
        assert "Monday to Friday, 8 AM to 5 PM" in prompt
        assert "When is customer support available?" in prompt

        return "Customer support is available from Monday to Friday, 8 AM to 5 PM."

    monkeypatch.setattr(
        "app.services.rag.generate_text",
        mock_generate_text,
    )

    answer = generate_answer(
        "When is customer support available?"
    )

    assert answer
    assert "Monday" in answer
    assert "Friday" in answer
    assert "8 AM" in answer
    assert "5 PM" in answer
