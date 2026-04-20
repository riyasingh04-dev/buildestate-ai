import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

try:
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    cur.execute("SELECT version();")
    print(f"PostgreSQL version: {cur.fetchone()[0]}")
    
    cur.execute("SELECT extname FROM pg_extension WHERE extname = 'vector';")
    extension = cur.fetchone()
    if extension:
        print("pgvector extension is already installed.")
    else:
        print("pgvector extension is NOT installed.")
    
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error connecting to database: {e}")
