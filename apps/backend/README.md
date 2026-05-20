# Declic — Mail API

Python 3.14+ · FastAPI · Resend · 5 req/min rate limit per IP

## Setup

```bash
cd apps/backend

python3 -m venv .venv
source .venv/bin/activate

pip install -r requirements-dev.txt

cp .env.example .env
# Fill in RESEND_API_KEY in .env
```

## Run

```bash
npm run dev
```

You can also start both apps from the repository root with `npm run dev` once this backend setup is complete.

Server starts at `http://localhost:8000`.

## Lint and test

From the repository root:

```bash
npm run lint
npm test
```

Or from `apps/backend` directly:

```bash
npm run lint
npm test
```

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

## Database

The API uses a single env var: **`DATABASE_URL`**. The table `behavior_votes` is created automatically on startup.

| Environment | Database                                                      | `DATABASE_URL`                                     |
| ----------- | ------------------------------------------------------------- | -------------------------------------------------- |
| Local dev   | Docker Postgres (`docker compose up db`) or local port 5432   | `postgresql://declic:declic@localhost:5432/declic` |
| Production  | [Supabase](https://supabase.com) Postgres (no `db` container) | Supabase connection string (see below)             |

### Supabase (production)

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. **Project Settings → Database → Connection string → URI**.
3. Choose **Transaction** pooler (port `6543`) — best for a long-running API like FastAPI.
4. Replace `[YOUR-PASSWORD]` with your database password and set `DATABASE_URL` on your host (Railway, Render, etc.) — never commit it.
5. Deploy **only the backend** (and frontend). Do not run the `db` service from `docker-compose.yml`.
6. On first request, the API runs `CREATE TABLE IF NOT EXISTS` — no manual migration needed.

Optional: run the same SQL in **SQL Editor** if you prefer to create the table yourself:

```sql
CREATE TABLE IF NOT EXISTS behavior_votes (
  id SERIAL PRIMARY KEY,
  behavior VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

To test Supabase locally, put the URI in `apps/backend/.env` and run the API; stop Docker `db`.

## Environment variables

| Variable          | Required | Default                 | Description                                    |
| ----------------- | -------- | ----------------------- | ---------------------------------------------- |
| `DATABASE_URL`    | No       | local Docker URL        | Postgres connection string (Supabase in prod)  |
| `RESEND_API_KEY`  | Yes      | —                       | Resend API key                                 |
| `MAIL_FROM`       | No       | `onboarding@resend.dev` | Sender address (use a verified domain in prod) |
| `MAIL_SUBJECT`    | No       | `Vos résultats Déclic`  | Email subject                                  |
| `ALLOWED_ORIGINS` | No       | `*`                     | Comma-separated CORS origins                   |
