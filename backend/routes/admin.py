"""Admin API blueprint — /api/admin/*"""
import math, csv, io, json, sqlite3
from flask import Blueprint, request, jsonify, g, Response
from extensions import limiter
from db import get_db
from auth import _new_salt, _hash_pw, _verify_pw, _new_token, _token_exp, admin_required
from config import _now

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


# ── Auth ──────────────────────────────────────────────────────────────────────

@admin_bp.route("/auth/login", methods=["POST"])
@limiter.limit("10 per hour")
def admin_login():
    d     = request.get_json(force=True)
    uname = d.get("username", "").strip()
    pwd   = d.get("password", "")
    if not uname or not pwd:
        return jsonify({"error": "Username aur password dono chahiye"}), 400
    db    = get_db()
    admin = db.execute("SELECT * FROM admin_users WHERE username=?", (uname,)).fetchone()
    if not admin or not _verify_pw(pwd, admin["password_hash"], admin["salt"]):
        return jsonify({"error": "Username ya password galat hai"}), 401
    # Auto-upgrade legacy (unsalted) hash on successful login
    if not admin["salt"]:
        new_salt = _new_salt()
        db.execute(
            "UPDATE admin_users SET password_hash=?, salt=? WHERE id=?",
            (_hash_pw(pwd, new_salt), new_salt, admin["id"])
        )
        db.commit()
    # Prune expired sessions on each login to prevent unbounded growth
    db.execute("DELETE FROM admin_sessions WHERE expires_at < datetime('now')")
    token = _new_token()
    exp   = _token_exp()
    db.execute("INSERT INTO admin_sessions (admin_id,token,expires_at,ip_address) VALUES (?,?,?,?)",
               (admin["id"], token, exp, request.remote_addr))
    db.execute("UPDATE admin_users SET last_login=datetime('now') WHERE id=?", (admin["id"],))
    db.commit()
    return jsonify({"token": token, "expires": exp, "username": admin["username"],
                    "role": admin["role"], "full_name": admin["full_name"]})


@admin_bp.route("/auth/logout", methods=["POST"])
@admin_required
def admin_logout():
    db = get_db()
    db.execute("DELETE FROM admin_sessions WHERE token=?",
               (request.headers["Authorization"][7:],))
    db.commit()
    return jsonify({"ok": True})


@admin_bp.route("/auth/me", methods=["GET"])
@admin_required
def admin_me():
    return jsonify(g.admin)


# ── Data API ──────────────────────────────────────────────────────────────────

@admin_bp.route("/dashboard", methods=["GET"])
@admin_required
def admin_dashboard():
    db    = get_db()
    today = _now().strftime("%Y-%m-%d")

    total_users  = db.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    total_assess = db.execute("SELECT COUNT(*) FROM loan_assessments WHERE is_current=1").fetchone()[0]
    users_today  = db.execute("SELECT COUNT(*) FROM users WHERE created_at LIKE ?", (today + "%",)).fetchone()[0]
    assess_today = db.execute("SELECT COUNT(*) FROM loan_assessments WHERE is_current=1 AND created_at LIKE ?", (today + "%",)).fetchone()[0]

    status_rows  = db.execute("SELECT status,COUNT(*) as cnt FROM loan_assessments WHERE is_current=1 GROUP BY status").fetchall()
    status_dist  = {r["status"]: r["cnt"] for r in status_rows}
    red_cnt      = status_dist.get("red", 0)
    danger_pct   = round(red_cnt / total_assess * 100, 1) if total_assess else 0

    visitor_count     = db.execute("SELECT COUNT(*) FROM app_events WHERE event='visit'").fetchone()[0]
    oq_count          = db.execute("SELECT COUNT(*) FROM open_questions").fetchone()[0]
    qualify_count     = status_dist.get("green", 0) + status_dist.get("orange", 0)
    not_qualify_count = status_dist.get("red", 0)

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
        "total_users": total_users, "total_assessments": total_assess,
        "users_today": users_today, "assessments_today": assess_today,
        "visitor_count": visitor_count,
        "open_questions_count": oq_count,
        "qualify_count": qualify_count,
        "not_qualify_count": not_qualify_count,
        "status_distribution": status_dist,
        "avg_income": round(avg_income), "avg_loan": round(avg_loan),
        "avg_loan_to_income": round(avg_lti, 2), "avg_interest_rate": round(avg_rate, 1),
        "danger_pct": danger_pct,
        "trend_30d": [{"day": r["day"], "count": r["cnt"]} for r in trend],
        "recent_assessments": [dict(r) for r in recent],
    })


