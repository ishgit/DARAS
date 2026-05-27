# DARAS – दारस | Aapka Vittiya Mitra

A Hindi-first financial literacy web app for underprivileged Indians. Helps users understand their loan situation — EMI, max safe loan amount, and debt risk status (Green / Orange / Red).

## Run

```bash
cd backend
python3 -m venv venv
pip install -r requirements.txt

# Development
APP_ENV=dev venv/bin/uvicorn server:app --host 127.0.0.1 --port 5001 --reload
```

- User app → http://localhost:5001
- Admin panel → http://localhost:5001/admin/panel

## Test

The test suite spins up its own isolated uvicorn server with a throwaway database — no server needs to be running beforehand.

All test dependencies are included in `requirements.txt`. API and browser tests share the same setup:

```bash
cd backend
venv/bin/playwright install chromium   # one-time, for browser tests
venv/bin/pytest tests/backend_test.py -v                              # API only
venv/bin/pytest tests/backend_test.py tests/browser_test.py -v       # API + browser
```

## Environment

| Variable | Default (dev) | Required in production |
|---|---|---|
| `APP_ENV` | `dev` | Set to `production` to enable safety checks |
| `DARAS_SECRET` | `daras-dev-secret-change-in-prod` | Any long random string |
| `ADMIN_USER` | `daras_admin` | Custom username |
| `ADMIN_PASS` | `Daras@2024` | Strong password |
| `DB_PATH` | `daras.db` | Writable path for SQLite file |
| `ALLOWED_ORIGINS` | `*` | Comma-separated list of allowed origins |

When `APP_ENV=production`, the server **refuses to start** if any of the above are still at their dev defaults.

## Stack

- **Backend:** Flask + SQLite, served via `uvicorn` (ASGI)
- **UI:** `backend/user.html` (user flow), `backend/admin.html` (admin analytics)
- **Languages supported:** Hindi, Bengali, English

## Key Features

- Conversational loan assessment (income, EMI, debt ratio)
- Green / Orange / Red risk classification
- Admin dashboard with visitor stats, cross-tab analytics, open questions
- Duplicate mobile detection with Resume / Start Over flow

---

## Architecture

### System Overview

```mermaid
flowchart TB
    subgraph CLIENT["🌐 Client Layer"]
        direction LR
        USER_UI["👤 User Panel<br/><b>user.html</b><br/>Conversational loan assessment"]
        ADMIN_UI["🔐 Admin Panel<br/><b>admin.html</b><br/>Analytics dashboard"]
    end

    subgraph STATIC["📦 Frontend Modules"]
        direction LR
        UI_CORE["user-core.js<br/>App bootstrap"]
        UI_FLOWS["user-flows.js<br/>Step-by-step wizard"]
        UI_LANG["user-lang.js<br/>i18n: HI / BN / EN"]
        UI_DATA["user-data.js<br/>API client"]
        UI_PERSIST["user-persist.js<br/>LocalStorage state"]
        UI_RENDER["user-ui.js<br/>DOM rendering"]
        UI_CSS["user.css"]
        ADMIN_JS["admin.js + admin.css"]
    end

    subgraph FLASK["⚙️ Flask Backend"]
        direction TB
        APP["app.py<br/>Application factory"]

        subgraph ROUTES["API Routes"]
            direction LR
            USER_API["routes/user.py<br/>/api/user/*"]
            ADMIN_API["routes/admin.py<br/>/api/admin/*"]
        end

        subgraph CORE["Core Modules"]
            direction LR
            CALC["calculator.py<br/>Financial engine"]
            AUTH_MOD["auth.py<br/>PBKDF2 + tokens"]
            CONFIG["config.py<br/>Environment"]
            EXT["extensions.py<br/>Rate limiter"]
        end

        subgraph AI_LAYER["🤖 AI Layer"]
            direction LR
            AI_SVC["ai_service.py<br/>Gemini 2.5 Flash"]
            RAG["rag_engine.py<br/>ChromaDB + embeddings"]
            KB["knowledge_base/<br/>6 markdown docs"]
        end
    end

    subgraph DATA["💾 Data Layer"]
        DB[("SQLite<br/>daras.db<br/>WAL mode")]
        VDB[("ChromaDB<br/>vector_db/<br/>Cosine similarity")]
    end

    subgraph EXTERNAL["☁️ External Services"]
        GEMINI["Google Gemini API<br/>gemini-2.5-flash"]
        EMBED["text-embedding-004<br/>Embeddings"]
    end

    CLIENT -->|"HTTP / JSON"| APP
    USER_UI --> UI_CORE & UI_FLOWS & UI_LANG
    ADMIN_UI --> ADMIN_JS
    APP --> ROUTES
    USER_API --> CALC
    USER_API --> AI_SVC
    ADMIN_API --> AUTH_MOD
    AI_SVC --> RAG
    RAG --> KB
    ROUTES --> DB
    RAG --> VDB
    AI_SVC -.->|"API call"| GEMINI
    RAG -.->|"API call"| EMBED
```

