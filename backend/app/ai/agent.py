from langchain.agents import create_tool_calling_agent, AgentExecutor #create_tool_calling_agent(creates agent that can use tools), AgentExecutor (wraps agent to execute with tools and manage interactions,runs the agent (execution engine))
from langchain_groq import ChatGroq #Connects to Groq LLM (LLaMA 3 model)
from app.ai.tools import search_properties #Your custom tool (DB search function)
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder #Helps define how AI should behave (prompt structure)
import os

SYSTEM_PROMPT = """
You are a helpful real estate assistant.
Use the `search_properties` tool to find listings. 

Mandatory Rules for tool usage:
1. ONLY use parameters that the user has explicitly mentioned.
2. For natural language queries like "peaceful retreats" or "serene getaway", put the text into the `query` parameter.
3. DO NOT pass `null`, `None`, or empty strings. If a parameter is unknown, omit it entirely.
4. Convert budget mentions (like '50 lakhs') to raw integers (e.g., 5000000).

If no results are found, inform the user and ask for broader criteria.
"""

def get_agent():
    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0.2,
        groq_api_key=os.getenv("GROQ_API_KEY")
    )

    tools = [search_properties]

    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ])

    agent = create_tool_calling_agent(llm, tools, prompt)

    agent_executor = AgentExecutor(
        agent=agent,
        tools=tools,
        verbose=True,
        handle_parsing_errors=True,
        return_intermediate_steps=True,
        max_iterations=5
    )

    return agent_executor