@admin_bp.route("/research", methods=["GET"])
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

    voc_src = db.execute("""
        SELECT u.vocation, la.loan_source, COUNT(*) as cnt,
               SUM(CASE WHEN la.status='red' THEN 1 ELSE 0 END) as danger_cnt,
               AVG(la.interest_rate) as avg_rate
        FROM loan_assessments la JOIN users u ON u.id=la.user_id
        WHERE la.loan_source != '' AND la.is_current=1
        GROUP BY u.vocation, la.loan_source
        ORDER BY u.vocation, cnt DESC
    """).fetchall()

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
        "vocation_breakdown":       [dict(r) for r in voc],
        "income_slab_breakdown":    [dict(r) for r in slab],
        "loan_source_breakdown":    [dict(r) for r in src],
        "purpose_breakdown":        [dict(r) for r in purp],
        "interest_rate_buckets":    [dict(r) for r in rate_bkts],
        "expense_burden_avg":       dict(exp_avg) if exp_avg else {},
        "voc_source_matrix":        [dict(r) for r in voc_src],
        "slab_source_matrix":       [dict(r) for r in slab_src],
        "lti_distribution":         [dict(r) for r in lti_dist],
        "voc_income_source_matrix": [dict(r) for r in vis_matrix],
    })


@admin_bp.route("/users", methods=["GET"])
@admin_required
def admin_users():
    page   = int(request.args.get("page", 1))
    pp     = int(request.args.get("per_page", 20))
    search = request.args.get("search", "").strip()
    voc    = request.args.get("vocation", "")
    stat   = request.args.get("status", "")
    offset = (page - 1) * pp
    # INVARIANT: only hardcoded SQL fragments go into `where`; all user values go into `params`.
    where = ["1=1"]; params = []
    if search:
        where.append("(u.name LIKE ? OR u.mobile_last4 LIKE ?)"); params += [f"%{search}%"] * 2
    if voc:
        where.append("u.vocation=?"); params.append(voc)
    if stat:
        where.append("la_last.status=?"); params.append(stat)
    ws = " AND ".join(where)
    rows = get_db().execute(f"""
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
    """, params + [pp, offset]).fetchall()
    total = get_db().execute(f"""
        SELECT COUNT(DISTINCT u.id) FROM users u
        LEFT JOIN loan_assessments la_last ON la_last.id=(
            SELECT id FROM loan_assessments WHERE user_id=u.id ORDER BY created_at DESC LIMIT 1
        ) WHERE {ws}
    """, params).fetchone()[0]
    return jsonify({"users": [dict(r) for r in rows], "total": total, "page": page,
                    "per_page": pp, "total_pages": math.ceil(total / pp)})


@admin_bp.route("/users/<int:uid>", methods=["GET"])
@admin_required
def admin_user_detail(uid):
    db   = get_db()
    user = db.execute("SELECT * FROM users WHERE id=?", (uid,)).fetchone()
    if not user:
        return jsonify({"error": "Not found"}), 404
    assessments = db.execute("SELECT * FROM loan_assessments WHERE user_id=? ORDER BY created_at DESC", (uid,)).fetchall()
    events      = db.execute("SELECT event,meta,created_at FROM app_events WHERE user_id=? ORDER BY created_at DESC LIMIT 50", (uid,)).fetchall()
    return jsonify({"user": dict(user), "assessments": [dict(a) for a in assessments], "events": [dict(e) for e in events]})


