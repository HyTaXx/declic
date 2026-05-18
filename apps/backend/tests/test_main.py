from pathlib import Path
import sys

from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import main


client = TestClient(main.app)


def test_send_email_returns_503_when_resend_is_not_configured(monkeypatch):
    monkeypatch.setattr(main, "RESEND_API_KEY", None)

    response = client.post(
        "/api/send-email",
        json={"email": "student@example.com", "message": "Hello from Declic"},
    )

    assert response.status_code == 503
    assert response.json() == {"detail": "Email service is not configured"}


def test_send_email_sends_message(monkeypatch):
    sent_messages = []

    def fake_send(payload):
        sent_messages.append(payload)

    monkeypatch.setattr(main, "RESEND_API_KEY", "test-key")
    monkeypatch.setattr(main.resend.Emails, "send", fake_send)

    response = client.post(
        "/api/send-email",
        json={"email": "student@example.com", "message": "Hello from Declic"},
    )

    assert response.status_code == 200
    assert response.json() == {"status": "sent"}
    assert sent_messages == [
        {
            "from": main.MAIL_FROM,
            "to": "student@example.com",
            "subject": main.MAIL_SUBJECT,
            "text": "Hello from Declic",
        }
    ]
