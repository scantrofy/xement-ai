from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import google.cloud.logging
import logging

from app.routers import (
    auth_router, recommendation_router, simulate_router, run_cycle_router, public_router
)

# ----- Initialize FastAPI -----
app = FastAPI(title="Xement AI Backend")

# ----- Google Cloud Logging -----
client = google.cloud.logging.Client()
client.setup_logging()
logger = logging.getLogger("xement-ai")
logger.setLevel(logging.INFO)

# ----- CORS for Frontend -----
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://xement-ai.vercel.app",  # Production Vercel domain
        "http://localhost:4028",          # Local development
        "http://localhost:3000",          # Alternative local port
        "http://127.0.0.1:4028",         # Local IP variant
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----- Global Error Handler -----
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": str(exc), "path": request.url.path}
    )

# ----- Routers -----
# Public endpoints
app.include_router(public_router.router)

# Protected endpoints
app.include_router(auth_router.router)
app.include_router(recommendation_router.router)
app.include_router(simulate_router.router)
app.include_router(run_cycle_router.router)

@app.get("/")
def root():
    logger.info("Health check endpoint called")
    return {"status": "Xement AI backend running"}
