# PersonalityAI

PersonalityAI is a full-stack MBTI prediction platform. A Next.js frontend sends user text to a Flask REST API, which preprocesses it with TF-IDF, performs inference with a trained PyTorch model, stores results in PostgreSQL, and returns the predicted type and confidence score.

## Features

- Email/password registration and login with JWT authentication
- MBTI prediction through a JSON REST API
- PyTorch model inference with TF-IDF preprocessing
- PostgreSQL-backed prediction history
- User feedback and deletion controls
- Personal analytics endpoint
- Automated Flask API tests
- Docker Compose configuration for frontend, backend, and PostgreSQL

## Architecture

```text
Next.js + TypeScript frontend
            |
            | JSON + JWT
            v
Flask REST API + SQLAlchemy
       |              |
       v              v
PyTorch model      PostgreSQL
```

## Run with Docker

1. Install Docker Desktop.
2. From the project root, run:

```bash
docker compose up --build
```

3. Open `http://localhost:3000`.

## Run manually

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python run.py
```

SQLite is used automatically when `DATABASE_URL` is not set. Set the provided PostgreSQL URL for the complete stack.

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

## API routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/predictions`
- `GET /api/predictions`
- `PATCH /api/predictions/:id/feedback`
- `DELETE /api/predictions/:id`
- `GET /api/analytics`
- `GET /api/health`

## Important disclaimer

MBTI predictions are for educational and entertainment purposes. They are not psychological or medical assessments.