### Request Flow — Loan Assessment

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant FE as 🌐 Frontend
    participant API as ⚙️ /api/user/calculate
    participant CALC as 📊 calculator.py
    participant DB as 💾 SQLite
    participant AI as 🤖 Gemini AI

    U->>FE: Enters income, expenses, loan details
    FE->>API: POST /api/user/calculate

    API->>API: Parse & validate inputs
    API->>CALC: summarize_existing_loans(loans[])
    CALC-->>API: weighted rate, tenure, totals

    API->>CALC: run_calculator(income, expenses, loan, rate, months)
    CALC->>CALC: EMI / simple interest calculation
    CALC->>CALC: FOIR, DSCR, LTI risk metrics
    CALC->>CALC: Conclusion: green / orange / red
    CALC-->>API: Full assessment result

    API->>CALC: validate_affordability(savings, loans)
    CALC-->>API: Cascading gate results

    API->>CALC: calc_max_loan_simple() + calc_kul_jama()
    CALC-->>API: Eligibility + surplus

    API->>DB: INSERT loan_assessments + app_events
    API-->>FE: JSON response
    FE-->>U: Display result card with risk status + advice
```

### Database Schema

```mermaid
erDiagram
    users ||--o{ loan_assessments : "has many"
    users ||--o{ app_events : "generates"
    users ||--o{ open_questions : "asks"
    admin_users ||--o{ admin_sessions : "authenticates via"

    users {
        int id PK
        text session_id UK
        text name
        int age
        text mobile_hash
        text mobile_last4
        text vocation
        text language
        int household_size
        text employment_type
        int has_bank_account
    }

    loan_assessments {
        int id PK
        int user_id FK
        text loan_type
        real loan_amount
        text loan_purpose
        text loan_source
        real interest_rate
        int tenure_months
        real income
        real monthly_savings
        real emi
        real foir
        real dscr
        real max_safe_loan
        text status
        text conclusion
    }

    app_events {
        int id PK
        int user_id FK
        text event
        text meta
        text created_at
    }

    open_questions {
        int id PK
        int user_id FK
        text question
        text context
    }

    admin_users {
        int id PK
        text username UK
        text password_hash
        text role
    }

    admin_sessions {
        int id PK
        int admin_id FK
        text token UK
        text expires_at
    }
```

### Calculator Engine — Dual Interest Model

```mermaid
flowchart LR
    subgraph INPUT["📥 Inputs"]
        INC["Income"]
        EXP["Expenses"]
        LOANS["Existing Loans"]
        NEW["New Loan Params"]
    end

    subgraph ENGINE["📊 Calculator Engine"]
        direction TB
        SAV["savings = income − expenses"]

        subgraph DUAL["Dual Interest Model"]
            EMI_PATH["🏦 EMI / Reducing Balance<br/>calc_emi · calc_max_loan"]
            FLAT_PATH["🏘️ Simple / Flat Interest<br/>infer_flat_annual_rate<br/>calc_max_loan_simple"]
        end

        SUMMARY["summarize_existing_loans<br/>Weighted rate, tenure, totals"]
        GATES["validate_affordability<br/>Cascading OK/ERROR gates"]
        KULJAMA["calc_kul_jama<br/>Cumulative surplus"]
        RISK["Risk Assessment · 7 tiers"]
    end

    subgraph OUTPUT["📤 Outputs"]
        STATUS["🟢 green / 🟠 orange / 🔴 red"]
        METRICS["FOIR · DSCR · LTI"]
        ELIG["Loan Eligibility"]
        MSGS["Trilingual Messages"]
    end

    INC & EXP --> SAV
    LOANS --> SUMMARY & FLAT_PATH
    SAV --> GATES & RISK
    SUMMARY --> GATES & KULJAMA
    NEW --> FLAT_PATH & EMI_PATH
    SAV --> KULJAMA
    RISK --> STATUS & METRICS & MSGS
    FLAT_PATH & EMI_PATH --> ELIG
```

### Project Structure

```
DARAS V3/
├── README.md
├── Final Calc Model Daras V3.xlsx     # Excel reference model
└── backend/
    ├── app.py                          # Flask app factory
    ├── server.py                       # Uvicorn ASGI entry
    ├── config.py                       # Environment variables
    ├── db.py                           # SQLite + migrations
    ├── auth.py                         # Admin auth (PBKDF2)
    ├── calculator.py                   # 🧮 Financial engine
    ├── ai_service.py                   # 🤖 Gemini integration
    ├── rag_engine.py                   # 📚 ChromaDB RAG pipeline
    ├── routes/
    │   ├── user.py                     # /api/user/* endpoints
    │   └── admin.py                    # /api/admin/* endpoints
    ├── knowledge_base/                 # RAG source documents
    │   ├── rbi_lending_guidelines.md
    │   ├── government_schemes.md
    │   ├── pm_mudra_yojana.md
    │   ├── pm_svanidhi.md
    │   ├── debt_recovery_rights.md
    │   └── financial_literacy_faqs.md
    ├── static/                         # Frontend JS/CSS
    ├── user.html                       # User-facing SPA
    ├── admin.html                      # Admin dashboard
    ├── privacy.html                    # Privacy policy
    └── tests/                          # Pytest + Playwright
```

---

## Built by

**Ishika** &nbsp;|&nbsp; कोडर एवं सक्षमकर्ता — *The Enabler*

दारस ऐप के पीछे की तकनीकी दिमाग़।
Concept को कोड में बदलने वाली — from a Hindi-first UX vision to a full-stack RAG-powered web app built for the people who need it most.

She designed the product, wrote the backend, shaped the financial engine, and shipped it — all driven by the belief that financial literacy should be accessible in every language, to every Indian.
