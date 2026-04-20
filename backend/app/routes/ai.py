from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.ai.agent import get_agent
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.messages import HumanMessage, AIMessage
import traceback

router = APIRouter()

# In-memory store for chat history
sessions = {}

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default"

@router.post("/chat/")
async def chat(request: ChatRequest):
    session_id = request.session_id
    
    # Get or create history for this session
    if session_id not in sessions:
        sessions[session_id] = ChatMessageHistory()
    
    history = sessions[session_id]
    agent = get_agent()

    try:
        # Invoke agent with history
        response = agent.invoke({
            "input": request.message,
            "chat_history": history.messages
        })
        
        result = response["output"]
        intermediate_steps = response.get("intermediate_steps", [])

        # Save to history
        history.add_user_message(request.message)
        history.add_ai_message(result)

        # Extract properties if search_properties was called
        properties = []
        for action, observation in intermediate_steps:
            if action.tool == "search_properties":
                properties = observation
                break

        return {
            "reply": result,
            "properties": properties,
            "session_id": session_id
        }

    except Exception as e:
        error_trace = traceback.format_exc()
        print(f"Error in chat: {e}")
        print(error_trace)
        return {
            "reply": "Something went wrong",
            "error": str(e),
            "traceback": error_trace
        }