import os
import json
import smtplib
import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formatdate, make_msgid
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

from backend.config import settings

DATA_DIR = os.path.join(os.getcwd(), "data")
SETTINGS_FILE = os.path.join(DATA_DIR, "email_settings.json")
SENT_LOG_FILE = os.path.join(DATA_DIR, "sent_emails.json")


class EmailSettings(BaseModel):
    smtp_host: str = Field(default="smtp.gmail.com", description="SMTP server host")
    smtp_port: int = Field(default=587, description="SMTP server port")
    smtp_user: str = Field(default="", description="SMTP username or account email")
    smtp_password: str = Field(default="", description="SMTP password or app password")
    from_email: str = Field(default="", description="Sender email address")
    from_name: str = Field(default="DealSignal Outbound", description="Sender display name")
    use_tls: bool = Field(default=True, description="Enable STARTTLS encryption")
    use_ssl: bool = Field(default=False, description="Enable direct SSL encryption")
    is_configured: bool = Field(default=False, description="Whether valid SMTP credentials are set")


class SendEmailRequest(BaseModel):
    to_email: str = Field(..., description="Recipient email address")
    recipient_name: Optional[str] = Field(default=None, description="Recipient display name")
    subject: str = Field(..., description="Email subject line")
    body: str = Field(..., description="Email body in plain text")
    company_name: Optional[str] = Field(default=None, description="Target company name")
    sender_name: Optional[str] = Field(default=None, description="Sender name override")
    campaign_name: Optional[str] = Field(default=None, description="Associated campaign name")


class BatchSendEmailRequest(BaseModel):
    emails: List[SendEmailRequest] = Field(..., description="List of emails to dispatch")
    campaign_name: Optional[str] = Field(default=None, description="Campaign name for tracking")


class TestConnectionRequest(BaseModel):
    test_recipient: Optional[str] = Field(default=None, description="Optional email to send a real test message to")
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = None
    smtp_user: Optional[str] = None
    smtp_password: Optional[str] = None
    from_email: Optional[str] = None
    from_name: Optional[str] = None
    use_tls: Optional[bool] = None
    use_ssl: Optional[bool] = None


