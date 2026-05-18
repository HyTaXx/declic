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
- `apps/backend`: placeholder for the future backend
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

Today, those root commands are fully wired for the frontend. Backend `lint`, `build`, and `test` scripts still need Python tooling before they can be included there.

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

Production container setup is available with Docker Compose.

1. Create your environment file:

```bash
cp .env.example .env
```

2. Build and start the app:

```bash
docker compose up --build -d
```

3. Open the app at `http://localhost:3000`.

4. Stop the container:

```bash
docker compose down
```
