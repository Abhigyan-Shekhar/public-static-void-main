# BeyondBorders

BeyondBorders is a full-stack case management and identity-confidence platform for displaced people. It combines a React frontend, a FastAPI backend, JSON seed data for local/demo mode, and database assets for a Supabase/Postgres-backed deployment.

The project models how authorities, reviewers, case managers, partner organizations, and refugees can collaborate on identity reconstruction, evidence review, scoring, announcements, and referrals in a transparent workflow.

## What the project includes

- Authority-facing dashboards for intake, case review, scoring, announcements, and referrals
- A refugee self-service portal for profile visibility, declarations, and case tracking
- A FastAPI backend with route, service, and repository layers
- Seeded demo data stored as JSON for local development
- SQL schema, policies, functions, and seed scripts for database-backed deployment
- An identity-confidence scoring engine with feature engineering plus RF/XGBoost training assets

## Product workflow

```text
Arrival -> Intake -> Evidence Collection -> Review -> Score Recompute -> Case Decision -> Referral / Support
```

Typical flow:

1. An intake officer creates a case.
2. Evidence is submitted by staff or self-declared by the refugee.
3. Reviewers validate or reject evidence.
4. The scoring engine computes an identity-confidence snapshot.
5. Case managers decide next actions and create referrals.
6. Authorities publish case-targeted or broad announcements.
7. Refugees can view status, documents, profile details, and case timeline in the portal.

## Core capabilities

### Authority interface

- Dashboard and summary views
- Case registration
- Case detail inspection
- Evidence review
- Score recomputation and score inspection
- Referrals management
- Announcement publishing
- Visual case timeline

### Refugee interface

- Personal case overview
- Profile card and activity feed
- Self-declared information flows
- Announcements visibility
- Evidence and document awareness

### Backend domain areas

- Cases
- Evidence
- Documents
- Family links
- Announcements
- Referrals
- Scoring
- Audit logs

## Tech stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Radix UI primitives
- Framer Motion
- Cytoscape
- React Router

### Backend

- FastAPI
- Pydantic v2
- Uvicorn
- Python 3
- Scikit-learn
- XGBoost
- Pandas
- NumPy

### Data layer

- JSON seed-backed repositories for local/demo mode
- SQL schema and seed files for Supabase/Postgres deployment

## Repository layout

```text
.
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── ml/
│   │   ├── repositories/
│   │   ├── schemas/
│   │   └── services/
│   ├── data/
│   ├── tests/
│   ├── requirements.txt
│   └── pytest.ini
├── data/
│   └── seed/
├── db/
│   ├── docs/
│   ├── functions.sql
│   ├── policies.sql
│   ├── schema.sql
│   └── seed.sql
├── docs/
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── notebooks/
├── docker-compose.yml
└── README.md
```

## Frontend pages

### Main frontend surfaces

- `/` animated login/landing entry
- `/dashboard` authority dashboard
- `/cases` authority case list
- `/case/:id` authority case detail
- `/registration` client registration
- `/evidence` evidence review
- `/scoring` scoring and evidence graph
- `/announcements` announcements management
- `/referrals` partner/authority referrals view
- `/timeline` case timeline view
- `/refugee` refugee portal

### Notable UI components

- Authority dashboard and collapsible sidebar
- Case detail with score, blockers, and linked evidence
- Refugee portal with profile banner and activity feed
- Announcement creation and listing
- Referral creation and updates
- Registration intake experience
- Evidence graph and review workflows

## Backend API overview

The backend app entrypoint is:

```bash
backend/app/main.py
```

Important route groups:

- `/health`
- `/cases`
- `/cases/{case_id}/timeline`
- `/cases/{case_id}/evidence`
- `/evidence/{evidence_id}/review`
- `/cases/{case_id}/documents/register`
- `/documents/{document_id}/review`
- `/cases/{case_id}/family-links`
- `/family-links/{link_id}`
- `/announcements`
- `/cases/{case_id}/announcements`
- `/cases/{case_id}/referrals`
- `/referrals/{referral_id}`
- `/cases/{case_id}/score/latest`
- `/cases/{case_id}/score/recompute`

## Demo authentication model

Local development uses a demo user header instead of a full production auth flow for most API interactions.

The frontend API client sends:

```text
X-Demo-Username: auth_manager
```

Demo users currently defined in the backend include:

- `auth_intake`
- `auth_reviewer`
- `auth_manager`
- `auth_publisher`
- `partner_user`
- `refugee_user`

These users map to roles and permissions such as:

- `intake_officer`
- `reviewer`
- `case_manager`
- `communications_publisher`
- `partner_service_officer`
- `read_only_self_service`

## Local setup

### Prerequisites

- Node.js 20+ recommended
- npm
- Python 3.11+ recommended
- pip
- Git

Optional:

- Docker / Docker Compose
- Supabase project for database-backed mode

## Quick start

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd public-static-void-main
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

### 3. Install backend dependencies

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..
```

### 4. Start the backend

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload
```

Backend URLs:

- API: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- Swagger docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- ReDoc: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

### 5. Start the frontend

In a separate terminal:

```bash
cd frontend
npm run dev
```

Frontend URL:

