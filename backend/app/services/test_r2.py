import os

import boto3
from dotenv import load_dotenv


load_dotenv()

client = boto3.client(
    "s3",
    endpoint_url=os.environ["R2_ENDPOINT_URL"],
    aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
    aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
    region_name="auto",
)

bucket = os.environ["R2_BUCKET_NAME"]

response = client.list_objects_v2(Bucket=bucket)

print("Cloudflare R2 connection: OK")
print(f"Bucket: {bucket}")
print(f"Objects: {response.get('KeyCount', 0)}")