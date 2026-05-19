# JobShock — Inclusive Job Posting Chat

Chat assistant for hiring managers to **draft**, **edit**, and **compliance-check** job descriptions. Every reply is grounded in a seeded **company knowledge bundle** (competitor JDs, worker profiles, projects, synthetic resumes, and company context). The Hugging Face API evaluates that knowledge before responding.

## Prerequisites

- Python 3.11+
- Node.js 18+ and npm
- Hugging Face API token

## Setup

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # add HF_API_KEY
```

```bash
cd frontend && npm install
```

## Run (two terminals)

**Terminal 1 — API**

```bash
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

**Terminal 2 — UI**

```bash
cd frontend
npm run dev
```

Open **http://localhost:5173**

## How it works

| Piece | Role |
|-------|------|
| [`data/knowledge/knowledge_bundle.json`](data/knowledge/knowledge_bundle.json) | Company memory: competitors, team, projects, resumes, compliance rules |
| [`knowledge.py`](knowledge.py) | Selects relevant records for each chat turn |
| [`main.py`](main.py) | `POST /api/chat` — builds prompt, calls HF Inference API |
| **Frontend** | Phased wireframe UI: intro → chat → summary → generating → results (mock compliance sidebar) |

## Demo script (~3 min)

1. **Intro** — type your hiring goal in the bottom chatbox and send.
2. **Conversation** — chat 1–2 turns; answer Q1–Q3 in your second message.
3. **Summary** — review your needs / problem / title → click **Confirm**.
4. **Generating** — wait on the lightning screen while the API runs.
5. **Results** — review **Job Description v0** and the mock sidebar (52/100 + category accordions).
6. Use the bottom chat to request edits; the draft updates, sidebar stays demo/mock data.

## API

- `GET /health` — health check
- `POST /api/chat` — `{ messages, current_draft }` → `{ reply, job_draft, sources_used, evidence_summary }`

## Environment

| Variable | Description |
|----------|-------------|
| `HF_API_KEY` | [Hugging Face token](https://huggingface.co/settings/tokens) |
| `HF_MODEL` | Default: `meta-llama/Llama-3.1-8B-Instruct` |
| `HF_PROVIDER` | Default: `fastest` (or `groq`, `featherless-ai`) |
| `HF_MAX_TOKENS` | Default: `512` (lower = faster responses) |
| `MAX_CONTEXT_CHARS` | Default: `1800` (knowledge injected per request) |

## Fallback

If the API is slow or down, see [`data/sample_output.md`](data/sample_output.md) for an example posting.

## Deploy on Vercel

This repo is set up for a **single Vercel project**: static React UI + FastAPI on the same domain.

1. Import [github.com/wina-jpg/gates_buildathon](https://github.com/wina-jpg/gates_buildathon) in the [Vercel dashboard](https://vercel.com/new).
2. **Root directory:** repo root (`.`). Do **not** set it to `frontend/` — Vercel must see [`main.py`](main.py) at the project root.
3. **Environment variables** (Project → Settings → Environment Variables):
   - `HF_API_KEY` (required)
   - Optional: `HF_MODEL`, `HF_PROVIDER`, `HF_MAX_TOKENS`, `MAX_CONTEXT_CHARS`
4. Deploy. [`vercel.json`](vercel.json) builds the UI to `frontend/dist`; Vercel auto-detects the FastAPI `app` in [`main.py`](main.py) (no `api/` folder needed).
5. Open your `*.vercel.app` URL — the UI calls `/api/chat` on the same origin.

**Local dev** is unchanged (two terminals: `uvicorn` + `npm run dev` with Vite proxy).

**Split deploy** (UI on Vercel, API elsewhere): set `VITE_API_URL` at build time to your API origin (e.g. `https://api.example.com`).
