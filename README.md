# WsScribe - Real-Time Pair Programming Application

### 🔴 Live Demo & Important Note
**Please Read First:** The backend is hosted on a free Render instance, which **spins down on inactivity**.

1.  👉 **Step 1: Wake up the Server**
    Click this link and wait ~50 seconds: [https://wsscribe-backend.onrender.com/docs](https://wsscribe.onrender.com/docs)
    *(When the API documentation loads, the server is ready!)*

2.  👉 **Step 2: Use the Application**
    [https://ws-scribe.vercel.app](https://ws-scribe.vercel.app)

---

## 🚀 Features

* **Real-Time Collaboration:** 2 users can join a unique room and edit code simultaneously (latency < 100ms).
* **Syntax Highlighting:** Integrated Monaco Editor (VS Code core) for a professional coding experience.
* **Mock AI Assistant:** Detects when a user stops typing and offers context-aware code suggestions.
* **Persistence:** Room state is saved to a PostgreSQL database.
* **Instant Sharing:** Generate unique URL links for one-click onboarding.

---

## 🛠 Tech Stack

**Backend**
* **Python 3.10+ / FastAPI:** High-performance async API framework.
* **WebSockets:** For full-duplex communication.
* **PostgreSQL (Asyncpg):** For persistent storage of room data.
* **SQLAlchemy (Async):** ORM for database interactions.
* **Alembic:** For database schema migrations.
* **Docker:** Containerized database service.

**Frontend**
* **React 18 (Vite):** Fast, modern SPA structure.
* **TypeScript:** For type safety and better developer tooling.
* **Monaco Editor:** The industry-standard web code editor.
* **Tailwind CSS + DaisyUI:** For rapid, component-based UI styling.

---

## ⚙️ Setup & Installation

You can run this project in two ways: **Docker (Recommended)** or **Manual**.

### Option A: Docker (Quick Start)
This method spins up the Frontend, Backend, Database, and PgAdmin automatically.
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/akash-skj/WsScribe.git
    cd WsScribe
    ```
2. **Create env files in frontend and backend folder:**
   frontend:
    ```bash
    VITE_API_BASE_URL=http://localhost:8000
    VITE_WEBSOCKET_BASE_URL=ws://localhost:8000
    ```
    backend:
    ```bash
    DATABASE_URL=postgresql+asyncpg://user:password@db:5432/wsscribedb
    ```

2.  **Run with Docker Compose:**
    ```bash
    docker-compose up --build
    ```

3.  **Access the Application:**
    * **Frontend:** [http://localhost:5173](http://localhost:5173)
    * **Backend API:** [http://localhost:8000/docs](http://localhost:8000/docs)
    * **PgAdmin:** [http://localhost:8080](http://localhost:8080) (Login: `admin@admin.com` / `password`)

---

### Option B: Manual Setup (For Development)

### Prerequisites
* Node.js (v18+)
* Python (v3.10+)
* Docker Desktop (for the Database)

### 1. Start the Database
Run the PostgreSQL container using Docker Compose:
```bash
cd backend
docker-compose up -d
```
### 2. Backend Setup
Navigate to the backend folder and install dependencies:
```bash

cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```
create .env file: 
```
DATABASE_URL=postgresql+asyncpg://user:password@db:5432/wsscribedb
```
Create migration file and migrate:
```bash
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```
Run the api server:
```bash
fastapi dev app/main.py
```
### 3. Frontend Setup
Navigate to the frontend folder and install dependencies:
```bash
cd frontend
npm install
```
Create .env file and run:
```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_WEBSOCKET_BASE_URL=ws://localhost:8000
npm run dev
```
The Client will run on http://localhost:5173