class EmailService:
    def __init__(self):
        os.makedirs(DATA_DIR, exist_ok=True)
        self._ensure_storage()

    def _ensure_storage(self):
        if not os.path.exists(SETTINGS_FILE):
            # Pre-seed from backend config or environment
            initial = EmailSettings(
                smtp_host=getattr(settings, "SMTP_HOST", "") or "smtp.gmail.com",
                smtp_port=getattr(settings, "SMTP_PORT", 587) or 587,
                smtp_user=getattr(settings, "SMTP_USER", "") or "",
                smtp_password=getattr(settings, "SMTP_PASSWORD", "") or "",
                from_email=getattr(settings, "SMTP_FROM_EMAIL", "") or "",
                from_name=getattr(settings, "SMTP_FROM_NAME", "") or "DealSignal Outbound",
                use_tls=True,
                use_ssl=False,
                is_configured=bool(getattr(settings, "SMTP_USER", "") and getattr(settings, "SMTP_PASSWORD", ""))
            )
            self._save_raw_settings(initial)

        if not os.path.exists(SENT_LOG_FILE):
            with open(SENT_LOG_FILE, "w", encoding="utf-8") as f:
                json.dump([], f)

    def _save_raw_settings(self, settings_obj: EmailSettings):
        with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
            json.dump(settings_obj.model_dump(), f, indent=2)

    def get_settings(self, mask_password: bool = True) -> EmailSettings:
        self._ensure_storage()
        try:
            with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            config = EmailSettings(**data)
            config.is_configured = bool(config.smtp_user and config.smtp_password and config.from_email)
            if mask_password and config.smtp_password:
                config.smtp_password = "••••••••"
            return config
        except Exception:
            return EmailSettings()

    def update_settings(self, new_data: Dict[str, Any]) -> EmailSettings:
        current = self.get_settings(mask_password=False)
        # Preserve existing password if masked string passed back
        pwd = new_data.get("smtp_password", "")
        if pwd == "••••••••" or not pwd:
            pwd = current.smtp_password

        updated = EmailSettings(
            smtp_host=new_data.get("smtp_host", current.smtp_host) or "smtp.gmail.com",
            smtp_port=int(new_data.get("smtp_port", current.smtp_port) or 587),
            smtp_user=new_data.get("smtp_user", current.smtp_user) or "",
            smtp_password=pwd,
            from_email=new_data.get("from_email", current.from_email) or new_data.get("smtp_user", current.smtp_user) or "",
            from_name=new_data.get("from_name", current.from_name) or "DealSignal Outbound",
            use_tls=bool(new_data.get("use_tls", current.use_tls)),
            use_ssl=bool(new_data.get("use_ssl", current.use_ssl)),
            is_configured=bool(new_data.get("smtp_user", current.smtp_user) and pwd)
        )
        self._save_raw_settings(updated)
        return self.get_settings(mask_password=True)

    def _connect_smtp(self, cfg: EmailSettings) -> smtplib.SMTP:
        if not cfg.smtp_host:
            raise ValueError("SMTP host is not defined.")

        if cfg.use_ssl or cfg.smtp_port == 465:
            server = smtplib.SMTP_SSL(cfg.smtp_host, cfg.smtp_port, timeout=12.0)
        else:
            server = smtplib.SMTP(cfg.smtp_host, cfg.smtp_port, timeout=12.0)
            server.ehlo()
            if cfg.use_tls:
                server.starttls()
                server.ehlo()

        if cfg.smtp_user and cfg.smtp_password:
            server.login(cfg.smtp_user, cfg.smtp_password)

        return server

    def test_connection(self, req: Optional[TestConnectionRequest] = None) -> Dict[str, Any]:
        cfg = self.get_settings(mask_password=False)
        if req:
            if req.smtp_host:
                cfg.smtp_host = req.smtp_host
            if req.smtp_port:
                cfg.smtp_port = req.smtp_port
            if req.smtp_user:
                cfg.smtp_user = req.smtp_user
            if req.smtp_password and req.smtp_password != "••••••••":
                cfg.smtp_password = req.smtp_password
            if req.from_email:
                cfg.from_email = req.from_email
            if req.from_name:
                cfg.from_name = req.from_name
            if req.use_tls is not None:
                cfg.use_tls = req.use_tls
            if req.use_ssl is not None:
                cfg.use_ssl = req.use_ssl

        if not cfg.smtp_user or not cfg.smtp_password:
            return {
                "success": False,
                "error": "SMTP username and password / App Password are required."
            }

        try:
            server = self._connect_smtp(cfg)
            msg_sent = False
            recipient = req.test_recipient if req and req.test_recipient else None

            if recipient and "@" in recipient:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = "DealSignal AI - Real SMTP Connection Verified"
                msg["From"] = f"{cfg.from_name} <{cfg.from_email}>"
                msg["To"] = recipient
                msg["Date"] = formatdate(localtime=True)
                msg["Message-ID"] = make_msgid(domain="dealsignal.ai")

                html_content = f"""
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #17221d; margin-top: 0;">SMTP Delivery Verified</h2>
                    <p style="color: #334155; font-size: 14px; line-height: 1.6;">
                        Your DealSignal AI email dispatch configuration has been verified.
                    </p>
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; font-size: 12px; color: #475569;">
                        <strong>SMTP Host:</strong> {cfg.smtp_host}:{cfg.smtp_port}<br>
                        <strong>Sender:</strong> {cfg.from_name} &lt;{cfg.from_email}&gt;<br>
                        <strong>Timestamp:</strong> {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
                    </div>
                </div>
                """
                msg.attach(MIMEText(html_content, "html", "utf-8"))
                server.send_message(msg)
                msg_sent = True

            server.quit()
            return {
                "success": True,
                "message": f"SMTP handshake and authentication successful{'! Test email sent to ' + recipient if msg_sent else '.'}",
                "host": cfg.smtp_host,
                "port": cfg.smtp_port,
                "from_email": cfg.from_email,
                "test_email_sent": msg_sent
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"SMTP Connection failed: {str(e)}"
            }

    def _build_mime_email(self, to_email: str, subject: str, body: str, cfg: EmailSettings, sender_name: Optional[str] = None) -> MIMEMultipart:
        from_display = sender_name or cfg.from_name or "DealSignal Outbound"
        from_header = f"{from_display} <{cfg.from_email}>"

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = from_header
        msg["To"] = to_email
        msg["Reply-To"] = cfg.from_email
        msg["Date"] = formatdate(localtime=True)
        msg["Message-ID"] = make_msgid(domain="dealsignal.ai")

        # Plain text part
        text_part = MIMEText(body, "plain", "utf-8")
        msg.attach(text_part)

        # HTML part with clean typography
        paragraphs = body.replace("\r\n", "\n").split("\n\n")
        html_paragraphs = "".join([f"<p style='margin: 0 0 14px 0; line-height: 1.6;'>{p.replace(chr(10), '<br>')}</p>" for p in paragraphs if p.strip()])

        html_body = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: #17221d; line-height: 1.6; margin: 0; padding: 20px;">
    <div style="max-width: 600px;">
        {html_paragraphs}
    </div>
