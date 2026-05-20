"""
DARAS – दारस | Aapka Vittiya Mitra
===================================
Flask backend:
  Public User API  → /api/user/*
  Admin API        → /api/admin/*  (token-protected)
  User Panel       → /
  Admin Panel      → /admin
"""

from flask import Flask, request, jsonify, render_template, send_from_directory, g, Response
from flask_cors import CORS
import sqlite3, hashlib, hmac, uuid, os, json, math, csv, io
from datetime import datetime, timedelta
from functools import wraps
from dotenv import load_dotenv

load_dotenv()

# ── Config ────────────────────────────────────────────────────────────────────
app = Flask(__name__, template_folder='.')
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.jinja_env.auto_reload = True

_ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "*").split(",")
CORS(app, resources={r"/api/*": {"origins": _ALLOWED_ORIGINS}})

DB_PATH    = os.environ.get("DB_PATH", os.path.join(os.path.dirname(__file__), "daras.db"))
SECRET_KEY = os.environ.get("DARAS_SECRET", "daras-dev-secret-change-in-prod")
TOKEN_TTL  = 12   # hours
ADMIN_USER = os.environ.get("ADMIN_USER", "daras_admin")
ADMIN_PASS = os.environ.get("ADMIN_PASS", "Daras@2024")

_IS_PROD = os.environ.get("FLASK_ENV") == "production"
if _IS_PROD:
    if SECRET_KEY == "daras-dev-secret-change-in-prod":
        raise RuntimeError("DARAS_SECRET env variable must be set in production")
    if ADMIN_PASS == "Daras@2024":
        raise RuntimeError("ADMIN_PASS env variable must be set in production")

# ── DB helpers ────────────────────────────────────────────────────────────────
def get_db():
    if "db" not in g:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA foreign_keys=ON")
        g.db = conn
    return g.db

@app.teardown_appcontext
def close_db(exc):
    db = g.pop("db", None)
    if db:
        db.close()

