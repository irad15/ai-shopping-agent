# AI Shopping Agent

This project consists of two main components:
1. A **Python Backend** built with FastAPI, LangGraph, and LangChain.
2. A **Next.js React Frontend** using Tailwind CSS and Assistant UI.

Follow the instructions below to get your virtual environments set up and run the application locally.

---

## 1. Backend Setup

The backend uses [uv](https://github.com/astral-sh/uv) for fast and reliable dependency management. This ensures your virtual environments (VENVs) sync perfectly with the lockfile for consistent development.

### Prerequisites
- Python (3.12+ recommended as per `pyproject.toml`).
- `uv` installed (`pip install uv` or `curl -LsSf https://astral.sh/uv/install.sh | sh`).

### Installing Dependencies

Navigate to the backend directory and use `uv sync`. This will automatically create a `.venv/` folder and sync the exact requirements required to run the project.

```bash
cd backend
uv sync
```

Alternatively, if you want to use standard `pip` inside a traditional virtual environment:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install .
```

### Environment Variables
Ensure you have your `.env` file in the `backend/` directory with the following variables configured (it's already present, but please ensure your key is valid):
```env
OPENAI_API_KEY=your_openai_api_key_here
```

### Running the Backend

Start the FastAPI server via your virtual environment:

```bash
cd backend
uv run uvicorn main:app --reload
```
*If you activated a traditional `pip` venv, just run `uvicorn main:app --reload`.*

The API will be running at **http://localhost:8000**.

---

## 2. Frontend Setup

The frontend is a standard Next.js App Router project leveraging React and Tailwind.

### Prerequisites
- Node.js (v18.18.0 or later recommended).

### Installing Dependencies

Navigate to the frontend directory and install the required packages using `npm`:

```bash
cd frontend
npm install
```

### Running the Frontend

To start the Next.js development server:

```bash
cd frontend
npm run dev
```

The user interface will be available at **http://localhost:3000**. Open this in your browser to interact with the agent.
