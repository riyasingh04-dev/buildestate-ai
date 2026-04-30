#  BuildEstate AI

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Pinecone](https://img.shields.io/badge/Pinecone-272727?style=for-the-badge&logo=pinecone)](https://www.pinecone.io/)
[![XGBoost](https://img.shields.io/badge/XGBoost-EB5131?style=for-the-badge)](https://xgboost.ai/)

**BuildEstate AI** is a premium, full-stack real estate ecosystem designed to bridge the gap between property buyers and builders. It leverages cutting-edge AI for semantic search, lead scoring, and personalized recommendations, all wrapped in a sleek, modern interface.

---

## Overview

BuildEstate AI isn't just a property listing site; it's an intelligent marketplace:
*   **For Buyers:** Find your dream home using natural language, get personalized suggestions, and chat with an AI that understands your needs.
*   **For Builders:** Showcase portfolios with rich media, manage leads with ML-driven insights, and track performance via advanced analytics.
*   **For Admins:** Orchestrate the entire platform with robust moderation tools, global lead monitoring, and real-time revenue tracking.

---

##  Core Features (AI & ML Deep Dive)

###  1. Advanced Semantic Search & AI Chatbot
*   **Vector-First Search:** Powered by **Pinecone** and **Sentence-Transformers**, the platform understands the *intent* behind queries like "3BHK with a balcony near the tech hub".
*   **Groq Engine Integration:** Uses `llama-3.3-70b-versatile` for lightning-fast, human-like conversations.
*   **Interactive Property Cards:** The chatbot doesn't just talk; it renders interactive cards for properties it recommends.

###  2. ML-Driven Lead Scoring & Explainability
*   **XGBoost Classifier:** Predicts the likelihood of a lead converting into a sale based on user behavior, budget match, and engagement history.
*   **SHAP Explainability:** Provides "Why" behind the score. Builders can see exactly which features (e.g., "high engagement" or "price match") contributed to a "Hot" lead status.
*   **Lead Decay Logic:** Automatically adjusts scores over time if interaction drops, ensuring focus remains on active prospects.

###  3. Hybrid Recommendation Engine
*   **Collaborative Filtering:** Recommends properties based on what similar users liked.
*   **Content-Based Filtering:** Suggests properties with similar attributes (location, price, amenities) to those the user has already viewed.
*   **Cold-Start Mitigation:** Automatically switches strategies for new users to ensure they always see relevant content.

### 4. Enterprise-Grade Security & Admin Suite
*   **RBAC (Role-Based Access Control):** Granular permissions for Users, Builders, and Admins.
*   **Sophisticated Moderation:** Full `pending` -> `approved` workflow for all property listings.
*   **Analytics Dashboards:** Real-time data visualization using **Recharts**, tracking property health, user growth, and lead conversion rates.

---

##  Project Structure

```text
BuildEstate_AI/
├── backend/                # FastAPI Application
│   ├── app/
│   │   ├── ai/             # AI Agents & LLM Logic
│   │   ├── db/             # Database connection & Base models
│   │   ├── models/         # SQLAlchemy Models
│   │   ├── routes/         # API Endpoints (Auth, ML, Property, etc.)
│   │   ├── schemas/        # Pydantic Schemas
│   │   ├── services/       # Business Logic (Recommendations, Lead Scoring)
│   │   └── utils/          # Helper functions
│   ├── scripts/            # Database migrations & Sync scripts
│   └── main.py             # Entry point
├── frontend/               # Next.js 14+ Application (App Router)
│   ├── app/                # Main routes & Page components
│   ├── components/         # Reusable UI Components
│   ├── context/            # React Context (Auth, UI State)
│   ├── lib/                # Utility functions
│   └── services/           # API integration layer
├── .env                    # Environment variables (Root)
└── README.md               
```

---

##  Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | FastAPI, SQLAlchemy (PostgreSQL), Pydantic |
| **AI / ML** | Groq API, LangChain, Pinecone, XGBoost, SHAP, Pandas, Numpy |
| **Frontend** | Next.js 14, React 19, TypeScript, Tailwind CSS |
| **Data Viz** | Recharts, Lucide React |
| **Animations**| Framer Motion |
| **Search** | Sentence-Transformers (Embeddings), Vector Search |

---

##  Environment Setup

Create a `.env` file in the root directory:

```env
#  Security
SECRET_KEY=your_secure_random_string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

#  Database
DATABASE_URL=postgresql://user:password@localhost:5432/realestate

#  AI & Vector Search
GROQ_API_KEY=your_groq_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=real-estate

#  Environment
ENVIRONMENT=development
```

---

##  Running Locally

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # venv\Scripts\activate on Windows
pip install -r requirements.txt
# Note: Ensure you have xgboost, shap, and pandas installed
pip install xgboost shap pandas joblib

# Initialize Database & Sync Vectors
python scripts/migrate_to_pgvector.py  # If using pgvector
python sync_to_pinecone.py            # Sync properties to Pinecone

# Start Server
uvicorn app.main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

---

##  API Documentation

Once the backend is running, you can access the interactive Swagger docs at:
*   **Interactive UI:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
*   **JSON Schema:** [http://127.0.0.1:8000/openapi.json](http://127.0.0.1:8000/openapi.json)

---

##  Design Philosophy
*   **Modern Aesthetics:** Deep purple/indigo gradients, dark mode optimization, and translucent "Glassmorphism" elements.
*   **Responsive First:** Every dashboard and property card is optimized for mobile, tablet, and desktop.
*   **Micro-interactions:** Subtle Framer Motion animations for a premium feel.

---

##  Future Roadmap
*   [ ] Stripe Payment Integration for direct property deposits.
*   [ ] Advanced Geo-fencing for location-based alerts.
*   [ ] AR View for properties (Future mobile app integration).
*   [ ] Multi-language support for global expansion.

---

##  Author
**Riya Singh** - *Lead Developer & AI Architect* 

---

##  Support
If you find this project interesting, please give it a ⭐ on GitHub!
