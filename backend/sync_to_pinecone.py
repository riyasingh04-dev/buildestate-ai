# this file is used to sync all properties from database to pinecone (Vector DB) ,Take all properties from your database and upload them to Pinecone with embeddings
import os
import json #store embeddings as string in DB convert string → list
from dotenv import load_dotenv
from app.db.database import SessionLocal #Creates database session (connection)
from app.models.property import Property
from app.models.user import User
from app.models.lead import Lead
from app.utils.embeddings import get_embedding, format_property_for_embedding #format_property_for_embedding() → convert property to textget_embedding() → convert text → vector
from app.utils.pinecone_utils import upsert_property_embedding #sends data to pinecone

load_dotenv()

def sync(): #This function fetches all properties from your SQL database, converts them into vectors (embeddings), and uploads them to Pinecone.
    print("Syncing properties to Pinecone...")
    db = SessionLocal() #Creates database session (connection)  
    properties = db.query(Property).all() #Fetches all properties from SQL database
    
    synced_count = 0 #Tracks how many properties have been synced
    for p in properties: #Iterates through each property
        # Generate or use existing embedding
        embedding_list = None
        if p.embedding_data: #If embedding already stored in DB
            try:
                embedding_list = json.loads(p.embedding_data) #convert string → list
                if len(embedding_list) != 384: #Check if length is 384
                    embedding_list = None
            except: #If error occurs
                embedding_list = None
        
        if not embedding_list: #If no embedding found
            text_to_embed = format_property_for_embedding(p.title, p.description, p.amenities) #format_property_for_embedding() → convert property to text
            embedding_list = get_embedding(text_to_embed) #get_embedding() → convert text → vector
            # Update DB with JSON version
            p.embedding_data = json.dumps(embedding_list)
        
        if embedding_list: #If embedding is found (either old or new)
            metadata = {
                "title": p.title, #Property title
                "location": p.location, #Property location
                "price": float(p.price) #Property price
            }
            upsert_property_embedding(p.id, embedding_list, metadata) #sends data to pinecone
            synced_count += 1 #Increment synced count
            if synced_count % 10 == 0: #Print every 10 properties
                print(f"Synced {synced_count} properties...")
    
    db.commit()
    db.close()
    print(f"Successfully synced {synced_count} properties to Pinecone.")

if __name__ == "__main__":
    sync()
