
from app.api.routes.chat import router as chat_router
from app.api.routes.documents import router as documents_router
from app.api.routes.overview import router as overview_router
from app.api.routes.support_tickets import router as support_tickets_router
from app.api.routes.tools import router as tools_router
from app.api.routes.evaluations import router as evaluations_router


__all__ = [
    "chat_router",
    "documents_router",
    "overview_router",
    "support_tickets_router",
    "tools_router",
    "evaluations_router",
    "settings_router",
]

from app.api.routes.settings import router as settings_router
