
import re
import time
from uuid import UUID

from app.services.llm import generate_text
from app.services.rag import retrieve_answer_context


FALLBACK_ANSWER = (
    "I don't have enough information to answer that question."
)

STOP_WORDS = {
    "the", "and", "for", "are", "was", "were", "with", "that",
    "this", "from", "have", "has", "had", "you", "your", "our",
    "their", "they", "them", "what", "when", "where", "which",
    "will", "would", "could", "should", "can", "not", "but",
    "into", "about", "there", "here", "been", "being", "does",
    "did", "how", "why", "who", "its", "all", "any", "only",
    "using", "use", "used", "answer", "please",
}


def answer_coverage(expected_answer: str, generated_answer: str) -> float:
    """Measure lexical coverage of meaningful expected-answer terms."""
    expected_terms = {
        word
        for word in re.findall(r"[a-z0-9]+", expected_answer.lower())
        if len(word) >= 3 and word not in STOP_WORDS
    }

    if not expected_terms:
        return 1.0 if expected_answer.strip().lower() == generated_answer.strip().lower() else 0.0

    generated_terms = set(
        re.findall(r"[a-z0-9]+", generated_answer.lower())
    )

    return len(expected_terms & generated_terms) / len(expected_terms)


def source_matches(expected_source: str, sources: list[dict]) -> bool:
    """Check whether a requested source appears in the retrieved results."""
    expected = expected_source.strip().lower()

    if not expected:
        return True

    return any(
        expected in str(source.get(field) or "").lower()
        for source in sources
        for field in ("document_title", "source_uri")
    )


def evaluate_test_case(
    *,
    question: str,
    expected_answer: str,
    expected_source: str | None,
    expected_escalation: bool,
    business_id: UUID,
) -> dict:
    """Run one isolated RAG evaluation without creating support tickets."""
    started_at = time.perf_counter()

    prompt, sources, confident = retrieve_answer_context(
        question,
        business_id=business_id,
    )

    actual_escalation = prompt is None or not confident
    generation_failed = False

    if actual_escalation:
        generated_answer = FALLBACK_ANSWER
    else:
        try:
            generated_answer = generate_text(prompt)
        except Exception:
            # Keep the evaluation running without exposing provider details.
            generated_answer = "Answer generation failed."
            generation_failed = True

    duration_ms = round((time.perf_counter() - started_at) * 1000)

    coverage = answer_coverage(
        expected_answer,
        generated_answer,
    )

    source_ok = (
        source_matches(expected_source, sources)
        if expected_source
        else True
    )
    escalation_ok = actual_escalation == expected_escalation

    failure_reasons = []

    if generation_failed:
        failure_reasons.append("Answer generation failed.")
    elif coverage < 0.6:
        failure_reasons.append(
            f"Expected-answer term coverage was {coverage:.0%}; "
            "at least 60% is required."
        )

    if not source_ok:
        failure_reasons.append(
            f"Expected source '{expected_source}' was not retrieved."
        )

    if not escalation_ok:
        failure_reasons.append(
            f"Expected escalation={expected_escalation}, "
            f"but actual escalation={actual_escalation}."
        )

    return {
        "generated_answer": generated_answer,
        "retrieved_sources": sources,
        "passed": not failure_reasons,
        "expected_escalation": expected_escalation,
        "actual_escalation": actual_escalation,
        "duration_ms": duration_ms,
        "failure_reason": " ".join(failure_reasons) or None,
    }
