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
*   **Salesman Framework:** Injected a strict conversational protocol. The agent is instructed to ask qualifying questions before searching, limiting "interrogation" (max 2 questions per turn) and avoiding premature tool calls.
*   **Inventory Business Rules:** A custom backend interceptor calculates `is_purchasable` (stock ≥ minimumOrderQuantity) and strictly strips sensitive fields like `minimumOrderQuantity` before the LLM or frontend ever sees them.
*   **Strict Brand Filtering:** To overcome the broadness of basic keyword search APIs, we implemented a Python-layer brand filter that ensures "Urban Chic" queries return *exclusively* that brand, with no irrelevant "similar" results.
*   **Performance-First UI:** Implemented a **Global Product Modal** using React Context. This prevents DOM bloat by rendering only a single modal instance for the entire application, shared by all 100+ potential product cards.
*   **Contextual Review Synthesis:** Automatically sanitizes product reviews (stripping PII and dates) and instructs the LLM to weave synthesized customer sentiment directly into the conversation.

---

## 🧠 Design Philosophy

### **Assumptions**
*   **Consultative First:** We assume a shopping agent should be a "copilot," not just a search bar. The priority is user understanding over instant results.
*   **Data Integrity:** We assume internal business logic (like minimum order quantities) is proprietary and must be hidden from the AI's generation context for security.

### **Tradeoffs**
*   **Latency vs. Accuracy:** We perform post-fetch filtering in Python to fix API broadness. This adds a few milliseconds of latency but guarantees brand accuracy—a tradeoff essential for a "Premium" feel.
*   **Context Window vs. Detail:** We sanitize reviews to keep only `rating` and `comment`. We lose the "Who said it," but we save ~40% in token costs per product list.

### **Limitations**
*   **Mock API:** The project currently relies on `DummyJSON`. While perfectly functional for this demonstration, a real-world deployment would require a more robust ElasticSearch/VectorDB backend for semantic search.
*   **Local State:** `thread_id` is currently persisted in `localStorage` for convenience. A full production user system would tie these to an authenticated User ID.

---

## 🎨 Aesthetics
The UI is designed to feel **State-of-the-Art**:
- **Glassmorphism:** Deep backdrop blurs and semi-transparent surfaces.
- **Micro-animations:** Powered by `framer-motion` for smooth modal transitions and "Out of Stock" overlays.
- **Premium Dark Mode:** A zinc-based color palette with indigo accents for a sophisticated "Consultant" vibe.

---
