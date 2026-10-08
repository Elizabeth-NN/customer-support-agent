import pytest

from app.services.ingestion.chunking import split_text


def test_split_text_returns_empty_list_for_empty_input():
    assert split_text("") == []
    assert split_text("   ") == []


def test_split_text_preserves_short_text():
    text = "Customer support is available Monday to Friday."

    chunks = split_text(text)

    assert chunks == [text]


def test_split_text_creates_multiple_chunks():
    text = "\n\n".join(
        [
            "Paragraph one contains customer support information.",
            "Paragraph two contains information about delivery.",
            "Paragraph three contains information about returns.",
        ]
    )

    chunks = split_text(
        text,
        chunk_size=70,
        chunk_overlap=10,
    )

    assert len(chunks) > 1
    assert all(chunk.strip() for chunk in chunks)


def test_split_text_rejects_invalid_chunk_size():
    with pytest.raises(ValueError):
        split_text("Some text", chunk_size=0)


def test_split_text_rejects_invalid_overlap():
    with pytest.raises(ValueError):
        split_text(
            "Some text",
            chunk_size=100,
            chunk_overlap=100,
        )
