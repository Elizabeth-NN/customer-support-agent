from uuid import UUID

from pydantic import BaseModel

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Response,
    UploadFile,
    status,
)
from sqlalchemy import text

from app.core.auth import require_auth
from app.db.session import engine
from app.services.ingestion.service import ingest_r2_document
from app.services.knowledge_documents import (
    delete_knowledge_document,
    list_knowledge_documents,
    set_document_publication,
)
from app.services.storage import delete_file, upload_file

router = APIRouter(
    prefix="/api/documents",
    tags=["documents"],
)


class DocumentPublicationUpdate(BaseModel):
    is_published: bool


ALLOWED_CONTENT_TYPES = {
    "text/plain": ".txt",
    "text/markdown": ".md",
    "application/pdf": ".pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
}


MAX_FILE_SIZE = 10 * 1024 * 1024


def get_business_id_for_user(clerk_user_id: str) -> UUID:
    """Return the business owned by the authenticated Clerk user."""

    with engine.connect() as conn:
        business_id = conn.execute(
            text(
                """
                SELECT id
                FROM businesses
                WHERE clerk_user_id = :clerk_user_id
                """
            ),
            {"clerk_user_id": clerk_user_id},
        ).scalar_one_or_none()

    if business_id is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No business is associated with this account.",
        )

    return business_id

@router.get("")
def get_documents(
    auth_payload: dict = Depends(require_auth),
) -> list[dict]:
    clerk_user_id = auth_payload.get("sub")

    if not clerk_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user ID is missing.",
        )

    business_id = get_business_id_for_user(clerk_user_id)

    return list_knowledge_documents(business_id)



@router.patch("/{document_id}/publication")
def update_document_publication(
    document_id: UUID,
    payload: DocumentPublicationUpdate,
    auth_payload: dict = Depends(require_auth),
) -> dict:
    clerk_user_id = auth_payload.get("sub")

    if not clerk_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user ID is missing.",
        )

    business_id = get_business_id_for_user(clerk_user_id)

    document = set_document_publication(
        business_id=business_id,
        document_id=document_id,
        is_published=payload.is_published,
    )

    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    return document

@router.delete(
    "/{document_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_document(
    document_id: UUID,
    auth_payload: dict = Depends(require_auth),
):
    clerk_user_id = auth_payload.get("sub")

    if not clerk_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user ID is missing.",
        )

    business_id = get_business_id_for_user(clerk_user_id)

    try:
        source_uri = delete_knowledge_document(
            business_id=business_id,
            document_id=document_id,
        )
    except ValueError as exc:
        if str(exc) == "Document not found.":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found.",
            ) from exc
        raise

    if source_uri is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
)
def upload_document(
    title: str = Form(...),
    file: UploadFile = File(...),
    auth_payload: dict = Depends(require_auth),
) -> dict:
    clerk_user_id = auth_payload.get("sub")

    if not clerk_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user ID is missing.",
        )

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=(
                "Unsupported file type. "
                "Supported types are TXT, Markdown, PDF, and DOCX."
            ),
        )

    if not title.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Document title cannot be empty.",
        )

    business_id = get_business_id_for_user(clerk_user_id)

    file_bytes = file.file.read()

    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size cannot exceed 10 MB.",
        )

   

    object_key = (
        f"businesses/{business_id}/documents/"
        f"{file.filename or 'document'}"
    )

    uploaded = False

    try:
        upload_file(
            file_bytes=file_bytes,
            object_key=object_key,
            content_type=file.content_type,
        )
        uploaded = True

        result = ingest_r2_document(
            business_id=business_id,
            title=title.strip(),
            object_key=object_key,
        )

        return {
            **result,
            "filename": file.filename,
            "content_type": file.content_type,
        }

    except ValueError as exc:
        if uploaded:
            delete_file(object_key)

        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    except Exception:
        if uploaded:
            delete_file(object_key)

        raise
