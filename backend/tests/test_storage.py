
from unittest.mock import MagicMock

from app.services.storage import (
    delete_file,
    download_file,
    upload_file,
)


def test_r2_file_lifecycle(monkeypatch):
    object_key = "tests/customer-support-test.txt"
    content = b"Customer support test document."

    mock_client = MagicMock()
    mock_client.get_object.return_value = {
        "Body": MagicMock()
    }
    mock_client.get_object.return_value["Body"].read.return_value = (
        content
    )

    monkeypatch.setattr(
        "app.services.storage.get_r2_client",
        lambda: mock_client,
    )

    uploaded_key = upload_file(
        file_bytes=content,
        object_key=object_key,
        content_type="text/plain",
    )

    assert uploaded_key == object_key

    mock_client.put_object.assert_called_once_with(
        Bucket=__import__(
            "app.services.storage",
            fromlist=["settings"],
        ).settings.r2_bucket_name,
        Key=object_key,
        Body=content,
        ContentType="text/plain",
    )

    downloaded = download_file(object_key)

    assert downloaded == content

    mock_client.get_object.assert_called_once()

    delete_file(object_key)

    mock_client.delete_object.assert_called_once()
