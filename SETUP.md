# TaskFlow — VS Code Setup Guide

## What you need installed first
- **Python 3.11+** → https://python.org/downloads
- **Node.js 18+** → https://nodejs.org
- **PostgreSQL** → https://www.postgresql.org/download
- **VS Code** → https://code.visualstudio.com

---

## Step 1 — Set up PostgreSQL database

After installing PostgreSQL, open **pgAdmin** or **psql** and run:

```sql
CREATE DATABASE taskflow;
```

Your PostgreSQL default credentials are usually:
- Host: `localhost`
- Port: `5432`
- User: `postgres`
- Password: whatever you set during PostgreSQL install

Open `backend/.env` and update this line to match your password:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/taskflow
```

---

## Step 2 — Run the Backend (FastAPI)

Open a **terminal in VS Code** (`Ctrl + ~`) and run these commands:

```bash
# Go into the backend folder
cd backend

# Create a virtual environment
python -m venv venv

# Activate it (Windows)
venv\Scripts\activate

# Activate it (Mac/Linux)
source venv/bin/activate

# Install all packages
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload --port 8000
```

+ Backend is running at: **http://localhost:8000**
+ API docs at: **http://localhost:8000/docs**

> The database tables are created automatically when the server starts.

---

## Step 3 — Run the Frontend (React)

Open a **second terminal** in VS Code (`Ctrl + Shift + ~`) and run:

```bash
# Go into the frontend folder
cd frontend

# Install packages
npm install

# Start the dev server
npm run dev
```

> Frontend is running at: **http://localhost:3000**

---

## Running both at the same time

Just keep **two terminals open** in VS Code — one for backend, one for frontend.

```
Terminal 1 (backend):    uvicorn app.main:app --reload --port 8000
Terminal 2 (frontend):   npm run dev
```

---

## Common errors

**"Module not found" in backend**
→ Make sure your virtual environment is activated (you should see `(venv)` in terminal)

**"Port already in use"**
→ Something else is using port 8000 or 3000. Kill it or change the port.

**"password authentication failed for user postgres"**
→ Update the password in `backend/.env` to match your PostgreSQL password.

**"database taskflow does not exist"**
→ Run `CREATE DATABASE taskflow;` in pgAdmin or psql.

**npm install fails**
→ Make sure Node.js 18+ is installed: `node --version`
