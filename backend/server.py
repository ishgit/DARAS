"""
ASGI shim so uvicorn can serve the DARAS Flask application.
All real logic lives in `app.py`. Run locally via `python app.py`.
"""
from asgiref.wsgi import WsgiToAsgi
from app import app as flask_app, init_db

# Initialise SQLite schema + seed admin (idempotent)
init_db()

# Expose ASGI app for uvicorn
app = WsgiToAsgi(flask_app)
