import json
import os
import re
import time
from pathlib import Path
from typing import Any

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()

HF_API_KEY = os.getenv("HF_API_KEY", "")
HF_MODEL = os.getenv("HF_MODEL", "meta-llama/Llama-3.1-8B-Instruct")
HF_PROVIDER = os.getenv("HF_PROVIDER", "fastest")
HF_MAX_TOKENS = int(os.getenv("HF_MAX_TOKENS", "512"))
HF_CHAT_URL = os.getenv(
    "HF_CHAT_URL",
    "https://router.huggingface.co/v1/chat/completions",
)


def _resolve_hf_model() -> str:
    """Append :provider suffix required by HF Inference Providers router."""
    if ":" in HF_MODEL:
        return HF_MODEL
    if HF_PROVIDER:
        return f"{HF_MODEL}:{HF_PROVIDER}"
    return HF_MODEL

DEBUG_LOG_PATH = Path(__file__).resolve().parent / ".cursor" / "debug-562a42.log"


def _debug_log(hypothesis_id: str, location: str, message: str, data: dict) -> None:
    # #region agent log
    try:
        payload = {
            "sessionId": "562a42",
            "hypothesisId": hypothesis_id,
            "location": location,
            "message": message,
            "data": data,
            "timestamp": int(time.time() * 1000),
        }
        DEBUG_LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
        with DEBUG_LOG_PATH.open("a", encoding="utf-8") as f:
            f.write(json.dumps(payload) + "\n")
    except OSError:
        pass
    # #endregion


def _bootstrap_import_debug() -> None:
    import sys

    root = Path(__file__).resolve().parent
    kp = root / "knowledge.py"
    data_path = root / "data"
    bundle = root / "data" / "knowledge" / "knowledge_bundle.json"
    # #region agent log
    _debug_log(
        "A",
        "main.py:bootstrap",
        "pre-import filesystem check",
        {
            "cwd": os.getcwd(),
            "module_dir": str(root),
            "sys_path_head": sys.path[:5],
            "knowledge_py_exists": kp.is_file(),
            "data_is_file": data_path.is_file(),
            "data_is_dir": data_path.is_dir(),
            "bundle_exists": bundle.is_file(),
        },
    )
    # #endregion


_bootstrap_import_debug()

try:
    from knowledge import select_context

    # #region agent log
    _debug_log(
        "B",
        "main.py:import",
        "knowledge import ok",
        {"select_context_callable": callable(select_context)},
    )
    # #endregion
except ModuleNotFoundError as exc:
    # #region agent log
    _debug_log(
        "A",
        "main.py:import",
        "knowledge import failed",
        {"error": str(exc), "exc_type": type(exc).__name__},
    )
    # #endregion
    raise

def _cors_origins() -> list[str]:
    origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
    vercel_url = os.getenv("VERCEL_URL")
    if vercel_url:
        origins.append(f"https://{vercel_url}")
    extra = os.getenv("CORS_ORIGINS", "")
    origins.extend(s.strip() for s in extra.split(",") if s.strip())
    return origins


