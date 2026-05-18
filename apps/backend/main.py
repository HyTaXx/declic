import os
import smtplib
import ssl
from email.message import EmailMessage

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

load_dotenv()

SMTP_HOST = os.environ["SMTP_HOST"]
SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
SMTP_USER = os.environ["SMTP_USER"]
SMTP_PASSWORD = os.environ["SMTP_PASSWORD"]
MAIL_FROM = os.environ.get("MAIL_FROM", SMTP_USER)
MAIL_SUBJECT = os.environ.get("MAIL_SUBJECT", "Vos résultats Déclic")
ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "*").split(",")

limiter = Limiter(key_func=get_remote_address, default_limits=["5/minute"])

app = FastAPI(title="Declic Mail API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)


class SendEmailRequest(BaseModel):
    email: EmailStr
    message: str


@app.post("/api/send-email")
@limiter.limit("5/minute")
async def send_email(request: Request, body: SendEmailRequest) -> JSONResponse:
    msg = EmailMessage()
    msg["Subject"] = MAIL_SUBJECT
    msg["From"] = MAIL_FROM
    msg["To"] = body.email
    msg.set_content(body.message)

    context = ssl.create_default_context()
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.ehlo()
        server.starttls(context=context)
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)

    return JSONResponse({"status": "sent"})
