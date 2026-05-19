# DARAS – दारस | Aapka Vittiya Mitra

A Hindi-first financial literacy web app for underprivileged Indians. Helps users understand their loan situation — EMI, max safe loan amount, and debt risk status (Green / Orange / Red).

## Run

```bash
cd backend
python3 app.py
```

- User app → http://localhost:5001
- Admin panel → http://localhost:5001/admin

## Stack

- **Backend:** Flask + SQLite (`backend/daras.db`)
- **UI:** `backend/user.html` (user flow), `backend/admin.html` (admin analytics)
- **Languages supported:** Hindi, Bengali, English

## Key Features

- Conversational loan assessment (income, EMI, debt ratio)
- Green / Orange / Red risk classification
- Admin dashboard with visitor stats, cross-tab analytics, open questions
- Duplicate mobile detection with Resume / Start Over flow
