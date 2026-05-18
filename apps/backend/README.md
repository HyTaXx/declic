# Declic — Mail API

Python 3.14+ · FastAPI · Resend · 5 req/min rate limit per IP

## Setup

```bash
cd apps/backend

python3 -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt

cp .env.example .env
# Fill in RESEND_API_KEY in .env
```

## Run

```bash
source .venv/bin/activate
uvicorn main:app --reload
```

Server starts at `http://localhost:8000`.

## Test

```bash
curl -X POST http://localhost:8000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{"email": "you@example.com", "message": "Test depuis le backend Déclic !"}'
```

Expected response:

```json
{ "status": "sent" }
```

## Environment variables

| Variable          | Required | Default                 | Description                                    |
| ----------------- | -------- | ----------------------- | ---------------------------------------------- |
| `RESEND_API_KEY`  | Yes      | —                       | Resend API key                                 |
| `MAIL_FROM`       | No       | `onboarding@resend.dev` | Sender address (use a verified domain in prod) |
| `MAIL_SUBJECT`    | No       | `Vos résultats Déclic`  | Email subject                                  |
| `ALLOWED_ORIGINS` | No       | `*`                     | Comma-separated CORS origins                   |
