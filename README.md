# 🏠 BuildEstate AI

A modern, full-stack real estate platform that connects **property buyers** and **builders**, with a powerful **admin panel** and secure backend architecture.

---

## 🚀 Overview

**BuildEstate AI** is designed to simplify real estate interactions:

* 👤 Users can browse and explore properties
* 👷 Builders can list and manage their properties
* ❤️ Users can express interest (leads)
* 👑 Admin manages the entire platform

---

## ✨ Features

### 🔐 Authentication & Security

* JWT-based authentication
* Secure password hashing (bcrypt)
* Role-Based Access Control (RBAC)
* Protected APIs with token verification

---

### 👥 User Roles

| Role       | Permissions                                       |
| ---------- | ------------------------------------------------- |
| 👤 User    | View properties, create leads                     |
| 👷 Builder | Add, update, delete properties, view leads        |
| 👑 Admin   | Manage users, builders, properties, and analytics |

---

### 🏠 Property Management

* Add / Update / Delete property (Builder only)
* View all properties (Public)
* Filter by:

  * Price
  * Location
* Property approval system (Admin controlled)

---

### ❤️ Lead Generation System

* Users can mark properties as “Interested”
* Leads are stored with:

  * User ID
  * Property ID
* Builders can view leads for their properties

---

### 👑 Admin Panel

* 👥 User Management (Block/Delete)
* 👷 Builder Verification
* 🏠 Property Moderation (Approve/Reject)
* 📊 Dashboard Analytics:

  * Total Users
  * Total Properties
  * Total Leads

---

## 🧠 Tech Stack

### 🔧 Backend

* FastAPI
* PostgreSQL
* SQLAlchemy
* JWT (python-jose)
* Passlib (bcrypt)

### 🎨 Frontend

* Next.js (App Router)
* Tailwind CSS
* Axios / Fetch API

---

## ⚙️ Environment Setup

Create a `.env` file inside the backend folder:

```
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
DATABASE_URL=postgresql://user:password@localhost:5432/realestate
```

⚠️ **Important:**
Do NOT push `.env` to GitHub.

---

## ▶️ Run Project

### Backend

```bash
uvicorn app.main:app --reload
```

### Frontend

```bash
npm install
npm run dev
```

---

## 📡 API Documentation

Once server is running:

```
http://127.0.0.1:8000/docs
```

Swagger UI will open for testing APIs.

---

## 🔁 Application Flow

Builder → Adds Property
User → Browses Properties
User → Clicks “Interested” ❤️
→ Lead Created
Builder → Views Leads

---

## 🔐 Admin Security (Important)

* Admin is **manually created in database**
* Public users cannot register as admin
* All admin APIs are protected using:

  * JWT Authentication
  * Role verification (`require_admin`)

---

## 📁 Project Structure

```
backend/
│
├── app/
│   ├── core/
│   ├── db/
│   ├── models/
│   ├── routes/
│   ├── schemas/
│
frontend/
│
├── app/
├── components/
├── services/
```

---

## 💎 UI Highlights

* Modern SaaS-style design
* Responsive layout (mobile + desktop)
* Clean cards & dashboards
* Interactive charts (Admin Panel)

---

## 🚀 Future Enhancements

* 🤖 AI Property Recommendation System
* 📊 Advanced Analytics (real-time trends)
* 📧 Email Notifications (SMTP)
* 💳 Payment Integration
* 🌍 Deployment (AWS / Vercel / Render)

---

## 👨‍💻 Author

**Riya Singh** 🚀

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
