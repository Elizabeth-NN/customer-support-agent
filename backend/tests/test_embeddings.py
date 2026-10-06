from app.services.embeddings import generate_embedding


def test_generate_embedding():
    embedding = generate_embedding(
        "When is customer support available?"
    )

    assert isinstance(embedding, list)
    assert len(embedding) == 768
    assert all(isinstance(value, float) for value in embedding)
