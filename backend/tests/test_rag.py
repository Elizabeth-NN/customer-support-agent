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

def test_generate_answer_returns_fallback_when_no_chunks(monkeypatch):
    def mock_retrieve_relevant_chunks(
        question: str,
        business_id: UUID,
        limit: int = 5,
    ) -> list[dict]:
        return []

    def fail_generate_text(prompt: str) -> str:
        raise AssertionError(
            "LLM should not be called when retrieval returns no chunks."
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
        "What is the status of my order?",
        business_id=TEST_BUSINESS_ID,
    )

    assert answer == "I don't have enough information to answer that question."


def test_retrieve_answer_context_preserves_source_metadata(monkeypatch):
    from app.services.rag import retrieve_answer_context

    chunk = make_chunk(0.12)

    monkeypatch.setattr(
        "app.services.rag.retrieve_relevant_chunks",
        lambda question, business_id, limit=5: [chunk],
    )

    prompt, sources, confident = retrieve_answer_context(
        "When is customer support available?",
        business_id=TEST_BUSINESS_ID,
    )

    assert confident is True
    assert prompt is not None
    assert "Monday to Friday, 8 AM to 5 PM" in prompt
    assert len(sources) == 1

    source = sources[0]
    assert source["document_id"] == str(TEST_DOCUMENT_ID)
    assert source["document_title"] == "Customer Support FAQ"
    assert source["chunk_id"] == str(TEST_CHUNK_ID)
    assert source["chunk_index"] == 0
    assert source["source_type"] == "document"
    assert source["source_uri"] is None
    assert source["distance"] == 0.12
    assert "Monday to Friday, 8 AM to 5 PM" in source["content"]
