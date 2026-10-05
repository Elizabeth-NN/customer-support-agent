from fastapi import FastAPI

from app.api.routes import chat_router


app = FastAPI(
    title="Customer Support Agent API",
    version="0.1.0",
)


app.include_router(chat_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
