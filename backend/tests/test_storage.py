import uuid

from app.services.storage import delete_file, download_file, upload_file


def test_r2_file_lifecycle():
    object_key = f"tests/{uuid.uuid4()}.txt"
    content = b"Customer support test document."

    upload_file(
        file_bytes=content,
        object_key=object_key,
        content_type="text/plain",
    )

    downloaded = download_file(object_key)

    assert downloaded == content

    delete_file(object_key)
