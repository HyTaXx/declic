import os
from contextlib import contextmanager

import psycopg2
import resend
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

load_dotenv()

RESEND_API_KEY = os.environ.get("RESEND_API_KEY")

MAIL_FROM = os.environ.get("MAIL_FROM", "onboarding@resend.dev")
MAIL_SUBJECT = os.environ.get("MAIL_SUBJECT", "Vos résultats Déclic")
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get("ALLOWED_ORIGINS", "*").split(",")
    if origin.strip()
]
DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is required")

VALID_BEHAVIORS = frozenset({
    "ALCOHOL",
    "TOBACCO",
    "CANNABIS",
    "MEDICATION",
    "PARTY_DRUGS",
    "SOCIAL_MEDIA",
    "VIDEO_GAMES",
    "GAMBLING",
    "PORNOGRAPHY",
    "SNACKING",
    "OVERWORK",
})

limiter = Limiter(key_func=get_remote_address, default_limits=["5/minute"])

app = FastAPI(title="Declic Mail API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@contextmanager
def get_db():
    conn = psycopg2.connect(DATABASE_URL)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db() -> None:
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS behavior_votes (
                    id SERIAL PRIMARY KEY,
                    behavior VARCHAR(50) NOT NULL,
                    created_at TIMESTAMP DEFAULT NOW()
                );
            """)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


class SendEmailRequest(BaseModel):
    email: EmailStr
    message: str


class VoteRequest(BaseModel):
    behaviors: list[str]


@app.post("/api/send-email")
@limiter.limit("5/minute")
async def send_email(request: Request, body: SendEmailRequest) -> JSONResponse:
    if not RESEND_API_KEY:
        raise HTTPException(status_code=503, detail="Email service is not configured")

    resend.api_key = RESEND_API_KEY
    resend.Emails.send({
        "from": MAIL_FROM,
        "to": body.email,
        "subject": MAIL_SUBJECT,
        "text": body.message,
    })

    return JSONResponse({"status": "sent"})


@app.post("/api/analytics/votes")
@limiter.limit("30/minute")
async def record_votes(request: Request, body: VoteRequest) -> JSONResponse:
    if not body.behaviors:
        raise HTTPException(status_code=422, detail="At least one behavior is required")

    invalid = [b for b in body.behaviors if b not in VALID_BEHAVIORS]
    if invalid:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid behaviors: {', '.join(invalid)}",
        )

    unique_behaviors = list(dict.fromkeys(body.behaviors))

    with get_db() as conn:
        with conn.cursor() as cur:
            cur.executemany(
                "INSERT INTO behavior_votes (behavior) VALUES (%s)",
                [(behavior,) for behavior in unique_behaviors],
            )

    return JSONResponse({"status": "recorded", "count": len(unique_behaviors)})


@app.get("/api/analytics/votes")
async def get_vote_ranking() -> JSONResponse:
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT behavior, COUNT(*)::int AS count
                FROM behavior_votes
                GROUP BY behavior
                ORDER BY count DESC, behavior ASC
            """)
            rows = cur.fetchall()

    total = sum(count for _, count in rows)
    ranking = [
        {
            "behavior": behavior,
            "count": count,
            "percentage": round(count / total * 100, 1) if total > 0 else 0.0,
        }
        for behavior, count in rows
    ]

    return JSONResponse(ranking)
