# BorderBridge

> **Rebuilding identity for displaced people — one verified signal at a time.**

BorderBridge is a humanitarian technology platform that helps border authorities manage refugee cases with transparency, speed, and dignity. It replaces fragmented paper-based processes with a unified system where identity is built incrementally through verifiable evidence — and where refugees have direct visibility into their own case.

---

## The Problem

When a refugee crosses a border without documents, the current system has no structured way to reconstruct their identity. Officers make inconsistent decisions, evidence is scattered across agencies, and the refugee has no voice in their own case.

BorderBridge solves this by:
1. **Aggregating evidence** from biometrics, NGOs, education records, family connections, and employer references.
2. **Scoring identity confidence** algorithmically so decisions are explainable and auditable.
3. **Giving refugees agency** through a self-service portal where they can submit declarations and track their own case status.
4. **Connecting verified people** to the right integration services — housing, employment, education — through partner NGOs.

---

## How It Works

```
Arrival → Identity Intake → Evidence Submission → Scoring → Verification → Integration
```

1. An **intake officer** registers the individual and logs initial evidence.
2. The **Identity Confidence Engine** scores the case from 0–100 based on verified signals.
3. A **case officer** reviews evidence, accepts or rejects submissions, and progresses the case through status tiers.
4. Once verified, the refugee is referred to **partner NGOs** for housing, employment, or education services.
5. The **refugee** can track every step through their own self-service portal.

---

## Identity Confidence Score

Each piece of evidence contributes points toward a 0–100 confidence score:

| Score Range | Status |
|---|---|
| 0 – 39 | Under Review |
| 40 – 59 | Provisional Identity |
| 60 – 79 | Verified |
| 80+ | High Confidence |

Evidence types are colour-coded and visualised in the **Identity Evidence Graph**:
- 🔵 **Blue** — Biometric matches (UNHCR database)
- 🟢 **Green** — Verified records (education, employment)
- 🟠 **Orange** — Human validation (NGO officer sign-off)
- 🟣 **Purple** — Social relationships (family links)

Clicking an unverified node in the graph triggers an animated score update so officers can see the impact of each evidence item in real time.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Tailwind CSS + shadcn/ui |
| Backend | FastAPI (Python) |
| Database | Supabase (PostgreSQL) |
| Scoring Engine | Random Forest / XGBoost |
| Graph Visualisation | Custom SVG + React (radial hub-and-spoke) |

---

## Frontend Pages

All pages are live with `npm run dev` in the `frontend/` directory.

### Authority Interface (`/dashboard` and sub-pages)

| Route | Page | Description |
|---|---|---|
| `/` | **Animated Login** | Character-animated sign in / sign up with email + phone validation |
| `/dashboard` | **Authority Dashboard** | Live metrics (35 active cases, 12 evidence pending, 4 high priority), alerts, and announcements |
| `/cases` | **Cases Database** | Sortable case table with identity score, status, origin country, and quick-action links |
| `/case/:id` | **Case Details** | Full profile view: identity fields, family links, evidence log, officer notes |
| `/registration` | **Client Registration** | Split-pane intake form to register a new arrival into the system |
| `/evidence` | **Evidence Review** | Document queue where reviewers approve or reject submitted evidence |
| `/scoring` | **Identity Confidence Engine** | Interactive radial evidence graph with animated score + colour-coded node types |
| `/announcements` | **Announcements Board** | Targeted broadcast system for camp-wide or group-specific updates |
| `/referrals` | **Partner Referrals** | Match verified refugees to NGO integration services (housing, employment, education) |
| `/timeline` | **Visual Case Timeline** | Milestone tracker mapping the journey from Arrival → Evidence → Verification → Integration |

### Refugee Interface (`/refugee`)

| Tab | Description |
|---|---|
| **My Case** | Live case status bar, current phase, and pending actions |
| **Profile** | Social-style identity profile with avatar, bio, metrics ribbon (days in system, verified docs, family links), and a scrollable case activity feed |
| **Family** | Declared and verified family connections |
| **Evidence & Docs** | Upload self-declared documents for officer review |
| **Appointments** | Scheduled interviews and check-in dates |
| **Messages** | One-way notifications and announcements from authorities |

---

## System Roles

### Authority (Immigration Officials)
- `intake_officer` — Registers arrivals, logs initial evidence
- `reviewer` — Validates evidence, updates trust classification
- `case_manager` — Full case oversight, triggers score recomputation, manages referrals
- `communications_publisher` — Broadcasts announcements to refugee groups

### Refugee (Displaced Persons)
- **Can**: Submit declarations, view their case status, read announcements
- **Cannot**: Directly verify themselves or overwrite accepted official data
- All refugee submissions enter as `self_declared` and require a `reviewer` before they affect the score

### Partner (NGOs & Aid Agencies)
- `partner_service_officer` — Manages referrals assigned to their agency, posts service announcements

---

## Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```
API at `http://127.0.0.1:8000` · Docs at `http://127.0.0.1:8000/docs`

### Database
1. Create a Supabase project
2. Run `db/schema.sql` in the Supabase SQL editor
3. Run `db/seed.sql` to populate demo data
4. Copy your credentials into `.env`

### Environment Variables
```bash
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_ANON_KEY, and any other required values
```

## Deploy On Render

This repo is set up for a two-service Render deploy using [`render.yaml`](./render.yaml):

- `borderbridge-api` → FastAPI web service from `backend/`
- `borderbridge-web` → Vite static site from `frontend/`

### 1. Create the services

1. Push this repo to GitHub.
2. In Render, create a new Blueprint deployment from the repo.
3. Render will detect `render.yaml` and provision both services.

### 2. Configure backend environment variables

Set these on the `borderbridge-api` service:

```bash
SUPABASE_URL=...
SUPABASE_KEY=...
SUPABASE_SERVICE_KEY=...
JWT_SECRET=...
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
APP_ENV=production
CORS_ORIGINS=https://<your-frontend-domain>.onrender.com
```

If you later add a custom frontend domain, include that domain in `CORS_ORIGINS` as a comma-separated value.

### 3. Verify the deploy

- Backend health check: `/health`
- Backend docs: `/docs`
- Frontend routes such as `/dashboard`, `/cases`, and `/refugee` are rewritten to `index.html` so client-side routing works on Render.

---

## Team

| Person | Area | Branch |
|---|---|---|
| Person 1 | Authority dashboard + case detail UI | `feature/frontend-authority` |
| Person 2 | Refugee portal + partner dashboard UI | `feature/frontend-refugee-partner` |
| Person 3 | FastAPI backend + API integration | `feature/backend-api` |
| Person 4 | Database schema + ML scoring | `feature/data-ml` |

## Branch Model
```
main    → demo-safe only
dev     → integration branch
feature/* → individual work
```
Only the integrator merges `dev → main`.
