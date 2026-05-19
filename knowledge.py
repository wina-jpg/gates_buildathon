import json
import os
import re
from functools import lru_cache
from pathlib import Path
from typing import Any

BUNDLE_PATH = Path(__file__).resolve().parent / "data" / "knowledge" / "knowledge_bundle.json"
MAX_CONTEXT_CHARS = int(os.getenv("MAX_CONTEXT_CHARS", "1800"))

EVALUATION_KEYWORDS = frozenset(
    {
        "compare",
        "competitor",
        "compliance",
        "compliant",
        "evaluate",
        "draft",
        "resume",
        "project",
        "profile",
        "requirement",
        "edit",
        "revise",
        "check",
        "benchmark",
    }
)


@lru_cache(maxsize=1)
def load_knowledge_bundle() -> dict[str, Any]:
    with BUNDLE_PATH.open(encoding="utf-8") as f:
        return json.load(f)


def _tokenize(text: str) -> set[str]:
    return {t for t in re.findall(r"[a-z0-9]+", text.lower()) if len(t) > 2}


def _score_record(record: dict[str, Any], query_tokens: set[str]) -> int:
    blob = json.dumps(record, default=str).lower()
    record_tokens = _tokenize(blob)
    return len(query_tokens & record_tokens)


def _truncate(text: str, limit: int) -> str:
    if len(text) <= limit:
        return text
    return text[: limit - 3] + "..."


def _format_company(company: dict[str, Any]) -> str:
    rules = company.get("compliance_rules", [])
    rules_text = "\n".join(f"- {r}" for r in rules)
    values = ", ".join(company.get("values", []))
    benefits = ", ".join(company.get("benefits", []))
    eoe = company.get("equal_opportunity_statement", "")
    eoe_block = (
        f"\nEqual opportunity (use in full JDs when appropriate):\n{eoe}"
        if eoe
        else ""
    )
    return (
        f"[company:acme]\n"
        f"Name: {company.get('name', '')}\n"
        f"Mission: {company.get('mission', '')}\n"
        f"Values: {values}\n"
        f"Benefits: {benefits}\n"
        f"Compliance rules:\n{rules_text}"
        f"{eoe_block}"
    )


def select_context(user_message: str, current_draft: str | None = None) -> tuple[str, list[str]]:
    bundle = load_knowledge_bundle()
    sources_used: list[str] = ["company_context"]

    query = f"{user_message} {current_draft or ''}"
    query_tokens = _tokenize(query)
    msg_lower = user_message.lower()
    broad_eval = any(kw in msg_lower for kw in EVALUATION_KEYWORDS)

    parts: list[str] = []
    parts.append("## Company\n" + _format_company(bundle["company_context"]))

    competitors = bundle.get("competitor_jds", [])
    if broad_eval or "competitor" in msg_lower or "compare" in msg_lower:
        comp_lines = []
        for jd in competitors:
            cid = jd.get("id", jd.get("company", "unknown"))
            sources_used.append(f"competitor:{cid}")
            comp_lines.append(
                f"[competitor:{cid}]\n"
                f"Company: {jd.get('company')} | Title: {jd.get('title')}\n"
                f"{jd.get('text', '')}"
            )
        parts.append("## Competitor JDs\n" + "\n\n".join(comp_lines))
    else:
        ranked = sorted(
            competitors,
            key=lambda r: _score_record(r, query_tokens),
            reverse=True,
        )
        if ranked and _score_record(ranked[0], query_tokens) > 0:
            jd = ranked[0]
            cid = jd.get("id", jd.get("company", "unknown"))
            sources_used.append(f"competitor:{cid}")
            parts.append(
                "## Competitor JD (top match)\n"
                f"[competitor:{cid}]\n{jd.get('company')}: {jd.get('text', '')}"
            )

    for section_key, header, id_field in [
        ("projects", "## Internal projects", "id"),
        ("worker_profiles", "## Worker profiles", "id"),
        ("synthetic_resumes", "## Synthetic resumes", "id"),
    ]:
        records = bundle.get(section_key, [])
        if broad_eval:
            ranked = records
        else:
            ranked = sorted(
                records,
                key=lambda r: _score_record(r, query_tokens),
                reverse=True,
            )[:3 if section_key == "projects" else 2]

        lines = []
        for rec in ranked:
            if not broad_eval and _score_record(rec, query_tokens) == 0:
                continue
            rid = rec.get(id_field, "unknown")
            prefix = section_key.rstrip("s").replace("_", "")
            if section_key == "worker_profiles":
                tag = f"profile:{rid}"
            elif section_key == "synthetic_resumes":
                tag = f"resume:{rid}"
            elif section_key == "projects":
                tag = f"project:{rid}"
            else:
                tag = f"{prefix}:{rid}"
            sources_used.append(tag)
            lines.append(f"[{tag}]\n{json.dumps(rec, indent=0)}")

        if lines:
            parts.append(f"{header}\n" + "\n\n".join(lines))

    context = "\n\n".join(parts)
    return _truncate(context, MAX_CONTEXT_CHARS), sources_used
