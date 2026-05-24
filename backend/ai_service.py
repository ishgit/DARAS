"""
DARAS AI Service — LLM layer (Gemini 2.5 Flash)
================================================
Provides:
  • answer_question()            – answer user open-questions with RAG context
  • generate_personalised_advice – tailor advice after calculator run
  • generate_admin_insights      – admin dashboard AI summary
  • summarise_for_tts            – shorten text for voice readout

Gracefully degrades: if GEMINI_API_KEY is missing every function
returns None so the rest of the app keeps working.
"""

import os
import json
import logging

log = logging.getLogger(__name__)

# ── Gemini client (lazy init) ────────────────────────────────────────────────
_client = None
_MODEL = "gemini-2.5-flash"


def _get_client():
    """Lazy-init the Gemini client; returns None if no key."""
    global _client
    if _client is not None:
        return _client

    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key:
        log.warning("[DARAS-AI] GEMINI_API_KEY not set — AI features disabled")
        return None

    try:
        from google import genai
        _client = genai.Client(api_key=api_key)
        log.info("[DARAS-AI] Gemini client initialised ✓")
        return _client
    except Exception as e:
        log.error(f"[DARAS-AI] Failed to init Gemini client: {e}")
        return None


# ── System prompt ────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """\
You are DARAS (दारस), a compassionate Hindi-first financial counsellor
for underprivileged Indians. You help daily-wage workers, farmers,
rickshaw drivers, house-maids, and small shopkeepers understand loans,
EMIs, interest, debt traps, and government schemes.

Rules:
- Answer in the language the user asks in (Hindi / Bengali / English).
- Use simple, warm, everyday language — absolutely no finance jargon.
- Be empathetic — never judgmental about the user's debt situation.
- If you reference a rule or regulation, cite the RBI / NABARD guideline
  or government scheme by name.
- If you do not know, say "Hum iske baare mein aur jaankari laayenge"
  — never hallucinate facts.
- Keep answers concise: 100–200 words maximum.
- Use ₹ for Indian Rupee amounts.
- When offering numerical advice, show the calculation step-by-step in
  simple language so the user can follow along.
"""

_LANG_MAP = {
    "hi": ("Hindi (Devanagari script)", "hi-IN"),
    "bn": ("Bengali (Bangla script)", "bn-IN"),
    "en": ("simple English", "en-IN"),
}


def _lang_instruction(lang: str) -> str:
    label, _ = _LANG_MAP.get(lang, _LANG_MAP["hi"])
    return f"Answer in {label}."


# ── Public API ───────────────────────────────────────────────────────────────

def answer_question(
    question: str,
    user_context: dict | None = None,
    rag_chunks: list[str] | None = None,
    language: str = "hi",
) -> str | None:
    """
    Answer a user's open question.

    Parameters
    ----------
    question     : the raw question text from the user
    user_context : dict with keys like income, loan_amount, status, vocation …
    rag_chunks   : pre-retrieved knowledge-base snippets (from rag_engine)
    language     : 'hi' | 'bn' | 'en'

    Returns
    -------
    str  – the AI answer, or None on failure / no API key.
    """
    client = _get_client()
    if client is None:
        return None

    from google import genai as _genai

    parts = [_lang_instruction(language)]

    # RAG context
    if rag_chunks:
        parts.append(
            "Reference Documents (use these to ground your answer):\n"
            + "\n---\n".join(rag_chunks)
        )

    # User context
    if user_context:
        ctx_lines = []
        for k, label in [
            ("income", "Monthly Income"),
            ("loan_amount", "Loan Amount"),
            ("interest_rate", "Interest Rate (%)"),
            ("status", "Risk Status"),
            ("vocation", "Vocation"),
            ("emi", "Current EMI"),
            ("max_safe_loan", "Max Safe Loan"),
        ]:
            v = user_context.get(k)
            if v is not None:
                ctx_lines.append(f"  - {label}: {v}")
        if ctx_lines:
            parts.append("User Profile:\n" + "\n".join(ctx_lines))

    parts.append(f"User's Question: {question}")

    try:
        response = client.models.generate_content(
            model=_MODEL,
            contents="\n\n".join(parts),
            config=_genai.types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.3,
                max_output_tokens=600,
            ),
        )
        return response.text
    except Exception as e:
        log.error(f"[DARAS-AI] answer_question failed: {e}")
        return None


def generate_personalised_advice(
    calc_result: dict,
    language: str = "hi",
) -> str | None:
    """
    Generate 3–4 sentence personalised advice after a loan calculation.
    """
    client = _get_client()
    if client is None:
        return None

    from google import genai as _genai

    prompt = f"""\
{_lang_instruction(language)}

