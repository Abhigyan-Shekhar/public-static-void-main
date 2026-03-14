from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import (
    auth,
    cases,
    evidence,
    family_links,
    documents,
    scoring,
    announcements,
    referrals,
)
from app.core.config import settings

app = FastAPI(
    title="BorderBridge Backend API",
    description="Identity confidence scoring and case management for displaced populations.",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok"}


# Register routers
app.include_router(cases.router)
app.include_router(auth.router)
app.include_router(evidence.router)
app.include_router(family_links.router)
app.include_router(documents.router)
app.include_router(scoring.router, prefix="/cases/{case_id}")
app.include_router(announcements.router)
app.include_router(referrals.router)
