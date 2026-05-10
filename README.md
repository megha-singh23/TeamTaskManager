# TaskFlow — Team Task Management Application

A full-stack collaborative task management web app built with React, FastAPI, PostgreSQL, and SQLAlchemy ORM.

---

## 🔗 Live Demo
- **Frontend:** https://teamtaskmanager-production-813d.up.railway.app
- **Backend API:** https://noble-possibility-production-55ee.up.railway.app
- **API Docs:** https://noble-possibility-production-55ee.up.railway.app/docs

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS, React Router v6, Recharts |
| Backend | FastAPI, Uvicorn, Python 3.12 |
| ORM | SQLAlchemy 2.0 |
| Database | PostgreSQL 16 |
| Auth | JWT (python-jose), bcrypt |
| Deployment | Railway |

---

## 📋 Features

- JWT Authentication (Signup/Login)
- Create and manage Projects
- Role Based Access (Admin/Member)
- Kanban Board (To Do / In Progress / Done)
- Task assignment with priority and due dates
- Dashboard with charts and statistics
- Overdue task tracking

---

## Local Setup (VS Code)

### Requirements
- Python 3.12
- Node.js 18+
- PostgreSQL

### 1. Clone the Repository
```bash
git clone https://github.com/megha-singh23/TaskFlow.git
cd TaskFlow
```

### 2. Create PostgreSQL Database
Open pgAdmin and run:
```sql
CREATE DATABASE taskflow;
```

### 3. Setup Backend
```bash
cd backend
py -3.12 -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env` file inside `backend/` folder:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/taskflow
SECRET_KEY=taskflow-super-secret-key-2024
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
```

Run backend:
```bash
uvicorn app.main:app --reload --port 8000
```

> Backend running at http://localhost:8000
> API Docs at http://localhost:8000/docs

### 4. Setup Frontend
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```

> Frontend running at http://localhost:3000

---

##  Deployment (Railway)

### 1. Push Code to GitHub
```bash
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/TaskFlow.git
git push -u origin main
```

### 2. Create Railway Account
- Go to railway.app
- Sign up with GitHub

### 3. Create New Project
- Click New Project
- Select Deploy from GitHub repo
- Select your TaskFlow repository

### 4. Add PostgreSQL Database
- Click New → Database → Add PostgreSQL
- Click on Postgres service → Variables tab
- Copy the DATABASE_URL value

### 5. Deploy Backend
- Click New → GitHub Repo → select TaskFlow
- Go to Settings → set Root Directory to `backend`
- Go to Variables → add:
```
DATABASE_URL=your-railway-postgres-url
SECRET_KEY=taskflow-secret-key-2024
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
BACKEND_CORS_ORIGINS=["*"]
PORT=8000
```
- Go to Settings → Networking → Generate Domain → set port 8000
- Copy your backend URL

### 6. Deploy Frontend
- Update `frontend/src/services/api.js` baseURL to your backend URL
- Click New → GitHub Repo → select TaskFlow again
- Go to Settings → set Root Directory to `frontend`
- Go to Settings → Networking → Generate Domain → set port 80
- Frontend is now live

---

## 🗄️ Database Schema

```
users           → id, name, email, hashed_password
projects        → id, name, description, creator_id
project_members → project_id, user_id, role (admin/member)
tasks           → id, title, status, priority, due_date, assignee_id, project_id
```

---

## 🔐 Role Based Access

| Action | Admin | Member |
|--------|-------|--------|
| Create/delete tasks | Y | N |
| Assign tasks | Y | N |
| View all tasks | Y | N |
| View own tasks | Y | Y |
| Update task status | Y | Y |
| Add/remove members | Y | N |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Register |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| GET | /api/projects/ | List projects |
| POST | /api/projects/ | Create project |
| PUT | /api/projects/{id} | Update project |
| DELETE | /api/projects/{id} | Delete project |
| POST | /api/projects/{id}/members | Add member |
| DELETE | /api/projects/{id}/members/{uid} | Remove member |
| GET | /api/projects/{id}/tasks | List tasks |
| POST | /api/projects/{id}/tasks | Create task |
| PUT | /api/tasks/{id} | Update task |
| DELETE | /api/tasks/{id} | Delete task |
| GET | /api/dashboard/ | Get stats |