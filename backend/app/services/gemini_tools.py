from collections.abc import Callable
from datetime import date, datetime
from decimal import Decimal
from typing import Any
from uuid import UUID

from google.genai import types

from app.services.tools import lookup_customer, lookup_order


def get_gemini_tools() -> list[types.Tool]:
    """Return the business tools available to Gemini."""

    return [
        types.Tool(
            function_declarations=[
                types.FunctionDeclaration(
                    name="lookup_order",
                    description=(
                        "Look up an order using its order number. "
                        "Use this when the customer asks about a specific "
                        "order, including its status, total, or customer."
                    ),
                    parameters=types.Schema(
                        type=types.Type.OBJECT,
                        properties={
                            "order_number": types.Schema(
                                type=types.Type.STRING,
                                description=(
                                    "The order number, for example "
                                    "RFS-10002."
                                ),
                            ),
                        },
                        required=["order_number"],
                    ),
                ),
                types.FunctionDeclaration(
                    name="lookup_customer",
                    description=(
                        "Look up a customer using an external customer ID, "
                        "email address, or phone number."
                    ),
                    parameters=types.Schema(
                        type=types.Type.OBJECT,
                        properties={
                            "identifier": types.Schema(
                                type=types.Type.STRING,
                                description=(
                                    "The customer's external ID, email "
                                    "address, or phone number."
                                ),
                            ),
                        },
                        required=["identifier"],
                    ),
                ),
            ]
        )
    ]


def _make_json_safe(value: Any) -> Any:
    """Convert database values into JSON-serializable Python values."""

    if isinstance(value, (UUID, Decimal)):
        return str(value)

    if isinstance(value, (datetime, date)):
        return value.isoformat()

    if isinstance(value, dict):
        return {
            str(key): _make_json_safe(item)
            for key, item in value.items()
        }

    if isinstance(value, (list, tuple)):
        return [_make_json_safe(item) for item in value]

    return value


def execute_gemini_tool(
    name: str,
    arguments: dict[str, Any],
    business_id: UUID,
) -> dict[str, Any]:
    """Execute a Gemini-requested business tool securely."""

    handlers: dict[str, Callable[..., dict | None]] = {
        "lookup_order": lookup_order,
        "lookup_customer": lookup_customer,
    }

    handler = handlers.get(name)

    if handler is None:
        raise ValueError(f"Unknown Gemini tool: {name}")

    result = handler(
        business_id=business_id,
        **arguments,
    )

    if result is None:
        return {
            "found": False,
            "tool": name,
        }

    return {
        "found": True,
        "tool": name,
        "data": _make_json_safe(result),
    }