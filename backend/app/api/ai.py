from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
from app.services.ai_service import get_assistant_response

router = APIRouter()

class AIChatRequest(BaseModel):
    message: str
    context: Dict[str, Any]

class ToolCall(BaseModel):
    name: str
    parameters: Dict[str, Any]

class AIChatResponse(BaseModel):
    text: str
    tool_calls: List[ToolCall]

@router.post("/chat", response_model=AIChatResponse)
def chat_with_ai(req: AIChatRequest):
    try:
        result = get_assistant_response(req.message, req.context)
        return AIChatResponse(
            text=result.get("text", ""),
            tool_calls=result.get("tool_calls", [])
        )
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
            raise HTTPException(status_code=429, detail="Gemini AI quota has been reached for now. Please try again later.")
        raise HTTPException(status_code=500, detail=error_msg)
