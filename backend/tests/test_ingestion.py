from uuid import UUID

import pytest

from app.services.ingestion.service import (
    ingest_r2_document,
    ingest_text,
)


TEST_BUSINESS_ID = UUID(
    "cf1a1025-66cd-4552-b7fd-dadebb0beebe"
)


def test_ingest_text(monkeypatch):
    embeddings = []

    def mock_generate_embedding(text: str) -> list[float]:
        embeddings.append(text)
        return [0.1] * 768

    monkeypatch.setattr(
        "app.services.ingestion.service.generate_embedding",
        mock_generate_embedding,
    )

    result = ingest_text(
        business_id=TEST_BUSINESS_ID,
        title="Customer Support FAQ",
        text=(
            "Customer support is available Monday to Friday, "
            "8 AM to 5 PM."
        ),
    )

    assert result["business_id"] == TEST_BUSINESS_ID
    assert result["title"] == "Customer Support FAQ"
    assert result["source_type"] == "document"
    assert result["source_uri"] is None
    assert result["chunk_count"] == 1

    assert len(embeddings) == 1
    assert embeddings[0] == (
        "Customer support is available Monday to Friday, "
        "8 AM to 5 PM."
    )


def test_ingest_text_rejects_empty_text():
    with pytest.raises(ValueError, match="Cannot ingest empty text"):
        ingest_text(
            business_id=TEST_BUSINESS_ID,
            title="Empty Document",
            text="   ",
        )
def test_ingest_r2_document(monkeypatch):
    downloaded_files = []

    def mock_download_file(object_key: str) -> bytes:
        downloaded_files.append(object_key)

        return (
            b"Customer support is available "
            b"Monday to Friday, 8 AM to 5 PM."
        )

    def mock_generate_embedding(text: str) -> list[float]:
        return [0.1] * 768

    monkeypatch.setattr(
        "app.services.ingestion.service.download_file",
        mock_download_file,
    )

    monkeypatch.setattr(
        "app.services.ingestion.service.generate_embedding",
        mock_generate_embedding,
    )

    result = ingest_r2_document(
        business_id=TEST_BUSINESS_ID,
        title="Customer Support FAQ",
        object_key="documents/customer-support.txt",
    )

    assert downloaded_files == [
        "documents/customer-support.txt"
    ]

    assert result["business_id"] == TEST_BUSINESS_ID
    assert result["title"] == "Customer Support FAQ"
    assert result["source_type"] == "document"
    assert result["source_uri"] == (
        "documents/customer-support.txt"
    )
    assert result["chunk_count"] == 1

