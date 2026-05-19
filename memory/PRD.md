# DARAS – दारस | Aapka Vittiya Mitra
**Empathetic, multilingual financial counsellor for under-served micro-finance users.**

## Problem statement (verbatim)
Rebuild `user.html` of the existing Flask SQLite project (DARAS) so the user-facing flow follows the conversational, branching, empathetic script in `Bhav Project.docx`. Add **Bengali language support** alongside Hindi & English. Host the project in `/app` for live preview. Deliver `user.html` as a standalone file the user can drop back into their local DARAS folder.

## Architecture (Feb 2026 state)
- **Backend (Flask + SQLite)** at `/app/backend/`
  - `app.py` — full Flask app (HTML routes `/` and `/api/`, `/admin` and `/api/admin/panel`; APIs `/api/user/*`, `/api/admin/*`)
  - `server.py` — ASGI shim (`WsgiToAsgi(flask_app)`) for running via `uvicorn server:app`
  - `user.html`, `admin.html` — Jinja templates (template_folder='.')
  - `daras.db` — SQLite (WAL mode). Tables: users, loan_assessments, app_events, open_questions, admin_users, admin_sessions
- **Frontend launcher (port 3000)** — minimal React `App.js` that redirects `/` → `/api/` and `/admin*` → `/api/admin/panel`. The "real" UI is the standalone `user.html` served by Flask.

## What's been built (initial release – 15 May 2026)
- 24-screen conversational state machine in vanilla HTML/CSS/JS (no React) — every screen has `data-testid` and three-language switch (हिंदी / বাংলা / English)
- Branching exactly as `Bhav Project.docx`:
  - Welcome → Register (name + age + mobile + vocation icons) → Loan-type gate
  - **Existing loan** → details → **Satisfaction gate**
    - Yes → open question → graceful end
    - No → reason picker (high interest / can't pay EMI / principal stuck / need more money)
      - High interest → "kya byaaj nahi bhar pa rahe?" → income/expense calculator → 🟢/🟠/🔴
      - Green → after-green ("paisa kahin aur chahiye?") → new loan path OR open question
      - Red/Orange → "nayi amdani?" Y/N → re-loop OR lender-spoken probe → talk-to-lender first OR NGO referral
      - Principal stuck → payoff-months calc → "samay sahi hai?" Y/N → pace (fast/slow) → re-calc
      - Need more money → check current loan health → warning if red, else new-loan path
  - **New loan** → amount + purpose + spoken-to + auto-recommendation (Education → Education Loan, Property → Bank/NBFC, Gold → Muthoot, etc.) → both-way calculator (amount mode / savings mode) → max-safe-loan card → direct contact (M3M Foundation phone/email/website + WhatsApp + ₹100 token note)
- **Warning callout** on red dead-ends: *"PAISA UTHANE KA SABSE PEHLA USOOL — agar byaaj tak bhi nahi de payenge to udhaar mat lijiye."*
- Empathetic warm visual system: cream background `#FBF7F2`, terracotta `#B4532A`, deep teal `#0F766E`, distinctive font pairing (Fraunces serif + Manrope body for English; Hind for Devanagari; Noto Sans Bengali for Bengali). Inline-SVG diya/lantern brand mark, soft radial decorations, chat-bubble cards, staggered fade-in animation.
- Telemetry: every screen view, branch pick, language switch, calculator run, open question logged into `app_events` / `loan_assessments` / `open_questions` for the existing admin dashboard.

## Personas
1. **Suresh, 35, driver, ₹18k/mo** — has ₹50k loan @ 30% from sahukaar, can't pay full EMI → red flow → NGO referral.
2. **Reshma, 28, house-maid, Bengali speaker** — wants ₹20k for child's school → Bengali UI → recommended education loan.
3. **Counsellor / NGO staff** — uses `/admin` to see aggregate vocation-wise risk and reach out.

## Backlog
- P1: ChatGPT/Claude-powered open-question answering (currently logs to DB only)
- P1: Voice/TTS button per screen (skipped this iteration)
- P2: PWA install + offline cache
- P2: Save & resume via mobile number (intentionally minimal data; needs OTP if added)
- P2: Bengali script for warm-illustration captions
- P3: WhatsApp callback slot booker integration
