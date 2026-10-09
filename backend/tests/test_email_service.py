import pytest
from starlette.testclient import TestClient
from backend.main import app
from backend.services.email_service import email_service, EmailSettings

client = TestClient(app)


def test_get_email_settings():
    res = client.get("/api/email/settings")
    assert res.status_code == 200
    data = res.json()
    assert "smtp_host" in data
    assert "smtp_port" in data
    assert "is_configured" in data


def test_update_email_settings():
    update_payload = {
        "smtp_host": "smtp.gmail.com",
        "smtp_port": 587,
        "smtp_user": "test_sender@example.com",
        "smtp_password": "app_password_1234",
        "from_email": "test_sender@example.com",
        "from_name": "Test Outbound",
        "use_tls": True
    }
    res = client.post("/api/email/settings", json=update_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["smtp_user"] == "test_sender@example.com"
    assert data["smtp_password"] == "••••••••"  # Password masked
    assert data["is_configured"] is True


def test_send_email_mocked_or_logged(monkeypatch):
    # Mock _connect_smtp to prevent actual external network call during unit tests
    class MockSMTP:
        def __init__(self, *args, **kwargs):
            pass
        def ehlo(self):
            pass
        def starttls(self):
            pass
        def login(self, user, pwd):
            pass
        def send_message(self, msg):
            pass
        def quit(self):
            pass

    monkeypatch.setattr(email_service, "_connect_smtp", lambda cfg: MockSMTP())

    send_payload = {
        "to_email": "buyer@targetcompany.example",
        "subject": "Verified Buying Trigger: Team Scaling",
        "body": "Hi there,\n\nNoticed your hiring signals. DealSignal AI can help.\n\nBest,\nAlex",
        "company_name": "Target Company",
        "campaign_name": "Q4 Enterprise"
    }

    res = client.post("/api/email/send", json=send_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["to_email"] == "buyer@targetcompany.example"
    assert "message_id" in data


def test_batch_send_emails(monkeypatch):
    class MockSMTP:
        def __init__(self, *args, **kwargs):
            pass
        def ehlo(self):
            pass
        def starttls(self):
            pass
        def login(self, user, pwd):
            pass
        def send_message(self, msg):
            pass
        def quit(self):
            pass

    monkeypatch.setattr(email_service, "_connect_smtp", lambda cfg: MockSMTP())

    batch_payload = {
        "campaign_name": "Batch Q4",
        "emails": [
            {
                "to_email": "lead1@example.com",
                "subject": "Subject 1",
                "body": "Body 1",
                "company_name": "Company 1"
            },
            {
                "to_email": "lead2@example.com",
                "subject": "Subject 2",
                "body": "Body 2",
                "company_name": "Company 2"
            }
        ]
    }

    res = client.post("/api/email/batch-send", json=batch_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 2
    assert data["sent"] == 2
    assert data["failed"] == 0


def test_get_email_logs():
    res = client.get("/api/email/logs?limit=5")
    assert res.status_code == 200
    logs = res.json()
    assert isinstance(logs, list)
