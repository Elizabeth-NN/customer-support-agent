from app.services.rag import generate_answer


def test_generate_answer_from_knowledge():
    answer = generate_answer(
        "When is customer support available?"
    )

    assert answer
    assert "Monday" in answer
    assert "Friday" in answer
    assert "8 AM" in answer
    assert "5 PM" in answer
