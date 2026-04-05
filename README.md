# AI Shopping Agent: Consultative Copilot 🛍️

A premium, production-grade AI shopping assistant built with **LangGraph**, **Next.js**, and a consultative "Salesman Framework." This agent doesn't just search—it understands user needs, enforces strict business inventory rules, and synthesizes customer reviews into high-converting sales pitches.

---

## 🛠️ Prerequisites

Before starting, ensure you have the following installed:
- **Python 3.12+**
- **Node.js 18+** (with `npm`)
- **PostgreSQL 15+** (Docker is provided for local setup, but any Postgres instance will work)
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

#### **Your Connection String**
Regardless of your choice, you will need a `DATABASE_URL` for your `.env` file (located in the `backend/` folder):
- **For local Docker:** `postgresql://postgres:postgres@localhost:5432/postgres`

#### **Local Docker**
Start the PostgreSQL instance in the background:
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

# Set up environment variables (Create .env inside the /backend folder)
DATABASE_URL=your_postgres_url
OPENAI_API_KEY=your_openai_key

# Start the server
uv run python main.py
```

### 2. Frontend Setup (Open a new terminal)
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

### **Core Architecture Foundations**
* **Agentic Core (LangGraph):** We use LangGraph to manage the agent's state and tool execution. It is a highly convenient framework that automatically handles "hidden" background processes—like state persistence to the database—allowing for complex multi-turn loops and error recovery without manual state management.
* **Durable Memory (PostgreSQL):** Implementation of `AsyncPostgresSaver` ensures conversation "Checkpoints" are saved in real-time, preventing data loss during refreshes or crashes. The `thread_id` acts as the unique linking key (effectively the user's identifier), allowing the agent to instantly retrieve the exact message history and conversational context from the database upon every new request.
* **Vercel AI SDK:** Acts as the primary data-streaming protocol. It normalizes the communication between the Python backend and the React frontend, enabling low-latency, character-by-character message delivery.
* **assistant-ui:** A set of headless React components that connect to the Vercel AI SDK. It provides the core chat logic, tool UI registration, and streaming state management for a professional UI.

### **The Streaming Bridge**
By capturing internal LangGraph events via `astream_events`, the **Streaming Bridge** translates AI reasoning into the Vercel protocol in real-time. This allows the frontend to render text and UI components (like product cards) incrementally, giving the user instant feedback while the agent is still "thinking."

### **Production-Grade Improvements**
* **Hallucination Guardrails:** The agent calculates inventory availability behind the scenes. By hiding internal logic constraints from the LLM and only providing ground-truth data, we ensure "air-tight" stock reliability.
* **State Mapping (`History_helper`):** This utility normalizes complex LangGraph message objects into the Vercel UI format, merging `ToolMessages` into AI responses to ensure product cards render consistently during history restoration.

---

## 🧠 Design Philosophy

### **Assumptions**
* **Consultative Social Proof:** We assumed that designing the agent as a "Consultative Salesperson" who actively integrates user reviews into its sales pitch creates a more natural, trustworthy experience than simply listing product specs.
* **Database as Source of Truth:** We assume the database is always reachable. To optimize, the frontend (`Route.ts`) only sends the *latest* message, relying on the backend to reconstruct history from the `thread_id`.

### **Tradeoffs**
* **Protocol Complexity:** We chose to manually bridge LangGraph events to the Vercel protocol. This increased development time but resulted in a "leaner" Frontend that doesn't need to understand LangGraph's internal state logic.
* **Initial Render Delay:** In `ChatRuntimeProvider.tsx`, we consciously delay rendering the UI until the full history is fetched from Postgres. This prevents "visual flickering" and layout shifts at the cost of a slightly longer initial load time.

### **Limitations**
* **Network Sensitivity:** Because the Streaming Bridge relies on a continuous event stream, it is sensitive to momentary network drops. Currently, an interrupted stream requires a page refresh to resume.
* **Client-Side Persistence:** The `thread_id` is stored in `localStorage`. Without a full authentication system, clearing the browser cache will cause the agent to treat the user as new, even though their data is safely stored in the Backend.

---

## 🎨 Aesthetics
The UI is built using `@assistant-ui/react`, leveraging a headless architecture. This allows for a sleek, minimalist design that focuses on the conversation while maintaining granular control over how product cards and consultative sales pitches are displayed.