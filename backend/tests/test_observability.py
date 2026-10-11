import json
import logging
import re

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def request_events(caplog):
    return [
        json.loads(record.message)
        for record in caplog.records
        if record.name == "app.request"
        and record.message.startswith("{")
    ]


def test_request_id_is_returned_and_request_is_logged(caplog):
    caplog.set_level(logging.INFO, logger="app.request")

    request_id = "observability-test-123"
    response = client.get(
        "/health?private_value=do-not-log",
        headers={"X-Request-ID": request_id},
    )

    assert response.status_code == 200
    assert response.headers["x-request-id"] == request_id

    events = request_events(caplog)
    event = next(
        item for item in events
        if item["request_id"] == request_id
    )

    assert event["event"] == "http_request_completed"
    assert event["method"] == "GET"
    assert event["path"] == "/health"
    assert event["status_code"] == 200
    assert isinstance(event["duration_ms"], (int, float))
    assert event["duration_ms"] >= 0

    assert "private_value" not in caplog.text
    assert "do-not-log" not in caplog.text


def test_invalid_request_id_is_replaced(caplog):
    caplog.set_level(logging.INFO, logger="app.request")

    response = client.get(
        "/health",
        headers={"X-Request-ID": "invalid request id"},
    )

    assert response.status_code == 200

    request_id = response.headers["x-request-id"]
    assert re.fullmatch(
        r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-"
        r"[0-9a-f]{4}-[0-9a-f]{12}",
        request_id,
    )

    events = request_events(caplog)
    assert any(
        event["request_id"] == request_id
        and event["path"] == "/health"
        for event in events
    )
