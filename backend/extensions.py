from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Initialised without an app — call limiter.init_app(app) in app.py
limiter = Limiter(key_func=get_remote_address, default_limits=[], storage_uri="memory://")