- App: [http://127.0.0.1:5173](http://127.0.0.1:5173)

## Running with Docker

There is a `docker-compose.yml` for the API service:

```bash
docker compose up --build
```

This starts the FastAPI app on port `8000`.

## Render deployment

This repository now includes a root [render.yaml](C:/Users/Swastik/Desktop/public-static-void-main/render.yaml) for deploying:

- a Python backend service from `backend/`
- a static frontend site from `frontend/`

### What is already wired

- The frontend reads its API base URL from `VITE_API_BASE_URL`
- The backend reads `CORS_ORIGINS` from environment configuration
- The backend JWT secret can be provided by Render through `JWT_SECRET`
- The static frontend includes an SPA rewrite so React Router routes work on refresh

### Deploy steps

1. Push this repository to GitHub.
2. In Render, choose `New +` -> `Blueprint`.
3. Connect the GitHub repository.
4. Select the repo and let Render read `render.yaml`.
5. Create the services.

Render will provision:

- `beyond-borders-api`
- `beyond-borders-web`

### Important after creating services

If you rename either Render service, update the URLs in [render.yaml](C:/Users/Swastik/Desktop/public-static-void-main/render.yaml):

- `CORS_ORIGINS` on the API service
- `VITE_API_BASE_URL` on the frontend service

### Expected public URLs

After deployment, you will access the app through a public Render URL such as:

- `https://beyond-borders-web.onrender.com`

And the frontend will call the backend at:

- `https://beyond-borders-api.onrender.com`

## Database setup

The project contains SQL assets under `db/`.

Important files:

- `db/schema.sql`
- `db/seed.sql`
- `db/functions.sql`
- `db/policies.sql`
- `db/docs/data-model.md`
- `db/docs/sample-cases.md`

### Suggested database bootstrap

1. Create a Supabase project.
2. Run `db/schema.sql`.
3. Run `db/functions.sql`.
4. Run `db/policies.sql`.
5. Run `db/seed.sql`.

If you are developing locally without Supabase, the backend can still operate against JSON seed files under `data/seed/`.

## Seed/demo data

JSON seed data lives in:

- `data/seed/cases.json`
- `data/seed/evidence_items.json`
- `data/seed/documents.json`
- `data/seed/family_links.json`
- `data/seed/announcements.json`
- `data/seed/referrals.json`
- `data/seed/score_snapshots.json`
- `data/seed/audit_logs.json`
- `data/seed/persons.json`
- `data/seed/profiles.json`

These files power the local demo repository implementation and are also useful for understanding expected data shapes.

## ML / scoring assets

The ML-related code lives in `backend/app/ml/`.

Important files:

- `feature_builder.py`
- `infer.py`
- `evaluate.py`
- `train_rf.py`
- `train_xgb.py`
- `generate_synthetic_data.py`

Model artifacts are stored in:

- `backend/app/ml/models/`

Synthetic training data lives in:

- `backend/app/ml/data/synthetic_identity_scores.csv`

Notebook experiments:

- `notebooks/scoring_experiments.ipynb`

## How scoring works

The score pipeline combines structured features such as:

- total evidence count
- official vs corroborated vs self-declared evidence
- accepted/rejected/disputed review state
- verified family links
- verified/rejected documents
- external confirmed matches
- weighted evidence sum
- days in system

The API exposes:

- latest score lookup
- recompute score for a case

Score snapshots include:

- `predicted_score`
- `confidence_band`
- `top_factors`
- `blocking_constraints`
- `feature_snapshot`
- `model_name`
- `model_version`

## Environment and configuration

There is no committed root `.env.example` in the repository at the moment, so if you enable Supabase-backed or environment-driven configuration you should create your own `.env` based on the fields referenced by the backend config layer.

If you plan to add environment-backed deployment, review:

- `backend/app/core/config.py`
- `backend/app/core/security.py`
- `backend/app/repositories/supabase_client.py`

## Development workflows

### Frontend

Run dev server:

```bash
cd frontend
npm run dev
```

Create a production build:

```bash
cd frontend
npm run build
```

Preview the build:

```bash
cd frontend
npm run preview
```

Lint:

```bash
cd frontend
npm run lint
```

### Backend

Run API:

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload
```

Run the main backend test suite:

```bash
cd backend
source .venv/bin/activate
pytest
```

Run the standalone regression file:

```bash
cd backend
source .venv/bin/activate
pytest test_refs.py
```

## Testing status

At the time of this README update, the project was verified with:

```bash
cd backend && pytest
cd backend && pytest test_refs.py
cd frontend && npm run build
```

## Important docs

Project docs:

- `docs/architecture.md`
- `docs/api-contract.md`
- `docs/feature-scope.md`
- `docs/demo-script.md`
- `docs/judge-qa.md`
- `Context.md`

Database docs:

- `db/docs/data-model.md`
- `db/docs/sample-cases.md`

## Current implementation notes

- The frontend is wired to the FastAPI backend through `frontend/src/lib/api.ts`.
- Local/demo mode primarily uses JSON-backed repositories.
- The frontend production build currently succeeds with a Vite chunk-size warning; that warning does not block the build.
- The repository includes generated frontend build output in `frontend/dist/`, which you may or may not want to keep under version control depending on your deployment flow.

## Recommended startup order

For local development:

1. Start the backend on port `8000`
2. Start the frontend on port `5173`
3. Open the frontend in a browser
4. Use the built-in demo auth header behavior from the frontend API client

## If you are handing this to another developer

The fastest way for a new developer to get running is:

```bash
git clone <repo>
cd public-static-void-main
cd backend && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
cd ../frontend && npm install
cd ../backend && source .venv/bin/activate && uvicorn app.main:app --reload
cd ../frontend && npm run dev
```

Then open:

- [http://127.0.0.1:5173](http://127.0.0.1:5173)
- [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

## License / ownership

Add your preferred license and repository ownership details here before publishing publicly if this is going to be used beyond demo or coursework purposes.
