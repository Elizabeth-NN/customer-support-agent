from uuid import UUID

from app.services.rag import generate_answer


TEST_BUSINESS_ID = UUID("cf1a1025-66cd-4552-b7fd-dadebb0beebe")


def test_generate_answer_from_knowledge(monkeypatch):
    def mock_retrieve_relevant_chunks(
        question: str,
        business_id: UUID,
        limit: int = 5,
    ) -> list[dict]:
        assert question == "When is customer support available?"
        assert business_id == TEST_BUSINESS_ID

        return [
            {
                "content": (
                    "Customer support hours are Monday to Friday, "
                    "8 AM to 5 PM."
                )
            }
        ]

    def mock_generate_text(prompt: str) -> str:
        assert "Monday to Friday, 8 AM to 5 PM" in prompt
        assert "When is customer support available?" in prompt

        return (
            "Customer support is available from Monday to Friday, "
            "8 AM to 5 PM."
        )

    monkeypatch.setattr(
        "app.services.rag.retrieve_relevant_chunks",
        mock_retrieve_relevant_chunks,
    )

    monkeypatch.setattr(
        "app.services.rag.generate_text",
        mock_generate_text,
    )

    answer = generate_answer(
        "When is customer support available?",
        business_id=TEST_BUSINESS_ID,
    )

    assert answer
    assert "Monday" in answer
    assert "Friday" in answer
    assert "8 AM" in answer
    assert "5 PM" in answer
