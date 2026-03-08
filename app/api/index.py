from typing import Annotated, Sequence, TypedDict, Dict, List, Optional 
from dotenv import load_dotenv
from langchain_core.messages import BaseMessage, ToolMessage, SystemMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, START, END 
from langgraph.prebuilt import ToolNode # Create tools 
from IPython.display import display, Image
from langchain_community.document_loaders import PyMuPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
import os 
# Api stuff
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware 
from fastapi.responses import StreamingResponse 
from pydantic import BaseModel 
import json 

# Import models 
from ._config import llm, embeddings, AgentState, llm_response

# Get the directory of the current file, go up 2 directories to reach the project root, then go down to the .env file
basedir = os.path.abspath(os.path.dirname(__file__))
env_path = os.path.join(basedir, '..', '..', '.env')
load_dotenv(dotenv_path=env_path)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


'''
TODO
- Add tools (llm searching tool)
- Add memory 
- Add vector store 
- Add streaming 
'''

graph = StateGraph(AgentState)
graph.add_node("llm_response", llm_response)
graph.add_edge(START, "llm_response")


agent_app = graph.compile()