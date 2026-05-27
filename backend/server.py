"""
ASGI shim so uvicorn can serve the DARAS Flask application.
All real logic lives in `app.py`. Run locally via `python app.py`.
"""
from asgiref.wsgi import WsgiToAsgi
from app import app as flask_app
from db import init_db

# Initialise SQLite schema + seed admin (idempotent)
init_db()

# Expose ASGI app for uvicorn
app = WsgiToAsgi(flask_app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="127.0.0.1", port=5001, reload=True)
