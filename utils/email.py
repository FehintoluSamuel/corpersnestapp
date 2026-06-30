from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
import os
import logging

logger = logging.getLogger(__name__)


def _get_mail_config():
    """
    Builds the mail connection config only when actually needed.
    Returns None if required env vars are missing, instead of crashing.
    """
    username = os.getenv("MAIL_USERNAME")
    password = os.getenv("MAIL_PASSWORD")
    sender   = os.getenv("MAIL_FROM")
    server   = os.getenv("MAIL_SERVER")

    if not all([username, password, sender, server]):
        logger.warning("Email not configured — MAIL_USERNAME/PASSWORD/FROM/SERVER missing. Skipping send.")
        return None

    return ConnectionConfig(
        MAIL_USERNAME=username,
        MAIL_PASSWORD=password,
        MAIL_FROM=sender,
        MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
        MAIL_SERVER=server,
        MAIL_STARTTLS=True,
        MAIL_SSL_TLS=False,
        USE_CREDENTIALS=True,
    )


async def send_email(to: str, subject: str, body: str):
    """Sends an email. Silently no-ops if mail isn't configured, never raises."""
    conf = _get_mail_config()
    if conf is None:
        return

    try:
        fm = FastMail(conf)
        msg = MessageSchema(
            subject=subject,
            recipients=[to],
            body=body,
            subtype="html",
        )
        await fm.send_message(msg)
    except Exception as e:
        logger.error(f"Failed to send email to {to}: {e}")


async def send_welcome(to: str, name: str):
    await send_email(to, "Welcome to CorpersNest — Your account is ready", f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2D8A4E;">Welcome to CorpersNest, {name}!</h2>
        <p>Your account is ready. Find your perfect room or connect with other corpers in Abia State.</p>
        <a href="{os.getenv('FRONTEND_URL')}/listings"
           style="background:#2D8A4E;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;display:inline-block;margin:16px 0;">
           Browse Rooms
        </a>
        <p style="color:#666;font-size:12px;margin-top:32px;">
            CorpersNest · Abia State, Nigeria<br>
            You received this because you registered on CorpersNest.
        </p>
    </div>
    """)


async def send_password_reset(to: str, name: str, token: str):
    url = f"{os.getenv('FRONTEND_URL')}/reset-password?token={token}"
    await send_email(to, "Reset your CorpersNest password", f"""
    <h2>Password Reset</h2>
    <p>Hi {name}, click the link below to reset your password.</p>
    <p><a href="{url}">Reset Password</a></p>
    <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    """)


async def send_landlord_approved(to: str, name: str):
    await send_email(to, "Your landlord account is approved", f"""
    <h2>You're verified, {name}!</h2>
    <p>Your landlord account on CorpersNest has been approved.</p>
    <p>You can now post listings and connect with corps members.</p>
    <p><a href="{os.getenv('FRONTEND_URL')}/listings/new">Post your first listing</a></p>
    """)


async def send_landlord_rejected(to: str, name: str, reason: str):
    await send_email(to, "CorpersNest account update", f"""
    <h2>Hi {name},</h2>
    <p>Unfortunately your landlord registration was not approved.</p>
    <p><strong>Reason:</strong> {reason or 'Did not meet verification requirements.'}</p>
    <p>Contact support if you believe this is an error.</p>
    """)