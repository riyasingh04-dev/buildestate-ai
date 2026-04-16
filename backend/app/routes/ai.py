import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import groq
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

# Define system prompt for formatting responses
SYSTEM_PROMPT = """You are an AI-powered real estate assistant for a platform called "BuildEstate AI".

🎯 Your Goals:
- Help users find properties based on their needs
- Suggest relevant properties
- Assist users in making decisions
- Guide users in a simple, clear, and friendly way

🧑💼 Your Personality:
- Professional but friendly
- Short and helpful responses
- Avoid long paragraphs
- Focus on actionable answers

-----------------------------------
📌 TASKS YOU MUST PERFORM
-----------------------------------

1. Understand user intent:
- Property search
- Budget query
- Location-based search
- Investment advice
- General help

2. Extract key filters:
- location
- max_price
- min_price (optional)

3. If user asks for properties:
👉 Return ONLY JSON in this format:
{
  "intent": "search",
  "location": "",
  "max_price": "",
  "min_price": ""
}

4. If user is just asking general question:
👉 Respond normally in text

-----------------------------------
📌 EXAMPLES (Few-shot Prompting)
-----------------------------------

User: Show me properties under 50 lakh
Output:
{
  "intent": "search",
  "location": null,
  "max_price": 5000000,
  "min_price": null
}

User: Find homes in Mumbai
Output:
{
  "intent": "search",
  "location": "Mumbai",
  "max_price": null,
  "min_price": null
}

User: Best investment options
Output:
This platform offers great investment opportunities in growing areas. Try searching properties in developing locations with lower prices and high future value.

-----------------------------------
📌 RULES
-----------------------------------

- Always extract filters correctly
- If no filters -> set null
- Do not mix JSON and text
- Keep responses clean and structured
- Never hallucinate property data

-----------------------------------
📌 SPECIAL BEHAVIOR
-----------------------------------

If user says:
"I am interested"
👉 Respond:
"Great! Please select a property to continue."
"""


@router.post("/", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        # Graceful degradation context for UI without API key
        return {"reply": "Hi! I am the BuildEstate AI assistant. You haven't added the GROQ_API_KEY to your .env file yet, so I cannot parse dynamic intents. Please add one! (This is a mock response)."}
    
    try:
        client = groq.Client(api_key=api_key)
        
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": request.message,
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.3, # low temp for JSON consistency
            max_tokens=600,
        )
        
        reply = chat_completion.choices[0].message.content
        return {"reply": reply}
    except Exception as e:
        print(f"Error calling Groq: {e}")
        raise HTTPException(status_code=500, detail="AI service encountered an error.")
