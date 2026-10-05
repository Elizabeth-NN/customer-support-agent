from fastapi import HTTPException, Request, status
from clerk_backend_api import AuthenticateRequestOptions, authenticate_request

from app.core.config import get_settings


def require_auth(request: Request) -> dict:
    settings = get_settings()

    auth_state = authenticate_request(
        request,
        AuthenticateRequestOptions(
            secret_key=settings.clerk_secret_key,
            jwt_key=settings.clerk_jwt_key,
            authorized_parties=settings.clerk_authorized_parties,
        ),
    )

    if not auth_state.is_authenticated:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return auth_state.payload or {}
