from uuid import UUID

from app.services.rag import generate_answer


TEST_BUSINESS_ID = UUID("cf1a1025-66cd-4552-b7fd-dadebb0beebe")
TEST_DOCUMENT_ID = UUID("11111111-1111-1111-1111-111111111111")
TEST_CHUNK_ID = UUID("22222222-2222-2222-2222-222222222222")


def make_chunk(distance: float) -> dict:
    return {
        "id": TEST_CHUNK_ID,
        "document_id": TEST_DOCUMENT_ID,
        "content": (
            "Customer support hours are Monday to Friday, "
            "8 AM to 5 PM."
        ),
        "chunk_index": 0,
        "document_title": "Customer Support FAQ",
        "source_type": "document",
        "source_uri": None,
        "distance": distance,
    }


def test_generate_answer_from_knowledge(monkeypatch):
    def mock_retrieve_relevant_chunks(
        question: str,
        business_id: UUID,
        limit: int = 5,
    ) -> list[dict]:
        assert question == "When is customer support available?"
        assert business_id == TEST_BUSINESS_ID
        assert limit == 5

        return [make_chunk(0.12)]

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

    assert answer == (
        "Customer support is available from Monday to Friday, "
        "8 AM to 5 PM."
    )


def test_generate_answer_escalates_when_match_is_not_confident(
    monkeypatch,
):
    def mock_retrieve_relevant_chunks(
        question: str,
        business_id: UUID,
        limit: int = 5,
    ) -> list[dict]:
        return [make_chunk(0.80)]

    def fail_generate_text(prompt: str) -> str:
        raise AssertionError(
            "LLM should not be called for low-confidence retrieval."
        )

    monkeypatch.setattr(
        "app.services.rag.retrieve_relevant_chunks",
        mock_retrieve_relevant_chunks,
    )

    monkeypatch.setattr(
        "app.services.rag.generate_text",
        fail_generate_text,
    )

    answer = generate_answer(
        "What is the status of my replacement order?",
        business_id=TEST_BUSINESS_ID,
    )

    assert answer == "I don't have enough information to answer that question."


def test_generate_answer_uses_boundary_confidence(
    monkeypatch,
):
    def mock_retrieve_relevant_chunks(
        question: str,
        business_id: UUID,
        limit: int = 5,
    ) -> list[dict]:
        return [make_chunk(0.55)]

    def mock_generate_text(prompt: str) -> str:
        return "The answer is supported by the knowledge base."

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

    assert answer == "The answer is supported by the knowledge base."