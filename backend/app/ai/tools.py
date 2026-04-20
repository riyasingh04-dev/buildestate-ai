import json
from langchain.tools import tool
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models import property, user, lead, builder # Ensure all models are registered
from app.models.property import Property
from app.utils.embeddings import get_embedding
from app.utils.pinecone_utils import query_properties
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class SearchInput(BaseModel):
    query: Optional[str] = Field(None, description="Natural language keywords for semantic search (e.g., 'serene getaway')")
    location: Optional[str] = Field(None, description="City, area, or neighborhood name")
    min_price: Optional[int] = Field(None, description="Minimum budget in INR")
    max_price: Optional[int] = Field(None, description="Maximum budget in INR")
    bhk: Optional[int] = Field(None, description="Number of bedrooms (integer)")
    amenities: Optional[str] = Field(None, description="Specific features (e.g., 'pool, gym')")

@tool(args_schema=SearchInput)
def search_properties(
    query: Optional[str] = None, 
    location: Optional[str] = None, 
    min_price: Optional[int] = None, 
    max_price: Optional[int] = None,
    bhk: Optional[int] = None,
    amenities: Optional[str] = None
):
    """Search for real estate properties from the database."""
    
    # Ensure bhk is an integer if provided as string
    if bhk is not None and isinstance(bhk, str):
        try:
            bhk = int(bhk)
        except:
            bhk = None

    db: Session = SessionLocal()
    query_obj = db.query(Property)

    # Basic Filters
    if location:
        query_obj = query_obj.filter(Property.location.ilike(f"%{location}%"))
    if min_price:
        query_obj = query_obj.filter(Property.price >= min_price)
    if max_price:
        query_obj = query_obj.filter(Property.price <= max_price)
    if bhk:
        query_obj = query_obj.filter(Property.bedrooms == bhk)
    if amenities:
        query_obj = query_obj.filter(Property.amenities.ilike(f"%{amenities}%"))

    # Fetch all matching candidates (limit to 50 for performance)
    candidates = query_obj.limit(50).all()

    # Semantic Search if query is provided
    if query:
        query_embedding = get_embedding(query)
        pinecone_matches = query_properties(query_embedding, top_k=20)
        pinecone_ids = [int(m.id) for m in pinecone_matches]
        
        if pinecone_ids:
            # Filter query_obj to only include these IDs and maintain order if possible
            # But simple filtering is easier for now
            query_obj = query_obj.filter(Property.id.in_(pinecone_ids))
            
            # Fetch and re-sort by Pinecone score
            candidates = query_obj.all()
            score_map = {int(m.id): m.score for m in pinecone_matches}
            candidates.sort(key=lambda p: score_map.get(p.id, 0), reverse=True)
            results = candidates[:5]
        else:
            results = []
    else:
        results = query_obj.limit(5).all()

    db.close()

    return [
        {
            "id": p.id,
            "title": p.title,
            "location": p.location,
            "price": p.price,
            "image_url": p.image_url,
            "bedrooms": p.bedrooms,
            "amenities": p.amenities
        }
        for p in results
    ]