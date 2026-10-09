
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, text

from app.core.auth import require_auth
from app.db.session import engine
from app.models.evaluation_run import EvaluationRun
from app.models.evaluation_test_case import EvaluationTestCase
from app.schemas.evaluation import (
    EvaluationRunResponse,
    EvaluationTestCaseCreate,
    EvaluationTestCaseResponse,
)


router = APIRouter(
    prefix="/api/evaluations",
    tags=["evaluations"],
)


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


def get_authenticated_business_id(auth_payload: dict) -> UUID:
    clerk_user_id = auth_payload.get("sub")

    if not clerk_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user ID is missing.",
        )

    return get_business_id_for_user(clerk_user_id)


@router.get(
    "/test-cases",
    response_model=list[EvaluationTestCaseResponse],
)
def list_test_cases(
    auth_payload: dict = Depends(require_auth),
) -> list[EvaluationTestCase]:
    business_id = get_authenticated_business_id(auth_payload)

    with engine.connect() as conn:
        return list(
            conn.execute(
                select(EvaluationTestCase)
                .where(EvaluationTestCase.business_id == business_id)
                .order_by(EvaluationTestCase.created_at.desc())
            ).scalars().all()
        )


@router.post(
    "/test-cases",
    response_model=EvaluationTestCaseResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_test_case(
    test_case: EvaluationTestCaseCreate,
    auth_payload: dict = Depends(require_auth),
) -> EvaluationTestCase:
    business_id = get_authenticated_business_id(auth_payload)

    new_test_case = EvaluationTestCase(
        business_id=business_id,
        question=test_case.question,
        expected_answer=test_case.expected_answer,
        expected_source=test_case.expected_source,
        expected_escalation=test_case.expected_escalation,
    )

    with engine.begin() as conn:
        conn.add(new_test_case)

    return new_test_case


@router.delete(
    "/test-cases/{test_case_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_test_case(
    test_case_id: UUID,
    auth_payload: dict = Depends(require_auth),
) -> None:
    business_id = get_authenticated_business_id(auth_payload)

    with engine.begin() as conn:
        test_case = conn.execute(
            select(EvaluationTestCase).where(
                EvaluationTestCase.id == test_case_id,
                EvaluationTestCase.business_id == business_id,
            )
        ).scalar_one_or_none()

        if test_case is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Evaluation test case not found.",
            )

        conn.delete(test_case)


@router.get(
    "/runs",
    response_model=list[EvaluationRunResponse],
)
def list_evaluation_runs(
    auth_payload: dict = Depends(require_auth),
) -> list[EvaluationRun]:
    business_id = get_authenticated_business_id(auth_payload)

    with engine.connect() as conn:
        return list(
            conn.execute(
                select(EvaluationRun)
                .where(EvaluationRun.business_id == business_id)
                .order_by(EvaluationRun.created_at.desc())
                .limit(100)
            ).scalars().all()
        )
