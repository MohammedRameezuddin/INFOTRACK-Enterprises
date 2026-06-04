# Infotrack AI Engine (FastAPI skeleton)

Quick start (inside `backend/ai`):

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Endpoints:
- `GET /health` — health check
- `POST /embed` — placeholder embeddings
- `POST /search` — placeholder semantic search

Replace placeholders with real embedding model calls and pgvector integration.
