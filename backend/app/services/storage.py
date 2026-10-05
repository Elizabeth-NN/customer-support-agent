import boto3

from app.core.config import get_settings


settings = get_settings()


def get_r2_client():
    """Create an S3-compatible client for Cloudflare R2."""

    return boto3.client(
        "s3",
        endpoint_url=settings.r2_endpoint_url,
        aws_access_key_id=settings.r2_access_key_id,
        aws_secret_access_key=settings.r2_secret_access_key,
        region_name="auto",
    )


def upload_file(
    file_bytes: bytes,
    object_key: str,
    content_type: str,
) -> str:
    """Upload a file to R2 and return its object key."""

    client = get_r2_client()

    client.put_object(
        Bucket=settings.r2_bucket_name,
        Key=object_key,
        Body=file_bytes,
        ContentType=content_type,
    )

    return object_key


def download_file(object_key: str) -> bytes:
    """Download a file from R2."""

    client = get_r2_client()

    response = client.get_object(
        Bucket=settings.r2_bucket_name,
        Key=object_key,
    )

    return response["Body"].read()


def delete_file(object_key: str) -> None:
    """Delete a file from R2."""

    client = get_r2_client()

    client.delete_object(
        Bucket=settings.r2_bucket_name,
        Key=object_key,
    )