Based on this loan assessment, give brief personalised financial advice
(3–4 sentences, warm and empathetic):

- Monthly Income:    ₹{calc_result.get('income', 0):,.0f}
- Total Expenses:    ₹{calc_result.get('expenses_total', 0):,.0f}
- Monthly Savings:   ₹{calc_result.get('monthly_savings', 0):,.0f}
- Loan Amount:       ₹{calc_result.get('loan_amount', 0):,.0f}
- EMI:               ₹{calc_result.get('emi', 0):,.0f}
- Interest Rate:     {calc_result.get('interest_rate', 0)}%
- Risk Status:       {calc_result.get('status', '?')} ({calc_result.get('conclusion', '?')})
- Max Safe Loan:     ₹{calc_result.get('max_safe_loan', 0):,.0f}
- FOIR:              {calc_result.get('foir', 0)}%
- DSCR:              {calc_result.get('dscr', 0)}

If status is red, be gentle but honest about the danger.
If green, congratulate them but remind them to keep a buffer.
Mention a relevant government scheme if applicable (e.g. PM Mudra Yojana,
PM SVANidhi, Sukanya Samriddhi).
"""

    try:
        response = client.models.generate_content(
            model=_MODEL,
            contents=prompt,
            config=_genai.types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.4,
                max_output_tokens=400,
            ),
        )
        return response.text
    except Exception as e:
        log.error(f"[DARAS-AI] personalised_advice failed: {e}")
        return None


def generate_admin_insights(stats: dict) -> str | None:
    """
    Analyse aggregate DARAS data and return actionable research insights
    for the admin dashboard.
    """
    client = _get_client()
    if client is None:
        return None

    from google import genai as _genai

    prompt = f"""\
You are an analyst reviewing data from DARAS — a micro-finance counselling
app serving underprivileged Indians.

Analyse this data and produce 4–5 bullet-point research insights.
Highlight alarming patterns and suggest concrete interventions.

Data:
{json.dumps(stats, indent=2, default=str)}
"""

    try:
        response = client.models.generate_content(
            model=_MODEL,
            contents=prompt,
            config=_genai.types.GenerateContentConfig(
                temperature=0.3,
                max_output_tokens=800,
            ),
        )
        return response.text
    except Exception as e:
        log.error(f"[DARAS-AI] admin_insights failed: {e}")
        return None


def summarise_for_tts(text: str, language: str = "hi") -> str | None:
    """
    Condense long text into ≤ 2 sentences suitable for text-to-speech.
    """
    client = _get_client()
    if client is None:
        return None

    from google import genai as _genai

    try:
        response = client.models.generate_content(
            model=_MODEL,
            contents=(
                f"{_lang_instruction(language)}\n\n"
                f"Summarise this in 1–2 short spoken sentences for a voice assistant:\n\n{text}"
            ),
            config=_genai.types.GenerateContentConfig(
                temperature=0.2,
                max_output_tokens=150,
            ),
        )
        return response.text
    except Exception as e:
        log.error(f"[DARAS-AI] summarise_for_tts failed: {e}")
        return None
