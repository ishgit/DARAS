"""
ASGI shim so Emergent's supervisor (`uvicorn server:app`) can run the
DARAS Flask application.  All real logic lives in `app.py` — this file just:
  1. imports the Flask app and initializes the SQLite DB
  2. wraps it as an ASGI callable via asgiref.wsgi.WsgiToAsgi
You can still run the Flask app standalone locally via `python app.py`.
"""
from asgiref.wsgi import WsgiToAsgi
from app import app as flask_app, init_db

# Initialise SQLite schema + seed admin (idempotent)
init_db()

# Expose ASGI app for uvicorn
app = WsgiToAsgi(flask_app)
