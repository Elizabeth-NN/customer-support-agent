from decimal import Decimal
from uuid import UUID

from sqlalchemy import delete, select

from app.db.session import SessionLocal
from app.models.business import Business
from app.models.customer import Customer
from app.models.order import Order


BUSINESS_ID = UUID("cf1a1025-66cd-4552-b7fd-dadebb0beebe")


CUSTOMERS = [
    {
        "external_id": "CUS-1001",
        "name": "Sarah Wanjiku",
        "email": "sarah.wanjiku@example.com",
        "phone": "+254700100001",
    },
    {
        "external_id": "CUS-1002",
        "name": "Brian Otieno",
        "email": "brian.otieno@example.com",
        "phone": "+254700100002",
    },
    {
        "external_id": "CUS-1003",
        "name": "Amina Hassan",
        "email": "amina.hassan@example.com",
        "phone": "+254700100003",
    },
    {
        "external_id": "CUS-1004",
        "name": "David Mwangi",
        "email": "david.mwangi@example.com",
        "phone": "+254700100004",
    },
]


ORDERS = [
    {
        "order_number": "RFS-10001",
        "customer_external_id": "CUS-1001",
        "status": "processing",
        "total_amount": Decimal("12500.00"),
        "currency": "KES",
    },
    {
        "order_number": "RFS-10002",
        "customer_external_id": "CUS-1002",
        "status": "shipped",
        "total_amount": Decimal("8750.00"),
        "currency": "KES",
    },
    {
        "order_number": "RFS-10003",
        "customer_external_id": "CUS-1003",
        "status": "delivered",
        "total_amount": Decimal("15200.00"),
        "currency": "KES",
    },
    {
        "order_number": "RFS-10004",
        "customer_external_id": "CUS-1004",
        "status": "cancelled",
        "total_amount": Decimal("6400.00"),
        "currency": "KES",
    },
    {
        "order_number": "RFS-10005",
        "customer_external_id": "CUS-1001",
        "status": "delivered",
        "total_amount": Decimal("21900.00"),
        "currency": "KES",
    },
]


def seed() -> None:
    with SessionLocal() as session:
        business = session.execute(
            select(Business).where(Business.id == BUSINESS_ID)
        ).scalar_one_or_none()

        if business is None:
            raise RuntimeError(
                f"Business {BUSINESS_ID} does not exist."
            )

        print(f"Using business: {business.name}")
        print(f"Business ID: {business.id}")

        session.execute(
            delete(Order).where(Order.business_id == BUSINESS_ID)
        )

        session.execute(
            delete(Customer).where(Customer.business_id == BUSINESS_ID)
        )

        session.flush()

        customers_by_external_id = {}

        for data in CUSTOMERS:
            customer = Customer(
                business_id=BUSINESS_ID,
                external_id=data["external_id"],
                name=data["name"],
                email=data["email"],
                phone=data["phone"],
            )

            session.add(customer)
            customers_by_external_id[data["external_id"]] = customer

        session.flush()

        for data in ORDERS:
            customer = customers_by_external_id[
                data["customer_external_id"]
            ]

            order = Order(
                business_id=BUSINESS_ID,
                customer_id=customer.id,
                order_number=data["order_number"],
                status=data["status"],
                total_amount=data["total_amount"],
                currency=data["currency"],
            )

            session.add(order)

        session.commit()

        print()
        print("Demo data seeded successfully.")
        print(f"Customers: {len(CUSTOMERS)}")
        print(f"Orders:    {len(ORDERS)}")


if __name__ == "__main__":
    seed()