</body>
</html>"""
        html_part = MIMEText(html_body, "html", "utf-8")
        msg.attach(html_part)

        return msg

    def send_email(self, req: SendEmailRequest) -> Dict[str, Any]:
        cfg = self.get_settings(mask_password=False)
        now_str = datetime.datetime.now().isoformat()
        msg_id = make_msgid(domain="dealsignal.ai")

        if not cfg.is_configured:
            # Record in audit log as pending config
            log_item = {
                "id": msg_id,
                "to_email": req.to_email,
                "subject": req.subject,
                "body": req.body,
                "company_name": req.company_name,
                "campaign_name": req.campaign_name,
                "timestamp": now_str,
                "status": "config_required",
                "error": "SMTP server credentials are not configured."
            }
            self._log_sent_email(log_item)
            return {
                "success": False,
                "requires_config": True,
                "error": "SMTP credentials are not configured. Please enter your SMTP details or Gmail App Password in Email Settings to deliver real emails.",
                "logged_id": msg_id
            }

        try:
            mime_msg = self._build_mime_email(req.to_email, req.subject, req.body, cfg, req.sender_name)
            server = self._connect_smtp(cfg)
            server.send_message(mime_msg)
            server.quit()

            log_item = {
                "id": str(mime_msg["Message-ID"]),
                "to_email": req.to_email,
                "subject": req.subject,
                "body": req.body,
                "company_name": req.company_name,
                "campaign_name": req.campaign_name,
                "timestamp": now_str,
                "status": "delivered",
                "from_email": cfg.from_email,
                "smtp_host": cfg.smtp_host
            }
            self._log_sent_email(log_item)

            return {
                "success": True,
                "message_id": str(mime_msg["Message-ID"]),
                "timestamp": now_str,
                "to_email": req.to_email,
                "from_email": cfg.from_email,
                "status": "delivered"
            }
        except Exception as e:
            error_msg = str(e)
            log_item = {
                "id": msg_id,
                "to_email": req.to_email,
                "subject": req.subject,
                "body": req.body,
                "company_name": req.company_name,
                "campaign_name": req.campaign_name,
                "timestamp": now_str,
                "status": "failed",
                "error": error_msg
            }
            self._log_sent_email(log_item)
            return {
                "success": False,
                "error": f"Failed to send email to {req.to_email}: {error_msg}",
                "to_email": req.to_email
            }

    def batch_send_emails(self, req: BatchSendEmailRequest) -> Dict[str, Any]:
        cfg = self.get_settings(mask_password=False)
        total = len(req.emails)
        if total == 0:
            return {"total": 0, "sent": 0, "failed": 0, "results": []}

        if not cfg.is_configured:
            return {
                "total": total,
                "sent": 0,
                "failed": total,
                "requires_config": True,
                "error": "SMTP server credentials are not configured. Please configure Email Settings.",
                "results": [
                    {"to_email": item.to_email, "success": False, "error": "SMTP not configured"}
                    for item in req.emails
                ]
            }

        server = None
        results = []
        sent_count = 0
        failed_count = 0

        try:
            server = self._connect_smtp(cfg)
        except Exception as e:
            return {
                "total": total,
                "sent": 0,
                "failed": total,
                "error": f"Failed to establish SMTP session: {str(e)}",
                "results": []
            }

        for item in req.emails:
            now_str = datetime.datetime.now().isoformat()
            try:
                mime_msg = self._build_mime_email(item.to_email, item.subject, item.body, cfg, item.sender_name)
                server.send_message(mime_msg)
                sent_count += 1
                res = {
                    "to_email": item.to_email,
                    "company_name": item.company_name,
                    "success": True,
                    "message_id": str(mime_msg["Message-ID"]),
                    "timestamp": now_str
                }
                results.append(res)
                self._log_sent_email({
                    "id": str(mime_msg["Message-ID"]),
                    "to_email": item.to_email,
                    "subject": item.subject,
                    "body": item.body,
                    "company_name": item.company_name,
                    "campaign_name": req.campaign_name,
                    "timestamp": now_str,
                    "status": "delivered",
                    "from_email": cfg.from_email
                })
            except Exception as e:
                failed_count += 1
                err_text = str(e)
                results.append({
                    "to_email": item.to_email,
                    "company_name": item.company_name,
                    "success": False,
                    "error": err_text
                })

        try:
            if server:
                server.quit()
        except Exception:
            pass

        return {
            "total": total,
            "sent": sent_count,
            "failed": failed_count,
            "results": results,
            "from_email": cfg.from_email
        }

    def _log_sent_email(self, item: Dict[str, Any]):
        try:
            items = []
            if os.path.exists(SENT_LOG_FILE):
                with open(SENT_LOG_FILE, "r", encoding="utf-8") as f:
                    items = json.load(f)
            items.insert(0, item)
            # Keep latest 200 records
            items = items[:200]
            with open(SENT_LOG_FILE, "w", encoding="utf-8") as f:
                json.dump(items, f, indent=2)
        except Exception:
            pass

    def get_sent_emails(self, limit: int = 50) -> List[Dict[str, Any]]:
        try:
            if os.path.exists(SENT_LOG_FILE):
                with open(SENT_LOG_FILE, "r", encoding="utf-8") as f:
                    items = json.load(f)
                return items[:limit]
        except Exception:
            pass
        return []


email_service = EmailService()
