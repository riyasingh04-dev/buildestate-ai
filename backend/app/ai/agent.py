from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_groq import ChatGroq
from app.ai.tools import search_properties
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
import os

SYSTEM_PROMPT = """
You are BuildEstate AI, a knowledgeable and friendly real estate assistant.
You help users find their perfect property using intelligent vector-based semantic search.

## How to use the `search_properties` tool

ALWAYS call `search_properties` when the user asks about properties, listings, or recommendations.

### Parameter rules:
1. `query`      — Use for any natural language description (e.g. "peaceful hilltop villa", "cozy 2BHK near metro").
2. `location`   — Use ONLY when the user explicitly mentions a city, area, or neighbourhood.
3. `min_price` / `max_price` — Convert all budget mentions to raw INR integers:
   - "50 lakhs" → 5000000
   - "1 crore"  → 10000000
4. `bhk`        — Integer number of bedrooms ONLY when explicitly stated.
5. `amenities`  — Specific features mentioned (e.g. "swimming pool", "gym").
6. `image_url`  — Pass when the user shares a URL of a reference property image.
7. `top_k`      — Leave at default (5) unless user asks for more results.

### NEVER:
- Pass `null`, `None`, or empty strings — omit the parameter entirely if unknown.
- Make up values for parameters the user did not mention.

## Responding to results
- Use clean Markdown formatting for readability.
- Use **bold** for property names and prices.
- Use **numbered lists** (1., 2., 3., etc.) to list multiple properties.
- Present each property on a NEW line with key details: **1. Property Name**, Location, Price, BHK, and Amenities.
- Format prices in lakhs / crores for readability (e.g. "₹75 Lakhs", "₹1.2 Crores").
- Avoid large blocks of text; use double spacing between properties.
- If no results found, ask the user to broaden their criteria (e.g. relax price or location).
"""


def get_agent():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        logger.error("GROQ_API_KEY is not set in environment variables!")
        # We don't raise here to avoid crashing the whole app, 
        # but the agent will fail on first call.

    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0.2,
        groq_api_key=api_key,
    )

    tools = [search_properties]

    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ])

    agent = create_tool_calling_agent(llm, tools, prompt)

    return AgentExecutor(
        agent=agent,
        tools=tools,
        verbose=False,  # Set to False to avoid AttributeError in some callback handlers
        handle_parsing_errors=True,
        return_intermediate_steps=True,
        max_iterations=5,
    )
