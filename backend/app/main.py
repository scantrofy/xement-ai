import os
import logging
from pathlib import Path
from dotenv import load_dotenv

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import google.cloud.logging

root_dir = Path(__file__).parent.parent.parent

# Only load .env file if it exists (local development)
env_file = root_dir / '.env'
if env_file.exists():
    load_dotenv(dotenv_path=env_file)

# Handle credentials - Cloud Run uses Application Default Credentials
credentials_path = root_dir / 'xement_iam.json'
existing_creds = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')

# Only set credentials file if running locally
if not os.getenv('K_SERVICE'):  # K_SERVICE is set by Cloud Run
    if existing_creds and not os.path.isabs(existing_creds):
        os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = str(root_dir / existing_creds)
    elif not existing_creds and credentials_path.exists():
        os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = str(credentials_path)

from app.routers import (
    auth_router, recommendation_router, simulate_router, run_cycle_router, public_router, user_management_router, config_router, alerts_router, chatbot_router
)

# ----- Initialize FastAPI -----
app = FastAPI(title="XementAI Backend")

# ----- Logging Setup -----
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("xement-ai")

try:
    client = google.cloud.logging.Client()
    client.setup_logging()
except Exception as e:
    logger.warning(f"Could not setup Google Cloud Logging: {e}")

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
    app.include_router(chatbot_router.router)
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
    dev_router.include_router(chatbot_router.router)
    
    app.include_router(dev_router)

@app.on_event("startup")
async def startup_event():
    """Log startup information"""
    logger.info("=" * 50)
    logger.info("XementAI Backend Starting...")
    logger.info(f"Environment: {os.getenv('ENV', 'production')}")
    logger.info(f"Running on Cloud Run: {bool(os.getenv('K_SERVICE'))}")
    logger.info(f"Port: {os.getenv('PORT', '8000')}")
    logger.info("=" * 50)

@app.get("/")
def root():
    logger.info("Health check endpoint called")
    return {
        "status": "XementAI backend running",
        "environment": os.getenv("ENV", "production"),
        "cloud_run": bool(os.getenv("K_SERVICE"))
    }

@app.get("/health")
def health_check():
    """Health check endpoint for Cloud Run"""
    return {"status": "healthy", "service": "xement-ai-backend"}
