from typing import Annotated, Sequence, TypedDict, Dict, List, Optional 
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI 
from langchain_core.messages import BaseMessage, ToolMessage, SystemMessage, HumanMessage, AIMessage
from langchain_core.tools import tool 
from langgraph.graph.message import add_messages # reducer
from langgraph.graph import StateGraph, START, END 
from langgraph.prebuilt import ToolNode # Create tools 
from IPython.display import display, Image
from langchain_openai import OpenAIEmbeddings
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

load_dotenv()


llm = ChatOpenAI(
    model = "stepfun/step-3.5-flash:free",
    base_url="https://openrouter.ai/api/v1",
    api_key=os.environ["OPENROUTERKEY"])

embeddings = OpenAIEmbeddings(
    model = "openai/text-embedding-3-small",
    openai_api_base="https://openrouter.ai/api/v1",
    openai_api_key=os.environ["OPENROUTERKEY"]
)

