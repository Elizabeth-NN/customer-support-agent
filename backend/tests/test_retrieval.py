from app.services.retrieval import retrieve_relevant_chunks


def test_retrieve_relevant_chunks():
    results = retrieve_relevant_chunks(
        "When is customer support available?",
        limit=3,
    )

    assert len(results) > 0

    top_result = results[0]

    assert "content" in top_result
    assert "distance" in top_result
    assert "customer support hours" in top_result["content"].lower()
