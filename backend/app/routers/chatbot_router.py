from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.middleware.auth import require_auth
from app.services.chatbot_service import process_chat_message
import logging

logger = logging.getLogger("xement-ai")

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

class ChatRequest(BaseModel):
    message: str
    user_id: str
    user_name: str = "User"
    context: dict = {}

class ChatResponse(BaseModel):
    response: str
    model: str = "gemini"
    context_used: bool = False
    timestamp: str

@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest, current_user=Depends(require_auth)):
    """
    Process chat message with Gemini AI + BigQuery context
    
    - Requires authentication
    - Uses Gemini AI for natural language understanding
    - Fetches relevant context from BigQuery (latest KPIs, anomalies, etc.)
    - Returns AI-generated response
    """
    try:
        logger.info(f"Chat request from user: {request.user_id}")
        
        # Process message with AI service
        response_data = await process_chat_message(
            message=request.message,
            user_id=request.user_id,
            user_name=request.user_name,
            context=request.context
        )
        
        return response_data
        
    except Exception as e:
        logger.error(f"Chatbot error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process chat message: {str(e)}"
        )

@router.get("/health")
async def chatbot_health():
    """Health check for chatbot service"""
    return {
        "status": "healthy",
        "service": "chatbot",
        "ai_model": "gemini-pro"
    }
