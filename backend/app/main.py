from fastapi import FastAPI
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler


from app.api.routes import (
    chat_router,
    documents_router,
    overview_router,
    support_tickets_router,
    tools_router,
    evaluations_router,
    settings_router,
    public_chat_router,
)

from app.core.observability import RequestLoggingMiddleware

from app.core.rate_limit import limiter


app = FastAPI(
    title="Customer Support Agent API",
    version="0.1.0",
)


app.add_middleware(RequestLoggingMiddleware)


app.state.limiter = limiter
app.add_exception_handler(
    RateLimitExceeded,
    _rate_limit_exceeded_handler,
)

app.include_router(chat_router)
app.include_router(support_tickets_router)
app.include_router(documents_router)
app.include_router(tools_router)
app.include_router(overview_router)
app.include_router(evaluations_router)
app.include_router(settings_router)
app.include_router(public_chat_router)

@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
