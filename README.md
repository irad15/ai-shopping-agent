# AI Shopping Agent: Consultative Copilot 🛍️

A premium, production-grade AI shopping assistant built with **LangGraph**, **Next.js**, and a consultative "Salesman Framework." This agent doesn't just search—it understands user needs, enforces strict business inventory rules, and synthesizes customer reviews into high-converting sales pitches.

---

## 🛠️ Prerequisites

Before starting, ensure you have the following installed:
- **Python 3.12+**
- **Node.js 18+** (with `npm`)
- **Docker & Docker Compose** (for persistent PostgreSQL history)
- **OpenAI API Key** (for the LLM reasoning)

#### **📦 Installing `uv`**
This project uses `uv` for lightning-fast Python dependency management. If you don't have it, install it with one command:

- **macOS / Linux**:
  ```bash
  curl -LsSf https://astral.sh/uv/install.sh | sh
  ```
- **Windows**:
  ```powershell
  powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
  ```

---

## 🚀 Quick Start

### 1. Database (Docker)
Start the PostgreSQL instance for persistent conversation history:
```bash
cd backend
# Start the database in the background
docker-compose up -d

# To stop the database:
docker-compose down

# To stop and remove volumes (reset database):
docker-compose down -v
```

### 2. Backend Setup
The backend uses `uv` for lightning-fast Python dependency management.

```bash
cd backend

# Install dependencies
uv sync

# Set up environment variables (.env)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
OPENAI_API_KEY=your_key

# Start the server
uv run python main.py
```

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to start shopping.

---

## 🛠️ Technical Architecture

### **The "Plumbing" (Solid Foundations)**
*   **Agentic Core (LangGraph + LangChain):** Instead of a simple linear chain, we use LangGraph to manage the agent's state, tool execution, and "memory" (Check-pointer). This allows for complex multi-turn conversations and recovery from tool errors.
*   **Persistent Memory (PostgreSQL):** Uses `AsyncPostgresSaver` for thread-level state persistence. Users can refresh their browser and resume their exact conversation state seamlessly.
*   **Modern Frontend (Next.js + assistant-ui):** Built with Next.js 16 and `@assistant-ui/react`. We avoided bloated chat libraries in favor of a headless component architecture that provides maximum control over the UI.
*   **Real-time Streaming:** Leverages the Vercel AI SDK protocol for low-latency, character-by-character response streaming.

### **Production-Grade Improvements**
to add here

---

## 🧠 Design Philosophy

### **Assumptions**
to add here


### **Tradeoffs**
to add here

### **Limitations**
to add here

---

## 🎨 Aesthetics
to add here


---
