from uuid import UUID

from fastapi.testclient import TestClient

from app.core.auth import require_auth
from app.main import app


client = TestClient(app)

TEST_CLERK_USER_ID = "user_3KJyYGDtv0ysYHixbueDC8VHmLb"
TEST_BUSINESS_ID = UUID("cf1a1025-66cd-4552-b7fd-dadebb0beebe")


def fake_authenticated_user() -> dict:
    return {
        "sub": TEST_CLERK_USER_ID,
    }


def setup_authenticated_client() -> None:
    app.dependency_overrides[require_auth] = fake_authenticated_user


def teardown_authenticated_client() -> None:
    app.dependency_overrides.pop(require_auth, None)


def test_upload_document(monkeypatch):
    setup_authenticated_client()

    try:
        uploaded_files = []
        ingested_documents = []

        def mock_get_business_id(clerk_user_id: str) -> UUID:
            assert clerk_user_id == TEST_CLERK_USER_ID
            return TEST_BUSINESS_ID

        def mock_upload_file(
            file_bytes: bytes,
            object_key: str,
            content_type: str,
        ) -> str:
            uploaded_files.append(
                {
                    "file_bytes": file_bytes,
                    "object_key": object_key,
                    "content_type": content_type,
                }
            )
            return object_key

        def mock_ingest_r2_document(
            business_id: UUID,
            title: str,
            object_key: str,
        ) -> dict:
            ingested_documents.append(
                {
                    "business_id": business_id,
                    "title": title,
                    "object_key": object_key,
                }
            )

            return {
                "document_id": "11111111-1111-1111-1111-111111111111",
                "chunk_count": 2,
            }

        monkeypatch.setattr(
            "app.api.routes.documents.get_business_id_for_user",
            mock_get_business_id,
        )

        monkeypatch.setattr(
            "app.api.routes.documents.upload_file",
            mock_upload_file,
        )

        monkeypatch.setattr(
            "app.api.routes.documents.ingest_r2_document",
            mock_ingest_r2_document,
        )

        response = client.post(
            "/api/documents",
            data={
                "title": "Customer Support FAQ",
            },
            files={
                "file": (
                    "customer-support.txt",
                    b"Customer support is available Monday to Friday.",
                    "text/plain",
                ),
            },
        )

        assert response.status_code == 201

        data = response.json()

        assert data["document_id"] == (
            "11111111-1111-1111-1111-111111111111"
        )
        assert data["chunk_count"] == 2
        assert data["filename"] == "customer-support.txt"
        assert data["content_type"] == "text/plain"

        assert len(uploaded_files) == 1

        assert uploaded_files[0]["file_bytes"] == (
            b"Customer support is available Monday to Friday."
        )
        assert uploaded_files[0]["content_type"] == "text/plain"

        assert len(ingested_documents) == 1

        assert ingested_documents[0]["business_id"] == TEST_BUSINESS_ID
        assert ingested_documents[0]["title"] == "Customer Support FAQ"

    finally:
        teardown_authenticated_client()


def test_upload_document_requires_authentication():
    response = client.post(
        "/api/documents",
        data={
            "title": "Customer Support FAQ",
        },
        files={
            "file": (
                "customer-support.txt",
                b"Customer support information.",
                "text/plain",
            ),
        },
    )

    assert response.status_code in {401, 403}


def test_upload_document_rejects_unsupported_file_type():
    setup_authenticated_client()

    try:
        response = client.post(
            "/api/documents",
            data={
                "title": "Customer Support FAQ",
            },
            files={
                "file": (
                    "malicious.exe",
                    b"not a supported document",
                    "application/octet-stream",
                ),
            },
        )

        assert response.status_code == 415

    finally:
        teardown_authenticated_client()


def test_upload_document_rejects_empty_title():
    setup_authenticated_client()

    try:
        response = client.post(
            "/api/documents",
            data={
                "title": "   ",
            },
            files={
                "file": (
                    "customer-support.txt",
                    b"Customer support information.",
                    "text/plain",
                ),
            },
        )

        assert response.status_code == 422

    finally:
        teardown_authenticated_client()


def test_upload_document_rejects_file_over_10_mb():
    setup_authenticated_client()

    try:
        response = client.post(
            "/api/documents",
            data={
                "title": "Large Document",
            },
            files={
                "file": (
                    "large.txt",
                    b"x" * (10 * 1024 * 1024 + 1),
                    "text/plain",
                ),
            },
        )

        assert response.status_code == 413

    finally:
        teardown_authenticated_client()


def test_upload_document_cleans_up_r2_when_ingestion_fails(
    monkeypatch,
):
    setup_authenticated_client()

    try:
        deleted_files = []

        def mock_get_business_id(clerk_user_id: str) -> UUID:
            return TEST_BUSINESS_ID

        def mock_upload_file(
            file_bytes: bytes,
            object_key: str,
            content_type: str,
        ) -> str:
            return object_key

        def mock_ingest_r2_document(
            business_id: UUID,
            title: str,
            object_key: str,
        ) -> dict:
            raise ValueError("Document contains no extractable text.")

        def mock_delete_file(object_key: str) -> None:
            deleted_files.append(object_key)

        monkeypatch.setattr(
            "app.api.routes.documents.get_business_id_for_user",
            mock_get_business_id,
        )

        monkeypatch.setattr(
            "app.api.routes.documents.upload_file",
            mock_upload_file,
        )

        monkeypatch.setattr(
            "app.api.routes.documents.ingest_r2_document",
            mock_ingest_r2_document,
        )

        monkeypatch.setattr(
            "app.api.routes.documents.delete_file",
            mock_delete_file,
        )

        response = client.post(
            "/api/documents",
            data={
                "title": "Empty Document",
            },
            files={
                "file": (
                    "empty.txt",
                    b"",
                    "text/plain",
                ),
            },
        )

        assert response.status_code == 422
        assert response.json()["detail"] == (
            "Document contains no extractable text."
        )

        assert len(deleted_files) == 1
        assert deleted_files[0].startswith(
            f"businesses/{TEST_BUSINESS_ID}/documents/"
        )

    finally:
        teardown_authenticated_client()
