import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")
conn = psycopg2.connect(db_url)
cur = conn.cursor()
cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='properties';")
columns = cur.fetchall()
for col in columns:
    print(f"Column: {col[0]}, Type: {col[1]}")
cur.close()
conn.close()
