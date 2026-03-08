from langchain_openai import ChatOpenAI, OpenAIEmbeddings
import os
from typing import TypedDict, Annotated, Sequence
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages # reducer
from langchain_core.tools import tool 
from langchain_community.tools import DuckDuckGoSearchRun # Searching 
import time 

class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]

llm = ChatOpenAI(
    model = "stepfun/step-3.5-flash:free",
    base_url="https://openrouter.ai/api/v1",
    api_key=os.environ["OPENROUTERKEY"])

embeddings = OpenAIEmbeddings(
    model = "openai/text-embedding-3-small",
    openai_api_base="https://openrouter.ai/api/v1",
    openai_api_key=os.environ["OPENROUTERKEY"]
)

def llm_response(state: AgentState) -> AgentState:
    """Generate response using LLM"""
    response = llm.invoke(state["messages"])
    return {"messages": [response]}


@tool
def search(query: str) -> str:
    """
    Search for information
    Top 3 web search results
    Want this to be free so using duckduckgo with time 
    """
    search = DuckDuckGoSearchRun()
    results = search.run(query, time="w") # w = last week, d = last day, m = last month
    return results

__all__ = ["llm", "embeddings", "AgentState", "llm_response"]