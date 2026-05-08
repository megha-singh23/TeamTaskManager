# Team Task Management Application

A full-stack collaborative task management web app built with React, FastAPI, PostgreSQL, and SQLAlchemy ORM.

---

## 🏗️ Architecture

taskflow/
├── backend/             # FastAPI application
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py          # Auth dependencies
│   │   │   └── routes/
│   │   │       ├── auth.py      # Signup / Login / Me
│   │   │       ├── projects.py  # Project CRUD + members
│   │   │       ├── tasks.py     # Task CRUD
│   │   │       └── dashboard.py # Stats & analytics
│   │   ├── core/
│   │   │   ├── config.py        # Settings (pydantic-settings)
│   │   │   └── security.py      # JWT + bcrypt
│   │   ├── db/
│   │   │   └── session.py       # SQLAlchemy engine + get_db
│   │   ├── models/
│   │   │   └── models.py        # User, Project, ProjectMember, Task
│   │   ├── schemas/
│   │   │   └── schemas.py       # Pydantic request/response schemas
│   │   └── main.py              # FastAPI app + CORS + routers
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/            # React + Vite application
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/Layout.jsx   # Sidebar nav
│   │   │   └── ui/                 # Reusable UI components
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── DashboardPage.jsx   # Charts + stats
│   │   │   ├── ProjectsPage.jsx    # Project list
│   │   │   └── ProjectDetailPage.jsx # Kanban + members
│   │   ├── services/api.js         # Axios + all API calls
│   │   └── store/AuthContext.jsx   # Auth state
│   ├── Dockerfile
│   └── nginx.conf
│
└── docker-compose.yml

---

## 🗄️ Database Schema

```
users
  id, name, email, hashed_password, is_active, created_at

projects
  id, name, description, creator_id → users.id, created_at

project_members
  id, project_id → projects.id, user_id → users.id, role (admin|member), joined_at

tasks
  id, title, description, status (todo|in_progress|done),
  priority (low|medium|high|urgent), due_date,
  project_id → projects.id, assignee_id → users.id,
  creator_id → users.id, created_at, updated_at
```

---

## 🔐 Role-Based Access

| Action                        | Admin | Member |
|-------------------------------|-------|--------|
| Create/delete tasks           | Y    | N     |
| Assign tasks to members       | Y    | N     |
| Update any task               | Y    | N     |
| Update status of own task     | Y    | Y     |
| View all project tasks        | Y    | N     |
| View assigned tasks only      | Y    | Y     |
| Add/remove project members    | Y    | N     |
| Delete project                | Y    | N     |

---

##  Quick Start

# App runs at:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Option 2: Local development

**Backend:**
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install deps
pip install -r requirements.txt

# Create PostgreSQL database
createdb taskflow

# Configure environment
cp .env.example .env
# Edit .env with your DB credentials

# Run server
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend

# Install deps
npm install

# Run dev server (proxies /api → localhost:8000)
npm run dev
# App runs at http://localhost:3000
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login, get JWT token |
| GET | `/api/auth/me` | Get current user |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/` | List my projects |
| POST | `/api/projects/` | Create project |
| GET | `/api/projects/{id}` | Get project |
| PUT | `/api/projects/{id}` | Update project (admin) |
| DELETE | `/api/projects/{id}` | Delete project (admin) |
| POST | `/api/projects/{id}/members` | Add member (admin) |
| DELETE | `/api/projects/{id}/members/{uid}` | Remove member (admin) |
| PUT | `/api/projects/{id}/members/{uid}/role` | Update member role (admin) |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/{id}/tasks` | List project tasks |
| POST | `/api/projects/{id}/tasks` | Create task (admin) |
| GET | `/api/tasks/{id}` | Get task |
| PUT | `/api/tasks/{id}` | Update task |
| DELETE | `/api/tasks/{id}` | Delete task (admin) |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/dashboard/` | Get stats & analytics |

---

## 🔑 Authentication

All protected routes require:
```
Authorization: Bearer <JWT_TOKEN>
```

Tokens are valid for 7 days by default.

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://...` | PostgreSQL connection string |
| `SECRET_KEY` | — | JWT signing secret (change this!) |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `10080` | Token expiry (7 days) |
| `BACKEND_CORS_ORIGINS` | `[...]` | Allowed CORS origins |

---

## 📋 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS, React Router v6, Recharts |
| Backend | FastAPI, Uvicorn, Python 3.12 |
| ORM | SQLAlchemy 2.0 |
| Database | PostgreSQL 16 |
| Auth | JWT (python-jose), bcrypt (passlib) |
| Validation | Pydantic v2 |
| Deployment | Docker, Docker Compose, Nginx |
 