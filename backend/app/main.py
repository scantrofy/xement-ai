from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import google.cloud.logging
import logging
import os

from app.routers import (
    auth_router, recommendation_router, simulate_router, run_cycle_router, public_router, user_management_router, config_router, alerts_router
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
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# ----- Global Error Handler -----
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": str(exc), "path": request.url.path}
    )

IS_DEVELOPMENT = os.getenv("ENV", "production").lower() == "development"

# ----- Routers -----
app.include_router(public_router.router)

if not IS_DEVELOPMENT:
    app.include_router(auth_router.router)
    app.include_router(user_management_router.router)
    app.include_router(recommendation_router.router)
    app.include_router(simulate_router.router)
    app.include_router(run_cycle_router.router)
    app.include_router(config_router.router)
    app.include_router(alerts_router.router)
else:
    from fastapi import APIRouter
    
    dev_router = APIRouter()
    dev_router.include_router(auth_router.router)
    dev_router.include_router(user_management_router.router)
    dev_router.include_router(recommendation_router.router)
    dev_router.include_router(simulate_router.router)
    dev_router.include_router(run_cycle_router.router)
    dev_router.include_router(config_router.router)
    dev_router.include_router(alerts_router.router)
    
    app.include_router(dev_router)

@app.get("/")
def root():
    logger.info("Health check endpoint called")
    return {"status": "Xement AI backend running"}
