# 🏠 BuildEstate AI

A modern, full-stack real estate platform that connects **property buyers** and **builders**, enhanced by a powerful **AI-Chatbot Engine**, a robust **admin panel**, and a highly secure backend architecture.

---

## 🚀 Overview

**BuildEstate AI** is designed to simplify and intelligently automate real estate interactions:

* 👤 Users can browse properties and chat with the AI for smart recommendations.
* 👷 Builders can list and vividly showcase their real estate portfolios.
* ❤️ Users can express interest and generate leads seamlessly.
* 👑 Admins manage the entire ecosystem securely, ranging from property moderation to account suspensions.

---

## ✨ Core Features

### 🤖 Smart AI Real Estate Assistant
* Powered by **Groq Engine** (`llama-3.3-70b-versatile`) and **Pinecone Vector Search**.
* **Semantic Search:** Understands complex queries like "cozy 2BHK near a park with a swimming pool".
* **Human-Readable Output:** Beautifully formatted responses using **React-Markdown** with numbered lists, bold text, and clear spacing.
* **Property Cards:** Direct integration returns interactive property cards inside the chat.

### 🔐 Authentication & Security
* JWT-based advanced authentication with RBAC (Role-Based Access Control).
* **Block System:** Suspended users/builders are strictly denied access platform-wide.

### 🏠 Property Lifecycle
* **Moderation:** Properties go through a `pending` -> `approved` workflow.
* **Sold Status:** Properties can be marked as **Sold**, automatically restricting further purchases and updating platform-wide analytics.
* **Auto-Sync:** Real-time synchronization of property data to Pinecone for instant search availability.

### ❤️ Intelligent Lead Management
* **Anonymous Leads:** Captures name, email, and phone for non-logged-in users.
* **Builder Dashboard:** Easy-to-use interface to manage incoming inquiries.
* **Admin Global Monitoring:** Centralized access for administrators to monitor every lead generated across the platform.

### 👑 Admin Power Suite
* **Comprehensive Stats:** Real-time tracking of revenue, property status, and user growth with interactive **Recharts** visualizations.
* **Moderation Tools:** Approve listings, verify builders, and manage user status.
* **Global Leads:** Monitor all potential buyer interactions across the ecosystem.

---

## 👥 Roles & Permissions

| Role | Permissions |
| --- | --- |
| 👤 **User** | Semantic search via AI, view properties, create leads, and track personal interests. |
| 👷 **Builder** | List properties, track active/pending listings, and manage incoming leads. |
| 👑 **Admin** | Full ecosystem supervision, property moderation, global leads monitoring, and data analytics. |

---

## 🧠 Tech Stack

### 🔧 Backend Core
* **Framework:** FastAPI
* **Database:** PostgreSQL (SQLAlchemy) & **Pinecone** (Vector Database)
* **AI Engine:** Groq API & LangChain
* **Embeddings:** HuggingFace / Google AI (Local Embeddings for Vector Search)

### 🎨 Frontend UI
* **Framework:** Next.js 14+ (App Router)
* **Rendering:** **React-Markdown** for structured chatbot communication
* **Animations:** Framer Motion
* **Visualizations:** Recharts (Admin Dashboards)
* **Icons:** Lucide React

---

## ⚙️ Environment Setup

Create a `.env` file inside the root directory:

```env
# 🔐 JWT Config
SECRET_KEY=your_super_secret_key
ALGORITHM=HS256

# 🗄️ Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/realestate

# 🤖 AI & Search
GROQ_API_KEY=your_groq_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_environment
PINECONE_INDEX=your_index_name
```

⚠️ **Important:** Do NOT push the `.env` file to your GitHub repository.

---

## ▶️ Running the Project Locally

### Start Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

uvicorn app.main:app --reload
```

### Start Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 📡 API Architecture & Documentation

The Backend automatically generates interactive documentation for your API endpoints. 
Once your server is running, navigate to:

```url
http://127.0.0.1:8000/docs
```
Here, you can test endpoints ranging from `POST /ai/chat` to `GET /properties/me` live.

---

## 💎 Design Highlights
* **SaaS Design Patterns**: Dark mode support, deep purple/indigo gradients, and translucent overlay elements.
* **Smart Dashboards**: Tailor-made perspectives varying drastically based on Active Role.
* **Responsive**: Fully optimal on mobile or massive desktop interfaces.

---

## 🚀 Future Enhancements
* 💳 Payment Gateway / Direct Deposit Integration (Stripe)
* 🗺️ Advanced Map/Geo-location view for properties
* 📧 Email Notifications dynamically hooked into Lead creation
* 🌍 Comprehensive Live Deployment Architecture (AWS / Vercel / Render)

---

## 👨‍💻 Author
**Riya Singh** 🚀

---

## ⭐ Support
If this project helped you out, do not hesitate to drop a ⭐ on GitHub!
