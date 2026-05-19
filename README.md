# Declic

**Find Support in 5 Minutes**

Anonymous addiction screening and resource navigation platform for students.

## Monorepo

This repository uses `npm` workspaces with a lightweight Turborepo setup.

```text
.
├── apps/
│   ├── backend/
│   └── frontend/
└── packages/
    └── shared/
```

- `apps/frontend`: Nuxt application
- `apps/backend`: FastAPI mail API
- `packages/shared`: shared types

## Development

Install dependencies from the repository root:

```bash
npm ci
```

Run both frontend and backend from the repository root:

```bash
npm run dev
```

Frontend mail requests are sent to the backend API configured by `NUXT_PUBLIC_API_URL`.
The default local value is `http://localhost:8000`.

Before the first backend start, set up its Python environment:

```bash
cd apps/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

`npm run dev` will fail with a setup message until `apps/backend/.venv` exists and contains the backend dependencies.

Other root commands:

```bash
npm run build
npm run lint
npm run test
```

Backend `lint` and `test` now run from the root too, as long as `apps/backend/.venv` has been set up with `pip install -r requirements-dev.txt`.
Backend `build` is still not wired because the Python service does not have a dedicated build step yet.

---

## 🎯 Overview

Declic is a web and mobile platform designed to help students identify risky behaviors related to addictions and connect them with appropriate support resources in under 5 minutes.

The platform addresses a critical gap: while addiction support services exist, students often don't know they need help, don't know where to find it, or feel too stigmatized to seek it out.

### Key Features

- **Anonymous Screening**: No personal data required, judgment-free assessment
- **Smart Navigation**: Algorithm-based matching to local support services
- **Quick Access**: From assessment to resource recommendations in under 5 minutes
- **Comprehensive Coverage**: Addresses both substance and behavioral addictions
- **Personalized Resources**: Tailored information, testimonials, and next-step guidance

---

## 📋 Addictions Covered

### Substance-Related

- Alcohol (binge drinking, regular excessive use)
- Cannabis and other drugs
- Tobacco and vaping
- Misuse of prescription medications (stimulants, sedatives)
- Party drugs (MDMA, cocaine, etc.)

### Behavioral

- Social media and smartphone overuse
- Video gaming
- Gambling and sports betting
- Pornography
- Compulsive eating
- Academic overwork and perfectionism

---

## 🙏 Acknowledgments

This project is built on the principle that **seeking help should be simple, fast, and free of shame**.

Special thanks to the mental health and addiction support communities working to make resources more accessible to young people.

---

**Note**: This platform is a navigation tool, not a replacement for professional medical advice, diagnosis, or treatment. In case of emergency, contact local emergency services immediately.

## Docker

The repo includes separate Dockerfiles for the frontend and backend:

- `apps/frontend/Dockerfile`
- `apps/backend/Dockerfile`

Local production-like startup is available with Docker Compose.

1. Create the frontend env file:

```bash
cp .env.example .env
```

2. Create the backend env file:

```bash
cp apps/backend/.env.example apps/backend/.env
```

3. Fill in `apps/backend/.env` with your `RESEND_API_KEY`.

4. Build and start both services:

```bash
docker compose up --build -d
```

5. Open the frontend at `http://localhost:3000`.

6. Stop the containers:

```bash
docker compose down
```

The frontend sends email requests to the backend using `NUXT_PUBLIC_API_URL`. In Docker Compose, this is set to `http://localhost:8000`, so browser requests still resolve correctly from your machine.

## Railway

Railway deployment should use 2 services: one for the Nuxt frontend and one for the FastAPI backend.

### Frontend service

- Root directory / build context: repository root
- Dockerfile path: `apps/frontend/Dockerfile`
- Public environment variables:

```bash
NUXT_PUBLIC_API_URL=https://<your-backend-service>.up.railway.app
NUXT_PUBLIC_URL=https://<your-frontend-service>.up.railway.app
```

### Backend service

- Root directory / build context: repository root
- Dockerfile path: `apps/backend/Dockerfile`
- Environment variables:

```bash
RESEND_API_KEY=re_...
MAIL_FROM=onboarding@resend.dev
MAIL_SUBJECT=Vos résultats Déclic
ALLOWED_ORIGINS=https://<your-frontend-service>.up.railway.app
```

Railway provides `PORT` automatically. The backend Dockerfile runs Uvicorn on that port, and the frontend Dockerfile runs Nitro on its assigned port.