def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys=ON")
    c = conn.cursor()

    c.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id      TEXT    UNIQUE NOT NULL,
        name            TEXT    NOT NULL,
        age             INTEGER,
        mobile          TEXT,
        vocation        TEXT    NOT NULL,
        vocation_custom TEXT,
        city            TEXT,
        state           TEXT,
        language        TEXT    DEFAULT 'hi',
        ip_address      TEXT,
        user_agent      TEXT,
        created_at      TEXT    DEFAULT (datetime('now','localtime')),
        last_active     TEXT    DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS loan_assessments (
        id               INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id          INTEGER NOT NULL,
        loan_type        TEXT    NOT NULL,
        loan_amount      REAL    DEFAULT 0,
        loan_purpose     TEXT,
        loan_source      TEXT,
        interest_rate    REAL    DEFAULT 0,
        tenure_months    INTEGER DEFAULT 12,
        loan_remaining   REAL    DEFAULT 0,
        income           REAL    DEFAULT 0,
        rent             REAL    DEFAULT 0,
        grocery          REAL    DEFAULT 0,
        medicine         REAL    DEFAULT 0,
        education        REAL    DEFAULT 0,
        mobile_bill      REAL    DEFAULT 0,
        gaon             REAL    DEFAULT 0,
        other_expenses   REAL    DEFAULT 0,
        expenses_total   REAL    DEFAULT 0,
        monthly_savings  REAL    DEFAULT 0,
        emi              REAL    DEFAULT 0,
        total_interest   REAL    DEFAULT 0,
        monthly_interest REAL    DEFAULT 0,
        loan_to_income   REAL    DEFAULT 0,
        max_safe_loan    REAL    DEFAULT 0,
        status           TEXT    NOT NULL,
        conclusion       TEXT,
        created_at       TEXT    DEFAULT (datetime('now','localtime')),
        FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS app_events (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id     INTEGER,
        event       TEXT    NOT NULL,
        meta        TEXT,
        created_at  TEXT    DEFAULT (datetime('now','localtime')),
        FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS open_questions (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id     INTEGER,
        question    TEXT    NOT NULL,
        context     TEXT,
        created_at  TEXT    DEFAULT (datetime('now','localtime')),
        FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS admin_users (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        username      TEXT    UNIQUE NOT NULL,
        password_hash TEXT    NOT NULL,
        full_name     TEXT,
        role          TEXT    DEFAULT 'analyst',
        last_login    TEXT,
        created_at    TEXT    DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS admin_sessions (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_id    INTEGER NOT NULL,
        token       TEXT    UNIQUE NOT NULL,
        expires_at  TEXT    NOT NULL,
        ip_address  TEXT,
        created_at  TEXT    DEFAULT (datetime('now','localtime')),
        FOREIGN KEY(admin_id) REFERENCES admin_users(id)
    );
    """)

    conn.commit()

    # Migration: add resolved_by to open_questions (safe to run repeatedly)
    try:
        conn.execute("ALTER TABLE open_questions ADD COLUMN resolved_by TEXT")
        conn.commit()
    except Exception:
        pass

    # Migration: add is_current flag to loan_assessments (safe to run repeatedly)
    try:
        conn.execute("ALTER TABLE loan_assessments ADD COLUMN is_current INTEGER DEFAULT 1")
        conn.commit()
    except Exception:
        pass

    if not conn.execute("SELECT id FROM admin_users LIMIT 1").fetchone():
        conn.execute(
            "INSERT INTO admin_users (username,password_hash,full_name,role) VALUES (?,?,?,?)",
            (ADMIN_USER, _hash_pw(ADMIN_PASS), "DARAS Admin", "superadmin")
        )
        conn.commit()
        print(f"[DARAS] Admin seeded → {ADMIN_USER}")

    conn.close()

# ── Auth helpers ──────────────────────────────────────────────────────────────
def _hash_pw(pw):
    return hashlib.pbkdf2_hmac("sha256", pw.encode(), SECRET_KEY.encode(), 200_000).hex()

def _new_token():
    return hmac.new(SECRET_KEY.encode(), uuid.uuid4().bytes, "sha256").hexdigest()

def _token_exp():
    return (datetime.now() + timedelta(hours=TOKEN_TTL)).strftime("%Y-%m-%d %H:%M:%S")

def admin_required(f):
    @wraps(f)
    def deco(*a, **kw):
        auth = request.headers.get("Authorization","")
        if not auth.startswith("Bearer "):
            return jsonify({"error":"Unauthorized"}), 401
        token = auth[7:]
        row = get_db().execute("""
            SELECT s.admin_id, s.expires_at, a.username, a.role
            FROM admin_sessions s JOIN admin_users a ON a.id=s.admin_id
            WHERE s.token=?
        """, (token,)).fetchone()
        if not row:
            return jsonify({"error":"Invalid token"}), 401
        if datetime.strptime(row["expires_at"],"%Y-%m-%d %H:%M:%S") < datetime.now():
            return jsonify({"error":"Token expired"}), 401
        g.admin = {"id":row["admin_id"],"username":row["username"],"role":row["role"]}
        return f(*a, **kw)
    return deco

# ── Calculator engine (mirrors Excel model) ───────────────────────────────────
def income_slab(inc):
    if inc < 10000:  return "below_10k"
    if inc < 20000:  return "10k_20k"
    if inc < 35000:  return "20k_35k"
    if inc < 50000:  return "35k_50k"
    return "above_50k"

def calc_emi(p, annual_pct, months):
    if months <= 0: return 0.0
    if annual_pct <= 0: return round(p/months, 2)
    r = (annual_pct/100)/12
    return round(p * r * (1+r)**months / ((1+r)**months - 1), 2)

def calc_max_loan(surplus, annual_pct, months):
    if months <= 0 or surplus <= 0: return 0.0
    if annual_pct <= 0: return round(surplus*months, 2)
    r = (annual_pct/100)/12
    return round(surplus * ((1+r)**months - 1) / (r*(1+r)**months), 2)

def calc_payoff_months(p, annual_pct, monthly_pay):
    """How many months to pay off principal p at given rate with monthly_pay?"""
    if monthly_pay <= 0 or p <= 0: return 0
    r = (annual_pct/100)/12
    if r <= 0:
        return math.ceil(p / monthly_pay)
    if monthly_pay <= p*r:  # cannot even cover interest
        return -1
    n = math.log(monthly_pay / (monthly_pay - p*r)) / math.log(1+r)
    return math.ceil(n)

def run_calculator(income, expenses, loan, rate, months):
    savings  = income - expenses
    emi      = calc_emi(loan, rate, months)
    tot_int  = round(loan*(rate/100)*(months/12), 2)
    mon_int  = round(tot_int/months, 2) if months else 0
    lti      = round(loan/income, 2) if income else 0
    int_pay  = round(min(max(savings,0)*months, tot_int), 2)
    int_unp  = round(max(0, tot_int - int_pay), 2)
    rem_sav  = max(0, savings*months - tot_int)
    prin_pay = round(min(rem_sav, loan), 2)
    prin_unp = round(loan - prin_pay, 2)
    max_loan = calc_max_loan(max(savings,0), rate, months)
    tot_pay  = round(loan + tot_int, 2)

    if savings <= 0:
        s,c = "red","no_savings"
        mh = "Aapki amdani se kharcha hi pura nahi hota. Loan bilkul mat lein."
        me = "Income does not cover expenses. Do NOT take any loan."
        mb = "আপনার আয়ে খরচই পুরো হয় না। ঋণ একদম নেবেন না।"
    elif emi > savings:
        s,c = "red","emi_exceeds_savings"
        mh = "EMI aapki poori bachat se zyaada hai. Bahut khatarnak – chota loan ya zyaada tenure chunein."
        me = "EMI exceeds your total monthly savings. Very dangerous."
        mb = "EMI আপনার পুরো সঞ্চয়ের চেয়ে বেশি। খুব বিপজ্জনক — ছোট ঋণ বা বেশি মেয়াদ বেছে নিন।"
    elif emi > savings * 0.6:
        s,c = "orange","emi_high"
        mh = "EMI aapki bachat ka 60% se zyaada le legi. Dhyan se – koi bhi emergency mein phans sakte hain."
        me = "EMI consumes over 60% of savings. Any emergency could trap you."
        mb = "EMI আপনার সঞ্চয়ের ৬০%-এর বেশি নেবে। সাবধান — যেকোনো জরুরি অবস্থায় ফেঁসে যাবেন।"
    elif prin_unp > loan * 0.4:
        s,c = "orange","principal_risk"
        mh = "Bayaaj to de payenge lekin mool chukana mushkil hoga. Thoda chota loan lein."
        me = "Interest is manageable but repaying principal is risky. Consider smaller amount."
        mb = "সুদ দিতে পারবেন কিন্তু মূল ফেরত দেওয়া কঠিন হবে। ছোট পরিমাণ বিবেচনা করুন।"
    else:
        s,c = "green","safe"
        mh = "Aap ye loan aaram se le sakte hain. Aapki bachat EMI se zyaada hai."
        me = "You can comfortably take this loan. Savings cover EMI well."
        mb = "আপনি এই ঋণ আরামে নিতে পারেন। আপনার সঞ্চয় EMI-এর চেয়ে বেশি।"

    return dict(
        income=income, expenses_total=round(expenses,2),
        loan_amount=loan, interest_rate=rate, tenure_months=months,
        monthly_savings=round(savings,2), emi=emi,
        total_interest=tot_int, monthly_interest=mon_int,
        total_payable=tot_pay, lti_ratio=lti,
        interest_payable=int_pay, interest_unpayable=int_unp,
        principal_payable=prin_pay, principal_unpayable=prin_unp,
        max_safe_loan=max_loan,
        status=s, conclusion=c, message_hi=mh, message_en=me, message_bn=mb
    )

# ── Page routes ───────────────────────────────────────────────────────────────
@app.route("/")
@app.route("/api/")
def user_panel():
    return render_template("user.html")

@app.route("/privacy")
@app.route("/privacy/")
def privacy_policy():
    return send_from_directory(os.path.dirname(__file__), "privacy.html")

@app.route("/api/Logo.png")
def serve_logo():
    return send_from_directory(os.path.join(os.path.dirname(__file__), "static"), "Logo.png")

@app.route("/admin")
@app.route("/admin/")
@app.route("/api/admin/panel")
def admin_panel():
    # Serve as raw static file — admin.html contains JS template-literal
    # syntax like ${{ ... }} which Jinja would try to parse.
    return send_from_directory(os.path.dirname(__file__), "admin.html")

# ── Public User API ───────────────────────────────────────────────────────────
@app.route("/api/user/register", methods=["POST"])
def user_register():
    d        = request.get_json(force=True)
    name     = (d.get("name") or "").strip()
    if not name:
        return jsonify({"error":"Naam zaroori hai"}), 400
    db       = get_db()
    mobile   = (d.get("mobile") or "").strip()
    language = d.get("language", "hi")
    vocation = d.get("vocation", "other")
    voc_custom = d.get("vocation_custom", "")
    age      = d.get("age")

    # START OVER: update existing user record, keep same user_id
    existing_uid = d.get("existing_user_id")
    if existing_uid:
        db.execute(
            "UPDATE users SET name=?,age=?,vocation=?,vocation_custom=?,language=?,last_active=datetime('now','localtime') WHERE id=?",
            (name, age, vocation, voc_custom, language, existing_uid)
        )
        db.commit()
        row = db.execute("SELECT id,session_id FROM users WHERE id=?", (existing_uid,)).fetchone()
        db.execute("INSERT INTO app_events (user_id,event,meta) VALUES (?,?,?)",
                   (existing_uid, "start_over", json.dumps({"vocation":vocation,"lang":language})))
        db.commit()
        return jsonify({"success":True,"user_id":row["id"],"session_id":row["session_id"]})

    # Duplicate mobile check — return ALL existing profiles for frontend to handle
    if mobile and len(mobile) >= 6 and not d.get("force_new"):
        existing_rows = db.execute(
            "SELECT * FROM users WHERE mobile=? ORDER BY created_at DESC",
            (mobile,)
        ).fetchall()
        if existing_rows:
            profiles = []
            for row in existing_rows:
                profiles.append({
                    "id":              row["id"],
                    "session_id":      row["session_id"],
                    "name":            row["name"],
                    "age":             row["age"],
                    "mobile":          row["mobile"],
                    "vocation":        row["vocation"],
                    "vocation_custom": row["vocation_custom"] or "",
                    "language":        row["language"] or "hi",
                })
            return jsonify({
                "exists": True,
                "profiles": profiles
            })

    # New user INSERT
    sid = str(uuid.uuid4())
    try:
        db.execute("""
            INSERT INTO users
              (session_id,name,age,mobile,vocation,vocation_custom,city,state,language,ip_address,user_agent)
            VALUES (?,?,?,?,?,?,?,?,?,?,?)
        """, (sid, name, age, mobile,
              vocation, voc_custom,
              d.get("city",""), d.get("state",""), language,
              request.remote_addr, request.headers.get("User-Agent","")[:255]))
        db.commit()
        uid = db.execute("SELECT id FROM users WHERE session_id=?", (sid,)).fetchone()["id"]
        db.execute("INSERT INTO app_events (user_id,event,meta) VALUES (?,?,?)",
                   (uid,"register",json.dumps({"vocation":vocation,"lang":language})))
        db.commit()
        return jsonify({"success":True,"session_id":sid,"user_id":uid})
    except sqlite3.IntegrityError as e:
        return jsonify({"error":str(e)}), 409

@app.route("/api/user/calculate", methods=["POST"])
def user_calculate():
    d = request.get_json(force=True)
    income    = float(d.get("income",0)         or 0)
    rent      = float(d.get("rent",0)           or 0)
    grocery   = float(d.get("grocery",0)        or 0)
    medicine  = float(d.get("medicine",0)       or 0)
    education = float(d.get("education",0)      or 0)
    mob       = float(d.get("mobile_bill",0)    or 0)
    gaon      = float(d.get("gaon",0)           or 0)
    other     = float(d.get("other_expenses",0) or 0)
    expenses  = rent+grocery+medicine+education+mob+gaon+other

    loan      = float(d.get("loan_amount",0)    or 0)
    rate      = float(d.get("interest_rate",12) or 12)
    months    = int(  d.get("tenure_months",12) or 12)
    loan_type = d.get("loan_type","existing")
    purpose   = d.get("loan_purpose","")
    source    = d.get("loan_source","")
    remaining = float(d.get("loan_remaining",loan) or loan)

    r = run_calculator(income, expenses, loan, rate, months)
    r["expenses_breakdown"] = {
        "rent":rent,"grocery":grocery,"medicine":medicine,
        "education":education,"mobile_bill":mob,"gaon":gaon,"other":other
    }
    # Bonus: payoff months at current monthly_savings (for principal-issue branch)
    surplus = max(0, income - expenses)
    payoff = calc_payoff_months(remaining or loan, rate, surplus)
    r["payoff_months_at_surplus"] = payoff

    db = get_db(); uid = d.get("user_id")
    if uid:
        try:
            db.execute("UPDATE loan_assessments SET is_current=0 WHERE user_id=?", (uid,))
            db.execute("""
                INSERT INTO loan_assessments
                  (user_id,loan_type,loan_amount,loan_purpose,loan_source,
                   interest_rate,tenure_months,loan_remaining,
                   income,rent,grocery,medicine,education,mobile_bill,
                   gaon,other_expenses,expenses_total,
                   monthly_savings,emi,total_interest,monthly_interest,
                   loan_to_income,max_safe_loan,status,conclusion)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """, (uid,loan_type,loan,purpose,source,rate,months,remaining,
                  income,rent,grocery,medicine,education,mob,gaon,other,expenses,
                  r["monthly_savings"],r["emi"],r["total_interest"],r["monthly_interest"],
                  r["lti_ratio"],r["max_safe_loan"],r["status"],r["conclusion"]))
            db.execute("INSERT INTO app_events (user_id,event,meta) VALUES (?,?,?)",
                       (uid,"assessment",json.dumps({
                           "status":r["status"],"income_slab":income_slab(income),
                           "loan_source":source,"loan_type":loan_type,"lti":r["lti_ratio"]})))
            db.execute("UPDATE users SET last_active=datetime('now','localtime') WHERE id=?", (uid,))
            db.commit()
        except Exception as e:
            app.logger.error(f"DB error: {e}")

    return jsonify(r)

@app.route("/api/user/calculate_max", methods=["POST"])
def user_calculate_max():
    """Reverse calc – from monthly surplus + tenure + rate → max safe loan."""
    d = request.get_json(force=True)
    surplus = float(d.get("monthly_savings", 0) or 0)
    rate    = float(d.get("interest_rate", 12) or 12)
    months  = int(  d.get("tenure_months", 12) or 12)
    max_loan = calc_max_loan(surplus, rate, months)
    emi_per_lakh = calc_emi(100000, rate, months)
    return jsonify({
        "max_safe_loan": max_loan,
        "monthly_savings": surplus,
        "interest_rate": rate,
        "tenure_months": months,
        "emi_per_lakh": emi_per_lakh,
    })

@app.route("/api/user/event", methods=["POST"])
def log_event():
    d = request.get_json(force=True)
    db = get_db()
    db.execute("INSERT INTO app_events (user_id,event,meta) VALUES (?,?,?)",
               (d.get("user_id"), d.get("event","page_view"), json.dumps(d.get("meta",{}))))
    db.commit()
    return jsonify({"ok":True})

@app.route("/api/user/lookup", methods=["POST"])
def user_lookup():
    d      = request.get_json(force=True)
    mobile = (d.get("mobile") or "").strip()
    if len(mobile) < 6:
        return jsonify({"found": False})
    db   = get_db()
    user = db.execute(
        "SELECT * FROM users WHERE mobile=? ORDER BY created_at DESC LIMIT 1",
        (mobile,)
    ).fetchone()
    if not user:
        return jsonify({"found": False})
    last = db.execute(
        "SELECT * FROM loan_assessments WHERE user_id=? ORDER BY created_at DESC LIMIT 1",
        (user["id"],)
    ).fetchone()
    db.execute("INSERT INTO app_events (user_id,event,meta) VALUES (?,?,?)",
               (user["id"], "return_lookup", json.dumps({"mobile_tail": mobile[-4:]})))
    db.commit()
    return jsonify({
        "found": True,
        "user": {
            "id":              user["id"],
            "session_id":      user["session_id"],
            "name":            user["name"],
            "age":             user["age"],
            "mobile":          user["mobile"],
            "vocation":        user["vocation"],
            "vocation_custom": user["vocation_custom"] or "",
            "language":        user["language"] or "hi",
        },
        "last_assessment": dict(last) if last else None,
    })

@app.route("/api/user/question", methods=["POST"])
def log_question():
    d = request.get_json(force=True)
    q = (d.get("question") or "").strip()
    if not q:
        return jsonify({"error":"empty"}), 400
    db = get_db()
    db.execute("INSERT INTO open_questions (user_id,question,context) VALUES (?,?,?)",
               (d.get("user_id"), q, json.dumps(d.get("context",{}))))
    db.execute("INSERT INTO app_events (user_id,event,meta) VALUES (?,?,?)",
               (d.get("user_id"), "open_question", json.dumps({"len":len(q)})))
    db.commit()
    return jsonify({"ok":True})

# ── Admin Auth ────────────────────────────────────────────────────────────────
@app.route("/api/admin/auth/login", methods=["POST"])
def admin_login():
    d = request.get_json(force=True)
    uname = d.get("username","").strip()
    pwd   = d.get("password","")
    if not uname or not pwd:
        return jsonify({"error":"Username aur password dono chahiye"}), 400
    db    = get_db()
    admin = db.execute("SELECT * FROM admin_users WHERE username=?", (uname,)).fetchone()
    if not admin or admin["password_hash"] != _hash_pw(pwd):
        return jsonify({"error":"Username ya password galat hai"}), 401
    token = _new_token(); exp = _token_exp()
    db.execute("INSERT INTO admin_sessions (admin_id,token,expires_at,ip_address) VALUES (?,?,?,?)",
               (admin["id"],token,exp,request.remote_addr))
    db.execute("UPDATE admin_users SET last_login=datetime('now','localtime') WHERE id=?", (admin["id"],))
    db.commit()
    return jsonify({"token":token,"expires":exp,"username":admin["username"],
                    "role":admin["role"],"full_name":admin["full_name"]})

@app.route("/api/admin/auth/logout", methods=["POST"])
@admin_required
def admin_logout():
    get_db().execute("DELETE FROM admin_sessions WHERE token=?",
                     (request.headers["Authorization"][7:],))
    get_db().commit()
    return jsonify({"ok":True})

@app.route("/api/admin/auth/me", methods=["GET"])
@admin_required
def admin_me():
    return jsonify(g.admin)

# ── Admin Data API ────────────────────────────────────────────────────────────
@app.route("/api/admin/dashboard", methods=["GET"])
@admin_required
def admin_dashboard():
    db    = get_db()
    today = datetime.now().strftime("%Y-%m-%d")

    total_users   = db.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    total_assess  = db.execute("SELECT COUNT(*) FROM loan_assessments WHERE is_current=1").fetchone()[0]
    users_today   = db.execute("SELECT COUNT(*) FROM users WHERE created_at LIKE ?", (today+"%",)).fetchone()[0]
    assess_today  = db.execute("SELECT COUNT(*) FROM loan_assessments WHERE is_current=1 AND created_at LIKE ?", (today+"%",)).fetchone()[0]

    status_rows = db.execute("SELECT status,COUNT(*) as cnt FROM loan_assessments WHERE is_current=1 GROUP BY status").fetchall()
    status_dist = {r["status"]:r["cnt"] for r in status_rows}
    red_cnt = status_dist.get("red",0)
    danger_pct = round(red_cnt/total_assess*100,1) if total_assess else 0

    visitor_count     = db.execute("SELECT COUNT(*) FROM app_events WHERE event='visit'").fetchone()[0]
    oq_count          = db.execute("SELECT COUNT(*) FROM open_questions").fetchone()[0]
    qualify_count     = status_dist.get("green",0) + status_dist.get("orange",0)
    not_qualify_count = status_dist.get("red",0)

    avg_income = db.execute("SELECT AVG(income) FROM loan_assessments WHERE is_current=1 AND income>0").fetchone()[0] or 0
    avg_loan   = db.execute("SELECT AVG(loan_amount) FROM loan_assessments WHERE is_current=1 AND loan_amount>0").fetchone()[0] or 0
    avg_lti    = db.execute("SELECT AVG(loan_to_income) FROM loan_assessments WHERE is_current=1").fetchone()[0] or 0
    avg_rate   = db.execute("SELECT AVG(interest_rate) FROM loan_assessments WHERE is_current=1 AND interest_rate>0").fetchone()[0] or 0

    trend = db.execute("""
        SELECT DATE(created_at) as day, COUNT(*) as cnt FROM users
        WHERE created_at >= date('now','-30 days')
        GROUP BY day ORDER BY day
    """).fetchall()

    recent = db.execute("""
        SELECT u.name, u.vocation, la.income, la.loan_amount, la.status, la.created_at
        FROM loan_assessments la JOIN users u ON u.id=la.user_id
        WHERE la.is_current=1
        ORDER BY la.created_at DESC LIMIT 10
    """).fetchall()

    return jsonify({
        "total_users":total_users,"total_assessments":total_assess,
        "users_today":users_today,"assessments_today":assess_today,
        "visitor_count":visitor_count,
        "open_questions_count":oq_count,
        "qualify_count":qualify_count,
        "not_qualify_count":not_qualify_count,
        "status_distribution":status_dist,
        "avg_income":round(avg_income),"avg_loan":round(avg_loan),
        "avg_loan_to_income":round(avg_lti,2),"avg_interest_rate":round(avg_rate,1),
        "danger_pct":danger_pct,
        "trend_30d":[{"day":r["day"],"count":r["cnt"]} for r in trend],
        "recent_assessments":[dict(r) for r in recent],
    })

@app.route("/api/admin/research", methods=["GET"])
@admin_required
def admin_research():
    db = get_db()

    voc = db.execute("""
        SELECT u.vocation, COUNT(DISTINCT u.id) as users,
               COUNT(la.id) as assessments,
               AVG(la.income) as avg_income, AVG(la.loan_amount) as avg_loan,
               AVG(la.loan_to_income) as avg_lti, AVG(la.interest_rate) as avg_rate,
               SUM(CASE WHEN la.status='red' THEN 1 ELSE 0 END) as danger_cnt
        FROM users u LEFT JOIN loan_assessments la ON la.user_id=u.id AND la.is_current=1
        WHERE u.vocation IS NOT NULL GROUP BY u.vocation ORDER BY users DESC
    """).fetchall()

    slab = db.execute("""
        SELECT
          CASE WHEN income<10000 THEN 'below_10k'
               WHEN income<20000 THEN '10k_20k'
               WHEN income<35000 THEN '20k_35k'
               WHEN income<50000 THEN '35k_50k'
               ELSE 'above_50k' END as slab,
          COUNT(*) as cnt, AVG(loan_amount) as avg_loan,
          AVG(loan_to_income) as avg_lti, AVG(interest_rate) as avg_rate,
          SUM(CASE WHEN status='red' THEN 1 ELSE 0 END) as danger_cnt
        FROM loan_assessments WHERE income>0 AND is_current=1
        GROUP BY slab ORDER BY cnt DESC
    """).fetchall()

    src = db.execute("""
        SELECT loan_source, COUNT(*) as cnt, AVG(interest_rate) as avg_rate,
               AVG(loan_amount) as avg_loan,
               SUM(CASE WHEN status='red' THEN 1 ELSE 0 END) as danger_cnt
        FROM loan_assessments WHERE loan_source!='' AND is_current=1
        GROUP BY loan_source ORDER BY cnt DESC
    """).fetchall()

    purp = db.execute("""
        SELECT loan_purpose, COUNT(*) as cnt, AVG(loan_amount) as avg_loan,
               SUM(CASE WHEN status='red' THEN 1 ELSE 0 END) as danger_cnt
        FROM loan_assessments WHERE loan_purpose!='' AND is_current=1
        GROUP BY loan_purpose ORDER BY cnt DESC
    """).fetchall()

    rate_bkts = db.execute("""
        SELECT
          CASE WHEN interest_rate<=12 THEN '1-12% (Bank)'
               WHEN interest_rate<=24 THEN '13-24% (NBFC)'
               WHEN interest_rate<=36 THEN '25-36% (High)'
               ELSE '36%+ (Sahukaar)' END as bucket,
          COUNT(*) as cnt, AVG(loan_to_income) as avg_lti
        FROM loan_assessments WHERE interest_rate>0 AND is_current=1
        GROUP BY bucket ORDER BY cnt DESC
    """).fetchall()

    exp_avg = db.execute("""
        SELECT AVG(rent/income)*100 as rent_pct, AVG(grocery/income)*100 as grocery_pct,
               AVG(medicine/income)*100 as medicine_pct,
               AVG(education/income)*100 as education_pct,
               AVG(gaon/income)*100 as gaon_pct,
               AVG(monthly_savings/income)*100 as savings_pct
        FROM loan_assessments WHERE income>0 AND is_current=1
    """).fetchone()

    # Vocation × Source matrix — "devil prevalent in a vocation"
    voc_src = db.execute("""
        SELECT u.vocation, la.loan_source, COUNT(*) as cnt,
               SUM(CASE WHEN la.status='red' THEN 1 ELSE 0 END) as danger_cnt,
               AVG(la.interest_rate) as avg_rate
        FROM loan_assessments la JOIN users u ON u.id=la.user_id
        WHERE la.loan_source != '' AND la.is_current=1
        GROUP BY u.vocation, la.loan_source
        ORDER BY u.vocation, cnt DESC
    """).fetchall()

    # Income Slab × Source matrix — "devil in an income class"
    slab_src = db.execute("""
        SELECT
          CASE WHEN income<10000 THEN 'below_10k'
               WHEN income<20000 THEN '10k_20k'
               WHEN income<35000 THEN '20k_35k'
               WHEN income<50000 THEN '35k_50k'
               ELSE 'above_50k' END as slab,
          loan_source, COUNT(*) as cnt,
          SUM(CASE WHEN status='red' THEN 1 ELSE 0 END) as danger_cnt,
          AVG(interest_rate) as avg_rate
        FROM loan_assessments
        WHERE loan_source != '' AND income > 0 AND is_current=1
        GROUP BY slab, loan_source
        ORDER BY slab, cnt DESC
    """).fetchall()

    # Loan exposure (LTI) distribution
    lti_dist = db.execute("""
        SELECT
          CASE WHEN loan_to_income <= 1 THEN '0-1x (Low)'
               WHEN loan_to_income <= 2 THEN '1-2x (Moderate)'
               WHEN loan_to_income <= 3 THEN '2-3x (High)'
               WHEN loan_to_income <= 5 THEN '3-5x (Risky)'
               ELSE '5x+ (Critical)' END as bucket,
          COUNT(*) as cnt,
          SUM(CASE WHEN status='red' THEN 1 ELSE 0 END) as danger_cnt,
          AVG(interest_rate) as avg_rate
        FROM loan_assessments
        WHERE loan_to_income > 0 AND is_current=1
        GROUP BY bucket ORDER BY cnt DESC
    """).fetchall()

    # Vocation × Income slab × Source × Problem distribution (top patterns)
    vis_matrix = db.execute("""
        SELECT u.vocation,
               CASE WHEN la.income<10000 THEN 'below_10k'
                    WHEN la.income<20000 THEN '10k_20k'
                    WHEN la.income<35000 THEN '20k_35k'
                    WHEN la.income<50000 THEN '35k_50k'
                    ELSE 'above_50k' END as slab,
               la.loan_source, la.status, COUNT(*) as cnt
        FROM loan_assessments la JOIN users u ON u.id=la.user_id
        WHERE la.loan_source != '' AND la.income > 0 AND la.is_current=1
        GROUP BY u.vocation, slab, la.loan_source, la.status
        ORDER BY cnt DESC LIMIT 60
    """).fetchall()

    return jsonify({
        "vocation_breakdown":        [dict(r) for r in voc],
        "income_slab_breakdown":     [dict(r) for r in slab],
        "loan_source_breakdown":     [dict(r) for r in src],
        "purpose_breakdown":         [dict(r) for r in purp],
        "interest_rate_buckets":     [dict(r) for r in rate_bkts],
        "expense_burden_avg":        dict(exp_avg) if exp_avg else {},
        "voc_source_matrix":         [dict(r) for r in voc_src],
        "slab_source_matrix":        [dict(r) for r in slab_src],
        "lti_distribution":          [dict(r) for r in lti_dist],
        "voc_income_source_matrix":  [dict(r) for r in vis_matrix],
    })

@app.route("/api/admin/users", methods=["GET"])
@admin_required
def admin_users():
    page=int(request.args.get("page",1))
    pp=int(request.args.get("per_page",20))
    search=request.args.get("search","").strip()
    voc=request.args.get("vocation","")
    stat=request.args.get("status","")
    offset=(page-1)*pp
    where=["1=1"]; params=[]
    if search:
        where.append("(u.name LIKE ? OR u.mobile LIKE ?)"); params+=[f"%{search}%"]*2
    if voc:
        where.append("u.vocation=?"); params.append(voc)
    if stat:
        where.append("la_last.status=?"); params.append(stat)
    ws=" AND ".join(where)
    rows=get_db().execute(f"""
        SELECT u.*, COUNT(la.id) as assessment_count,
               MAX(la.created_at) as last_assessment,
               la_last.status as last_status, la_last.income,
               la_last.loan_amount, la_last.loan_to_income,
               la_last.interest_rate, la_last.loan_source, la_last.loan_purpose
        FROM users u
        LEFT JOIN loan_assessments la ON la.user_id=u.id
        LEFT JOIN loan_assessments la_last ON la_last.id=(
            SELECT id FROM loan_assessments WHERE user_id=u.id ORDER BY created_at DESC LIMIT 1
        )
        WHERE {ws}
        GROUP BY u.id ORDER BY u.created_at DESC
        LIMIT ? OFFSET ?
    """, params+[pp,offset]).fetchall()
    total=get_db().execute(f"""
        SELECT COUNT(DISTINCT u.id) FROM users u
        LEFT JOIN loan_assessments la_last ON la_last.id=(
            SELECT id FROM loan_assessments WHERE user_id=u.id ORDER BY created_at DESC LIMIT 1
        ) WHERE {ws}
    """, params).fetchone()[0]
    return jsonify({"users":[dict(r) for r in rows],"total":total,"page":page,
                    "per_page":pp,"total_pages":math.ceil(total/pp)})

@app.route("/api/admin/users/<int:uid>", methods=["GET"])
@admin_required
def admin_user_detail(uid):
    db=get_db()
    user=db.execute("SELECT * FROM users WHERE id=?", (uid,)).fetchone()
    if not user: return jsonify({"error":"Not found"}), 404
    assessments=db.execute("SELECT * FROM loan_assessments WHERE user_id=? ORDER BY created_at DESC", (uid,)).fetchall()
    events=db.execute("SELECT event,meta,created_at FROM app_events WHERE user_id=? ORDER BY created_at DESC LIMIT 50", (uid,)).fetchall()
    return jsonify({"user":dict(user),"assessments":[dict(a) for a in assessments],"events":[dict(e) for e in events]})

@app.route("/api/admin/assessments", methods=["GET"])
@admin_required
def admin_assessments():
    page=int(request.args.get("page",1))
    pp=int(request.args.get("per_page",25))
    stat=request.args.get("status","")
    src=request.args.get("source","")
    df=request.args.get("date_from",""); dt=request.args.get("date_to","")
    offset=(page-1)*pp; where=["1=1"]; params=[]
    if stat: where.append("la.status=?"); params.append(stat)
    if src:  where.append("la.loan_source=?"); params.append(src)
    if df:   where.append("la.created_at>=?"); params.append(df)
    if dt:   where.append("la.created_at<=?"); params.append(dt+" 23:59:59")
    ws=" AND ".join(where)
    rows=get_db().execute(f"""
        SELECT la.*, u.name, u.vocation, u.mobile FROM loan_assessments la
        JOIN users u ON u.id=la.user_id WHERE {ws}
        ORDER BY la.created_at DESC LIMIT ? OFFSET ?
    """, params+[pp,offset]).fetchall()
    total=get_db().execute(f"SELECT COUNT(*) FROM loan_assessments la WHERE {ws}", params).fetchone()[0]
    return jsonify({"assessments":[dict(r) for r in rows],"total":total,"page":page,
                    "per_page":pp,"total_pages":math.ceil(total/pp)})

@app.route("/api/admin/export/csv", methods=["GET"])
@admin_required
def admin_export_csv():
    rows=get_db().execute("""
        SELECT u.name,u.age,u.mobile,u.vocation,u.vocation_custom,u.city,u.created_at as registered_at,
               la.loan_type,la.loan_amount,la.loan_purpose,la.loan_source,
               la.interest_rate,la.tenure_months,la.loan_remaining,
               la.income,la.rent,la.grocery,la.medicine,la.education,
               la.mobile_bill,la.gaon,la.other_expenses,la.expenses_total,
               la.monthly_savings,la.emi,la.total_interest,la.loan_to_income,
               la.max_safe_loan,la.status,la.conclusion,la.created_at as assessed_at
        FROM loan_assessments la JOIN users u ON u.id=la.user_id
        ORDER BY la.created_at DESC
    """).fetchall()
    buf=io.StringIO()
    if rows:
        w=csv.DictWriter(buf, fieldnames=rows[0].keys())
        w.writeheader(); w.writerows([dict(r) for r in rows])
    return Response(buf.getvalue(), mimetype="text/csv",
                    headers={"Content-Disposition":"attachment; filename=daras_research.csv"})

@app.route("/api/admin/admins", methods=["GET"])
@admin_required
def list_admins():
    if g.admin["role"]!="superadmin": return jsonify({"error":"Superadmin only"}), 403
    rows=get_db().execute("SELECT id,username,full_name,role,last_login,created_at FROM admin_users").fetchall()
    return jsonify([dict(r) for r in rows])

@app.route("/api/admin/admins", methods=["POST"])
@admin_required
def create_admin():
    if g.admin["role"]!="superadmin": return jsonify({"error":"Superadmin only"}), 403
    d=request.get_json(force=True)
    uname=d.get("username","").strip(); pwd=d.get("password","").strip()
    if not uname or not pwd: return jsonify({"error":"username + password required"}), 400
    try:
        get_db().execute("INSERT INTO admin_users (username,password_hash,full_name,role) VALUES (?,?,?,?)",
                         (uname,_hash_pw(pwd),d.get("full_name",""),d.get("role","analyst")))
        get_db().commit()
        return jsonify({"ok":True})
    except sqlite3.IntegrityError:
        return jsonify({"error":"Username already exists"}), 409

@app.route("/api/admin/admins/<int:aid>", methods=["DELETE"])
@admin_required
def delete_admin(aid):
    if g.admin["role"]!="superadmin": return jsonify({"error":"Superadmin only"}), 403
    if aid==g.admin["id"]: return jsonify({"error":"Cannot delete yourself"}), 400
    get_db().execute("DELETE FROM admin_users WHERE id=?", (aid,))
    get_db().commit()
    return jsonify({"ok":True})

@app.route("/api/admin/questions", methods=["GET"])
@admin_required
def admin_questions():
    rows=get_db().execute("""
        SELECT q.id, q.question, q.context, q.created_at,
               u.name, u.vocation, u.mobile
        FROM open_questions q LEFT JOIN users u ON u.id=q.user_id
        ORDER BY q.created_at DESC LIMIT 200
    """).fetchall()
    return jsonify([dict(r) for r in rows])

# ── Entry ─────────────────────────────────────────────────────────────────────
if __name__=="__main__":
    init_db()
    port=int(os.environ.get("PORT",5001))
    debug=os.environ.get("FLASK_DEBUG","0") == "1"
    print(f"\n  DARAS running on http://localhost:{port}\n"
          f"  Admin panel → http://localhost:{port}/admin\n")
    app.run(debug=debug, port=port)
