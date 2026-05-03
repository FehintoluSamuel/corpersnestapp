from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr
import os

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
)

fm = FastMail(conf)

async def send_email(to: str, subject: str, body: str):
    msg = MessageSchema(
        subject=subject,
        recipients=[to],
        body=body,
        subtype="html",
    )
    await fm.send_message(msg)

async def send_welcome(to: str, name: str):
    await send_email(to, "Welcome to CorpersNest 🏠", f"""
    <h2>Welcome, {name}!</h2>
    <p>Your CorpersNest account is ready.</p>
    <p>Find your perfect room or connect with other corpers.</p>
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
    await send_email(to, "Your landlord account is approved ✅", f"""
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