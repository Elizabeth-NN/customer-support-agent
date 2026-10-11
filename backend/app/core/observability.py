import json
import logging
import re
import time
from uuid import uuid4


logger = logging.getLogger("app.request")

REQUEST_ID_PATTERN = re.compile(r"^[A-Za-z0-9._-]{1,64}$")
UUID_PATTERN = re.compile(
    r"[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-"
    r"[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-"
    r"[0-9a-fA-F]{12}"
)


def get_request_id(scope: dict) -> str:
    """Reuse a safe incoming request ID or generate a new one."""

    headers = dict(scope.get("headers", []))
    incoming = headers.get(b"x-request-id", b"").decode(
        "latin-1"
    ).strip()

    if REQUEST_ID_PATTERN.fullmatch(incoming):
        return incoming

    return str(uuid4())


def safe_path(scope: dict) -> str:
    """Prefer the framework route template over raw dynamic URL values."""

    route = scope.get("route")
    route_template = getattr(route, "path", None)

    if route_template:
        return route_template

    path = scope.get("path", "/")
    path = re.sub(
        r"(?<=/api/public/)[^/]+",
        "{widget_id}",
        path,
    )
    return UUID_PATTERN.sub("{id}", path)


class RequestLoggingMiddleware:
    """Log one privacy-conscious event per HTTP request."""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        request_id = get_request_id(scope)
        scope.setdefault("state", {})["request_id"] = request_id

        started_at = time.perf_counter()
        status_code = 500
        response_started = False
        logged = False
        error_type = None

        def log_request():
            nonlocal logged

            if logged:
                return

            logged = True
            event = {
                "event": "http_request_completed",
                "request_id": request_id,
                "method": scope.get("method", "UNKNOWN"),
                "path": safe_path(scope),
                "status_code": status_code,
                "duration_ms": round(
                    (time.perf_counter() - started_at) * 1000,
                    2,
                ),
            }

            if error_type:
                event["error_type"] = error_type

            logger.info(
                json.dumps(event, separators=(",", ":"), sort_keys=True)
            )

        async def send_with_logging(message):
            nonlocal status_code, response_started

            if message["type"] == "http.response.start":
                response_started = True
                status_code = message["status"]

                headers = list(message.get("headers", []))
                headers = [
                    (name, value)
                    for name, value in headers
                    if name.lower() != b"x-request-id"
                ]
                headers.append(
                    (b"x-request-id", request_id.encode("ascii"))
                )

                message = {**message, "headers": headers}

            await send(message)

            if (
                message["type"] == "http.response.body"
                and not message.get("more_body", False)
            ):
                log_request()

        try:
            await self.app(scope, receive, send_with_logging)
        except Exception as exc:
            error_type = type(exc).__name__
            log_request()
            raise
        finally:
            if not logged:
                if not response_started:
                    status_code = 500
                log_request()
