from uuid import uuid4

from app.services import evaluations


def test_answer_coverage_returns_one_for_matching_answer():
    expected = "Customers can track orders using their order number."
    generated = "Customers can track orders using their order number."
    assert evaluations.answer_coverage(expected, generated) == 1.0


def test_answer_coverage_returns_zero_for_unrelated_answer():
    expected = "Customers can track orders using their order number."
    generated = "Our office is open on weekdays."
    assert evaluations.answer_coverage(expected, generated) == 0.0


def test_source_matches_document_title():
    sources = [
        {
            "document_title": "Customer Order Tracking Guide",
            "source_uri": None,
        }
    ]
    assert evaluations.source_matches("order tracking", sources) is True


def test_source_matches_returns_false_when_source_is_missing():
    sources = [
        {
            "document_title": "Returns Policy",
            "source_uri": "https://example.com/returns",
        }
    ]
    assert evaluations.source_matches("order tracking", sources) is False


def test_evaluate_test_case_passes_with_expected_answer_and_source(monkeypatch):
    monkeypatch.setattr(
        evaluations,
        "retrieve_answer_context",
        lambda question, business_id: (
            "A grounded prompt",
            [
                {
                    "document_id": str(uuid4()),
                    "document_title": "Order Tracking Guide",
                    "source_uri": None,
                    "chunk_id": str(uuid4()),
                    "chunk_index": 0,
                    "distance": 0.2,
                    "content": "Customers can track orders using their order number.",
                    "source_type": "faq",
                }
            ],
            True,
        ),
    )
    monkeypatch.setattr(
        evaluations,
        "generate_text",
        lambda prompt: "Customers can track orders using their order number.",
    )

    result = evaluations.evaluate_test_case(
        question="How can I track my order?",
        expected_answer="Customers can track orders using their order number.",
        expected_source="Order Tracking Guide",
        expected_escalation=False,
        business_id=uuid4(),
    )

    assert result["passed"] is True
    assert result["actual_escalation"] is False
    assert result["failure_reason"] is None
    assert result["duration_ms"] >= 0


def test_evaluate_test_case_escalates_when_context_is_not_confident(monkeypatch):
    def unexpected_generation(prompt):
        raise AssertionError("The LLM must not run without confident context.")

    monkeypatch.setattr(
        evaluations,
        "retrieve_answer_context",
        lambda question, business_id: (None, [], False),
    )
    monkeypatch.setattr(evaluations, "generate_text", unexpected_generation)

    result = evaluations.evaluate_test_case(
        question="What is my order status?",
        expected_answer="I don't have enough information to answer that question.",
        expected_source=None,
        expected_escalation=True,
        business_id=uuid4(),
    )

    assert result["passed"] is True
    assert result["actual_escalation"] is True
    assert result["retrieved_sources"] == []


def test_evaluate_test_case_records_generation_failure(monkeypatch):
    monkeypatch.setattr(
        evaluations,
        "retrieve_answer_context",
        lambda question, business_id: ("A grounded prompt", [], True),
    )

    def failing_generation(prompt):
        raise RuntimeError("Simulated LLM failure")

    monkeypatch.setattr(evaluations, "generate_text", failing_generation)

    result = evaluations.evaluate_test_case(
        question="How can I track my order?",
        expected_answer="Customers can track orders using their order number.",
        expected_source=None,
        expected_escalation=False,
        business_id=uuid4(),
    )

    assert result["passed"] is False
    assert result["generated_answer"] == "Answer generation failed."
    assert "Answer generation failed." in result["failure_reason"]
