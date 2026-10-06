from uuid import UUID

from app.services.retrieval import retrieve_relevant_chunks


TEST_BUSINESS_ID = UUID("cf1a1025-66cd-4552-b7fd-dadebb0beebe")


def test_retrieve_relevant_chunks():
    results = retrieve_relevant_chunks(
        "When is customer support available?",
        business_id=TEST_BUSINESS_ID,
        limit=3,
    )

    assert len(results) > 0

    top_result = results[0]

    assert "content" in top_result
    assert "distance" in top_result
    assert "customer support hours" in top_result["content"].lower()
