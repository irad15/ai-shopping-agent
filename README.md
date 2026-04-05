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

### **Core Architecture Foundations**
* **Agentic Core (LangGraph):** We use LangGraph to manage the agent's state and tool execution. This enables multi-turn loops and recovery from tool errors, moving beyond simple linear chains.
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
* **Perceived Performance > Simplicity:** We assumed that seeing the agent’s progress in real-time (via the Streaming Bridge) is more valuable to the user than a simpler, purely REST-based backend that only returns finished results.
* **Consultative Social Proof:** We assumed that designing the agent as a "Consultative Salesperson" who actively integrates user reviews into its sales pitch creates a more natural, trustworthy experience than simply listing product specs.
* **Database as Source of Truth:** We assume the database is always reachable. To optimize, the frontend (`Route.ts`) only sends the *latest* message, relying on the backend to reconstruct history from the `thread_id`.

### **Tradeoffs**
* **Protocol Complexity:** We chose to manually bridge LangGraph events to the Vercel protocol. This increased development time but resulted in a "leaner" Frontend that doesn't need to understand LangGraph's internal state logic.
* **Aggressive Payload Optimization:** In `Route.ts`, the frontend is designed to send only the last message to the server rather than the full chat history. This aggressively optimizes the payload, but the tradeoff is total reliance on the PostgreSQL database; if the DB fails, the agent loses all memory because the frontend acts with zero backup.
* **Initial Render Delay:** In `ChatRuntimeProvider.tsx`, we consciously delay rendering the UI until the full history is fetched from Postgres. This prevents "visual flickering" and layout shifts at the cost of a slightly longer initial load time.

### **Limitations**
* **Network Sensitivity:** Because the Streaming Bridge relies on a continuous event stream, it is sensitive to momentary network drops. Currently, an interrupted stream requires a page refresh to resume.
* **Client-Side Persistence:** The `thread_id` is stored in `localStorage`. Without a full authentication system, clearing the browser cache will cause the agent to treat the user as new, even though their data is safely stored in the Backend.

---

## 🎨 Aesthetics
The UI is built using `@assistant-ui/react`, leveraging a headless architecture. This allows for a sleek, minimalist design that focuses on the conversation while maintaining granular control over how product cards and consultative sales pitches are displayed.