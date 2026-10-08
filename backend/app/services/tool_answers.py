from decimal import Decimal


def _format_amount(amount: Decimal | str | float, currency: str) -> str:
    return f"{currency} {float(amount):,.2f}"


def format_order_answer(result: dict) -> str:
    if not result["found"]:
        return (
            f"I couldn't find order {result['order_number']} "
            "in your business records."
        )

    order = result["data"]

    answer = (
        f"Order {order['order_number']} is currently "
        f"{order['status'].replace('_', ' ')}. "
        f"The total is "
        f"{_format_amount(order['total_amount'], order['currency'])}. "
        f"It belongs to {order['customer_name']}."
    )

    return answer


def format_customer_answer(result: dict) -> str:
    if not result["found"]:
        return (
            f"I couldn't find a customer matching "
            f"{result['identifier']} in your business records."
        )

    customer = result["data"]

    answer = (
        f"I found {customer['name']}. "
        f"Their email is {customer['email']}."
    )

    if customer.get("phone"):
        answer += f" Their phone number is {customer['phone']}."

    return answer
