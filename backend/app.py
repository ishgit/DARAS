"""
DARAS – दारस | Aapka Vittiya Mitra
===================================
Flask application factory.
  Public User API  → /api/user/*   (routes/user.py)
  Admin API        → /api/admin/*  (routes/admin.py)
  User Panel       → /
  Admin Panel      → /admin
"""
import os
from flask import Flask, request, render_template, send_from_directory
from flask_cors import CORS
from flask_compress import Compress

from config import ALLOWED_ORIGINS
from extensions import limiter
from db import init_db, close_db
from routes.user import user_bp
from routes.admin import admin_bp

app = Flask(__name__, template_folder='.')
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.jinja_env.auto_reload = True

CORS(app, resources={r"/api/*": {"origins": ALLOWED_ORIGINS}})
Compress(app)
limiter.init_app(app)

app.register_blueprint(user_bp)
app.register_blueprint(admin_bp)

app.teardown_appcontext(close_db)


# ── Security + static asset headers ──────────────────────────────────────────
@app.after_request
def add_response_headers(response):
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    if request.path.startswith('/static/'):
        response.headers['Cache-Control'] = 'public, max-age=31536000, immutable'
    return response


# ── Page routes ───────────────────────────────────────────────────────────────
@app.route("/")
@app.route("/api/")
def user_panel():
    return render_template("user.html")


@app.route("/privacy")
@app.route("/privacy/")
def privacy_policy():
    return send_from_directory(os.path.dirname(__file__), "privacy.html")


@app.route("/about")
@app.route("/about/")
def about_page():
    return send_from_directory(os.path.dirname(__file__), "about.html")


@app.route("/learn")
@app.route("/learn/")
def learn_page():
    return send_from_directory(os.path.dirname(__file__), "learn.html")


@app.route("/schemes")
@app.route("/schemes/")
def schemes_page():
    return send_from_directory(os.path.dirname(__file__), "schemes.html")


@app.route("/api/Logo.webp")
def serve_logo():
    return send_from_directory(os.path.join(os.path.dirname(__file__), "static"), "Logo.webp")


@app.route("/api/favicon.png")
def serve_favicon():
    return send_from_directory(os.path.join(os.path.dirname(__file__), "static"), "favicon.png")


@app.route("/admin")
@app.route("/admin/")
@app.route("/api/admin/panel")
def admin_panel():
    # Served as raw static file — admin.html uses ${ } template literals that Jinja would mangle
    return send_from_directory(os.path.dirname(__file__), "admin.html")


# ── Entry ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    init_db()
    port  = int(os.environ.get("PORT", 5001))
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"
    print(f"\n  DARAS running on http://localhost:{port}\n"
          f"  Admin panel → http://localhost:{port}/admin\n")
    app.run(debug=debug, port=port)