app = FastAPI(title="JobShock API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SYSTEM_PROMPT = """You are JobShock, a compliant HR copilot for Acme Data Labs.

DEMO CONVERSATION FLOW (when generating the final JD):
The user already went through: (1) stated hiring need, (2) answered Q1–Q3, (3) confirmed a summary.
Your job now is to produce the job description draft only — do not re-ask the three questions.

Use the COMPANY KNOWLEDGE BASE only — cite sources like (project:atlas-migration).
Follow compliance_rules. No invented salaries or benefits.

When asked to generate a job description you MUST output:
1. A ```evidence block with 3-4 short bullets citing knowledge sources.
2. A ```job block containing the COMPLETE job posting in markdown (title, about, responsibilities, requirements).

For full job postings, include an Equal Opportunity section or closing paragraph using the company's equal_opportunity_statement from the knowledge base unless the user opts out.

If the user is editing an existing draft, apply their requested changes and return updated ```job block."""

GENERATE_REQUEST_MARKERS = (
    "generate the complete job description",
    "generate the job description",
)


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    current_draft: str | None = None


class ChatResponse(BaseModel):
    reply: str
    job_draft: str | None = None
    model: str
    sources_used: list[str] = Field(default_factory=list)
    evidence_summary: str | None = None


class JobGenerateRequest(BaseModel):
    job_title: str
    department: str | None = None
    seniority: str
    location: str | None = None
    key_skills: list[str] = Field(default_factory=list)
    company_context: str | None = None
    tone: str = "professional"


class JobGenerateResponse(BaseModel):
    job_description: str
    model: str


def _extract_generated_text(payload: Any) -> str:
    if isinstance(payload, list) and payload:
        first = payload[0]
        if isinstance(first, dict) and "generated_text" in first:
            return str(first["generated_text"]).strip()
    if isinstance(payload, dict):
        if "generated_text" in payload:
            return str(payload["generated_text"]).strip()
        if "choices" in payload and payload["choices"]:
            choice = payload["choices"][0]
            if isinstance(choice, dict):
                message = choice.get("message", {})
                if isinstance(message, dict) and message.get("content"):
                    return str(message["content"]).strip()
                if choice.get("text"):
                    return str(choice["text"]).strip()
    if isinstance(payload, str):
        return payload.strip()
    raise ValueError("Unexpected response format from Hugging Face")


def _hf_error_detail(response: requests.Response) -> str:
    try:
        err = response.json()
        message = err.get("error") or err.get("message") or response.text
        if isinstance(message, dict):
            message = message.get("message", str(message))
    except ValueError:
        message = response.text[:300]
    if response.status_code == 400 and "not supported" in str(message).lower():
        return (
            f"{message} Enable providers at https://hf.co/settings/inference-providers "
            f"or set HF_PROVIDER=featherless-ai in .env (uses model:id:provider format)."
        )
    return str(message)


def _truncate(text: str, limit: int) -> str:
    if len(text) <= limit:
        return text
    return text[: limit - 3] + "..."


def _call_hf_chat(
    system: str, user_content: str, max_tokens: int | None = None
) -> str:
    if not HF_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="HF_API_KEY is not set. Copy .env.example to .env and add your token.",
        )

    resolved_model = _resolve_hf_model()
    token_limit = max_tokens if max_tokens is not None else HF_MAX_TOKENS
    headers = {"Authorization": f"Bearer {HF_API_KEY}"}
    body = {
        "model": resolved_model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user_content},
        ],
        "max_tokens": token_limit,
        "temperature": 0.5,
    }

    started_ms = int(time.time() * 1000)
    # #region agent log
    _debug_log(
        "D",
        "main.py:_call_hf_chat:pre",
        "HF chat request starting",
        {
            "url": HF_CHAT_URL,
            "model": resolved_model,
            "max_tokens": token_limit,
            "prompt_chars": len(system) + len(user_content),
            "key_set": bool(HF_API_KEY),
        },
    )
    # #endregion

    try:
        response = requests.post(
            HF_CHAT_URL,
            headers=headers,
            json=body,
            timeout=120,
        )
    except requests.RequestException as exc:
        # #region agent log
        _debug_log(
            "C",
            "main.py:_call_hf_chat:except",
            "HF chat network error",
            {"error": str(exc)},
        )
        # #endregion
        raise HTTPException(
            status_code=503,
            detail=f"Could not reach Hugging Face Inference API: {exc}",
        ) from exc

    elapsed_ms = int(time.time() * 1000) - started_ms
    # #region agent log
    _debug_log(
        "D",
        "main.py:_call_hf_chat:post",
        "HF chat response received",
        {
            "status": response.status_code,
            "elapsed_ms": elapsed_ms,
            "body_preview": response.text[:200],
            "is_html": response.text.lstrip().startswith("<!DOCTYPE"),
        },
    )
    # #endregion

    if response.status_code == 401:
        raise HTTPException(
            status_code=502,
            detail="Invalid Hugging Face API key. Use a token with Inference Providers permission.",
        )
    if response.status_code == 403:
        raise HTTPException(
            status_code=502,
            detail="Access denied. Check your Hugging Face API token permissions.",
        )
    if response.status_code == 503:
        raise HTTPException(
            status_code=503,
            detail="Model is loading. Wait a moment and try again.",
        )
    if not response.ok:
        raise HTTPException(
            status_code=502,
            detail=f"Hugging Face API error: {_hf_error_detail(response)}",
        )

    try:
        data = response.json()
        return _extract_generated_text(data)
    except ValueError as exc:
        raise HTTPException(
            status_code=502,
            detail="Could not parse response from model.",
        ) from exc


def _parse_fenced_block(text: str, block_name: str) -> str | None:
    pattern = rf"```{re.escape(block_name)}\s*\n(.*?)```"
    match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
    if match:
        return match.group(1).strip()
    return None


def _strip_fenced_blocks(text: str) -> str:
    cleaned = re.sub(r"```(?:job|evidence)\s*\n.*?```", "", text, flags=re.DOTALL | re.IGNORECASE)
    return cleaned.strip()


def _is_generate_request(text: str) -> bool:
    lower = text.lower()
    return any(marker in lower for marker in GENERATE_REQUEST_MARKERS)


def _extract_job_draft(raw: str) -> str | None:
    for block_name in ("job", "markdown", "jd"):
        block = _parse_fenced_block(raw, block_name)
        if block:
            return block
    generic = re.search(r"```\w*\s*\n(.*?)```", raw, re.DOTALL)
    if generic and len(generic.group(1).strip()) > 150:
        return generic.group(1).strip()
    stripped = _strip_fenced_blocks(raw)
    if len(stripped) > 200 and (
        "##" in stripped or "Responsibilities" in stripped or "Requirements" in stripped
    ):
        return stripped
    return None


def _context_query(messages: list[ChatMessage], last_user: str) -> str:
    if _is_generate_request(last_user):
        parts = [
            m.content
            for m in messages
            if m.role == "user" and not _is_generate_request(m.content)
        ]
        return " ".join(parts) or last_user
    return last_user


def _build_chat_user_content(
    context: str,
    current_draft: str | None,
    messages: list[ChatMessage],
    latest_user: str,
) -> str:
    generating = _is_generate_request(latest_user)
    history_window = 12 if generating else 4
    per_msg_limit = 700 if generating else 400

    history_lines = []
    for msg in messages[-history_window:]:
        role = msg.role.upper()
        content = _truncate(msg.content, per_msg_limit)
        history_lines.append(f"{role}: {content}")

    history = "\n".join(history_lines) if history_lines else "(none)"
    draft = _truncate(current_draft, 1200) if current_draft else "None"

    return f"""KNOWLEDGE:
{context}

DRAFT:
{draft}

HISTORY:
{history}

USER:
{latest_user}"""


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/chat", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    if not req.messages:
        raise HTTPException(status_code=400, detail="messages cannot be empty")

    last_user = next(
        (m.content for m in reversed(req.messages) if m.role == "user"),
        None,
    )
    if not last_user:
        raise HTTPException(status_code=400, detail="No user message found")

    context, sources_used = select_context(
        _context_query(req.messages, last_user), req.current_draft
    )
    user_content = _build_chat_user_content(
        context, req.current_draft, req.messages, last_user
    )
    token_limit = min(1024, max(HF_MAX_TOKENS, 768)) if _is_generate_request(last_user) else None
    raw = _call_hf_chat(SYSTEM_PROMPT, user_content, max_tokens=token_limit)

    if not raw:
        raise HTTPException(status_code=502, detail="Model returned an empty response.")

    job_draft = _extract_job_draft(raw)
    evidence_summary = _parse_fenced_block(raw, "evidence")
    reply = _strip_fenced_blocks(raw) or raw

    return ChatResponse(
        reply=reply,
        job_draft=job_draft,
        model=_resolve_hf_model(),
        sources_used=sources_used,
        evidence_summary=evidence_summary,
    )


@app.post("/api/generate", response_model=JobGenerateResponse)
def generate_job_description(req: JobGenerateRequest) -> JobGenerateResponse:
    skills = ", ".join(req.key_skills) if req.key_skills else "not specified"
    user_msg = (
        f"Draft a {req.seniority} {req.job_title} job description. "
        f"Department: {req.department or 'not specified'}. "
        f"Location: {req.location or 'not specified'}. "
        f"Skills: {skills}. Tone: {req.tone}. "
        f"Extra context: {req.company_context or 'use company knowledge only'}."
    )
    chat_req = ChatRequest(
        messages=[ChatMessage(role="user", content=user_msg)],
        current_draft=None,
    )
    result = chat(chat_req)
    jd = result.job_draft or result.reply
    if not jd:
        raise HTTPException(status_code=502, detail="Model returned an empty job description.")
    return JobGenerateResponse(job_description=jd, model=HF_MODEL)
