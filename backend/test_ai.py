import json
import os
from dotenv import load_dotenv
from app.ai.agent import get_agent

load_dotenv()

def test_chat():
    agent = get_agent()
    try:
        print("Sending message...")
        response = agent.invoke({
            "input": "show me 3 BHK flats",
            "chat_history": []
        })
        print("AI Response:", response["output"])
    except Exception as e:
        print("Error encountered:")
        print(e)

if __name__ == "__main__":
    test_chat()
