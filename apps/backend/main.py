import os

import resend
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

load_dotenv()

resend.api_key = os.environ["RESEND_API_KEY"]

MAIL_FROM = os.environ.get("MAIL_FROM", "onboarding@resend.dev")
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
    resend.Emails.send({
        "from": MAIL_FROM,
        "to": body.email,
        "subject": MAIL_SUBJECT,
        "text": body.message,
    })

    return JSONResponse({"status": "sent"})
