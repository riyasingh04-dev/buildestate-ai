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
* Powered by the cutting-edge **Groq Engine** (`llama-3.3-70b-versatile`).
* Intercepts natural language and dynamically parses search intents (Price, Location, Budget).
* Direct integration bypassing conventional search—returns beautifully rendered property cards right inside the chat sequence.
* Employs Few-Shot Prompt engineering and Strict JSON outputs.

### 🔐 Authentication & Security
* JWT-based advanced authentication.
* Secure password hashing with `bcrypt`.
* Granular Role-Based Access Control (RBAC).
* Strictly protected APIs—bypassing bypass flaws; blocked users instantly experience `403 Forbidden` limits across the whole app.

### 🏠 Property Management
* Add, update, and gracefully delete listings (Builders only).
* Automatic status routing (`pending` approval system).
* Dynamic search parameters filtering.

### ❤️ Lead Generation System
* Real-time intent capturing ("Interested" property markers).
* Consolidated dashboards allowing builders to pinpoint qualified leads effortlessly.

### 👑 Admin Control Panel
* **User Management**: Ability to strictly suspend and block users/builders globally.
* **Property Moderation**: Review pending properties, and authorize them to be listed publicly.
* **Analytics**: Complete tracking of platform revenue, leads, and engagement metrics via Chart visualizations.

---

## 👥 Roles & Permissions

| Role | Permissions |
| --- | --- |
| 👤 **User** | Engage with the AI Chatbot, view properties, create leads. |
| 👷 **Builder** | Add properties, review personal active/pending listings, track generated leads. |
| 👑 **Admin** | Full system supervision, user suspensions, property approvals, data analytics. |

---

## 🧠 Tech Stack

### 🔧 Backend Core
* **Framework:** FastAPI
* **Database:** PostgreSQL via SQLAlchemy
* **AI Engine:** Groq API SDK
* **Security:** JWT (python-jose), Passlib (bcrypt), Environment variables validation

### 🎨 Frontend UI
* **Framework:** Next.js 14+ (App Router)
* **Styling:** Tailwind CSS & Glassmorphism Aesthetics
* **Animations:** Framer Motion (Micro-animations, smooth toggles)
* **Icons:** Lucide React
* **State/Fetch:** Axios interceptors

---

## ⚙️ Environment Setup

Create a `.env` file inside the root directory and ensure they are appropriately formatted:

```env
# 🔐 JWT Config
SECRET_KEY=your_super_secret_key_123456789
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# 🗄️ Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/realestate

# 🤖 AI Engine
GROQ_API_KEY=your_groq_api_key_here

# 📧 SMTP (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
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
