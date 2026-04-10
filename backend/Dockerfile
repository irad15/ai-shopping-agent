FROM python:3.12-slim

# Copy uv from the official image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Set the working directory
WORKDIR /app

# Enable bytecode compilation for faster startups
ENV UV_COMPILE_BYTECODE=1

# Copy the project files
COPY pyproject.toml uv.lock ./

# Install project dependencies
# We use --frozen to ensure it strictly respects uv.lock
# We use --no-dev to avoid installing testing dependencies
RUN uv sync --frozen --no-install-project --no-dev

# Copy the rest of the application code
COPY . .

# Install the application itself
RUN uv sync --frozen --no-dev

# Place the virtual environment's bin folder in PATH
ENV PATH="/app/.venv/bin:$PATH"

# Render provides the PORT environment variable dynamically. 
# We define a default of 8000 for local Docker testing.
ENV PORT=8000

# Expose the port
EXPOSE $PORT

# Run the FastAPI server using Uvicorn
CMD uvicorn api:app --host 0.0.0.0 --port $PORT
