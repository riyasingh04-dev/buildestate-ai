import os #Used to read environment variables (like API key)
from pinecone import Pinecone, ServerlessSpec # Pinecone=main client (connects to Pinecone). Serverlessspec = defines cloud config (AWS, region). Pinecone is a vector database that is used to store and search for similar vectors. ServerlessSpec is a specification for a serverless Pinecone index.   
from typing import List, Dict, Any #Used for type hinting,List[float] → embeddings,Dict → metadata , Type hints = a way to tell what type of data a variable or function should use
from dotenv import load_dotenv #Used to load environment variables from a .env file

load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "real-estate")

pc = None #pc and index both are global singletons (global variable=A variable defined outside any function,So it can be used anywhere in the file.)(Singleton = only one instance is created and reused)
index = None #pc → Pinecone client, index → your vector database

def get_pinecone(): #This function:Creates connection to Pinecone and returns index
    global pc, index
    if pc is None: #Creates connection to Pinecone only once (It ensures that you don't create multiple Pinecone connections)
        if not PINECONE_API_KEY:
            print("WARNING: PINECONE_API_KEY is not set.")
            return None, None
        
        pc = Pinecone(api_key=PINECONE_API_KEY) #Creates Pinecone client
        
        # Check if index exists, if not create it
        if PINECONE_INDEX_NAME not in pc.list_indexes().names():
            print(f"Creating Pinecone index: {PINECONE_INDEX_NAME}")
            pc.create_index(
                name=PINECONE_INDEX_NAME,
                dimension=384, # For all-MiniLM-L6-v2
                metric='cosine',
                spec=ServerlessSpec(
                    cloud='aws',
                    region='us-east-1' # Default region
                )
            )
        
        index = pc.Index(PINECONE_INDEX_NAME)
    
    return pc, index

def upsert_property_embedding(property_id: int, embedding: List[float], metadata: Dict[str, Any]): # Function to store property in Pinecone, This function:Connects to Pinecone,then adds a new vector (embedding) and its metadata to the index.
    _, index = get_pinecone()
    if index: #If Pinecone is connected
        index.upsert(vectors=[(str(property_id), embedding, metadata)])

def query_properties(query_embedding: List[float], top_k: int = 5): # Function to search similar properties,Searches Pinecone for properties similar to the query embedding.
    _, index = get_pinecone()
    if not index: #If Pinecone is not connected
        return []
    
    results = index.query(
        vector=query_embedding,
        top_k=top_k,
        include_metadata=True
    )
    
    return results.matches
