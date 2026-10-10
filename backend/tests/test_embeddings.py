
from app.services.embeddings import generate_embedding


def test_generate_embedding(monkeypatch):
    expected_embedding = [0.1] * 768
    captured = {}

    def mock_generate_llm_embedding(
        text: str,
        task_type: str = "RETRIEVAL_DOCUMENT",
    ) -> list[float]:
        captured["text"] = text
        captured["task_type"] = task_type
        return expected_embedding

    monkeypatch.setattr(
        "app.services.embeddings.generate_llm_embedding",
        mock_generate_llm_embedding,
    )

    embedding = generate_embedding(
        "When is customer support available?"
    )

    assert isinstance(embedding, list)
    assert len(embedding) == 768
    assert all(isinstance(value, float) for value in embedding)
    assert captured["text"] == (
        "When is customer support available?"
    )
    assert captured["task_type"] == "RETRIEVAL_DOCUMENT"