@admin_bp.route("/assessments", methods=["GET"])
@admin_required
def admin_assessments():
    page   = int(request.args.get("page", 1))
    pp     = int(request.args.get("per_page", 25))
    stat   = request.args.get("status", "")
    src    = request.args.get("source", "")
    df     = request.args.get("date_from", "")
    dt     = request.args.get("date_to", "")
    offset = (page - 1) * pp
    # INVARIANT: only hardcoded SQL fragments go into `where`; all user values go into `params`.
    where = ["1=1"]; params = []
    if stat: where.append("la.status=?");      params.append(stat)
    if src:  where.append("la.loan_source=?"); params.append(src)
    if df:   where.append("la.created_at>=?"); params.append(df)
    if dt:   where.append("la.created_at<=?"); params.append(dt + " 23:59:59")
    ws = " AND ".join(where)
    rows  = get_db().execute(f"""
        SELECT la.*, u.name, u.vocation, u.mobile_last4 FROM loan_assessments la
        JOIN users u ON u.id=la.user_id WHERE {ws}
        ORDER BY la.created_at DESC LIMIT ? OFFSET ?
    """, params + [pp, offset]).fetchall()
    total = get_db().execute(f"SELECT COUNT(*) FROM loan_assessments la WHERE {ws}", params).fetchone()[0]
    return jsonify({"assessments": [dict(r) for r in rows], "total": total, "page": page,
                    "per_page": pp, "total_pages": math.ceil(total / pp)})


@admin_bp.route("/export/csv", methods=["GET"])
@admin_required
def admin_export_csv():
    rows = get_db().execute("""
        SELECT u.name,u.age,u.mobile_last4,u.vocation,u.vocation_custom,u.city,u.created_at as registered_at,
               la.loan_type,la.loan_amount,la.loan_purpose,la.loan_source,
               la.interest_rate,la.tenure_months,la.loan_remaining,
               la.income,la.rent,la.grocery,la.medicine,la.education,
               la.mobile_bill,la.gaon,la.other_expenses,la.expenses_total,
               la.monthly_savings,la.emi,la.total_interest,la.loan_to_income,
               la.max_safe_loan,la.status,la.conclusion,la.created_at as assessed_at
        FROM loan_assessments la JOIN users u ON u.id=la.user_id
        ORDER BY la.created_at DESC
    """).fetchall()
    buf = io.StringIO()
    if rows:
        w = csv.DictWriter(buf, fieldnames=rows[0].keys())
        w.writeheader()
        w.writerows([dict(r) for r in rows])
    return Response(buf.getvalue(), mimetype="text/csv",
                    headers={"Content-Disposition": "attachment; filename=daras_research.csv"})


@admin_bp.route("/admins", methods=["GET"])
@admin_required
def list_admins():
    if g.admin["role"] != "superadmin":
        return jsonify({"error": "Superadmin only"}), 403
    rows = get_db().execute("SELECT id,username,full_name,role,last_login,created_at FROM admin_users").fetchall()
    return jsonify([dict(r) for r in rows])


@admin_bp.route("/admins", methods=["POST"])
@admin_required
def create_admin():
    if g.admin["role"] != "superadmin":
        return jsonify({"error": "Superadmin only"}), 403
    d     = request.get_json(force=True)
    uname = d.get("username", "").strip()
    pwd   = d.get("password", "").strip()
    if not uname or not pwd:
        return jsonify({"error": "username + password required"}), 400
    try:
        new_salt = _new_salt()
        get_db().execute(
            "INSERT INTO admin_users (username,password_hash,salt,full_name,role) VALUES (?,?,?,?,?)",
            (uname, _hash_pw(pwd, new_salt), new_salt, d.get("full_name", ""), d.get("role", "analyst"))
        )
        get_db().commit()
        return jsonify({"ok": True})
    except sqlite3.IntegrityError:
        return jsonify({"error": "Username already exists"}), 409


@admin_bp.route("/admins/<int:aid>", methods=["DELETE"])
@admin_required
def delete_admin(aid):
    if g.admin["role"] != "superadmin":
        return jsonify({"error": "Superadmin only"}), 403
    if aid == g.admin["id"]:
        return jsonify({"error": "Cannot delete yourself"}), 400
    get_db().execute("DELETE FROM admin_users WHERE id=?", (aid,))
    get_db().commit()
    return jsonify({"ok": True})


@admin_bp.route("/questions", methods=["GET"])
@admin_required
def admin_questions():
    rows = get_db().execute("""
        SELECT q.id, q.question, q.context, q.created_at,
               u.name, u.vocation, u.mobile_last4
        FROM open_questions q LEFT JOIN users u ON u.id=q.user_id
        ORDER BY q.created_at DESC LIMIT 200
    """).fetchall()
    return jsonify([dict(r) for r in rows])
