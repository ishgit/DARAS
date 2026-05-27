"""Public user API blueprint — /api/user/*"""
import json, sqlite3, uuid
from flask import Blueprint, request, jsonify, g
from extensions import limiter
from db import get_db, _hash_mobile
from calculator import (
    run_calculator, calc_max_loan, calc_max_loan_simple, calc_simple_interest,
    calc_emi, calc_payoff_months, calc_payoff_months_simple, income_slab,
    summarize_existing_loans, calc_kul_jama, validate_affordability,
    calc_cross_check,
)

user_bp = Blueprint("user", __name__, url_prefix="/api/user")


@user_bp.route("/register", methods=["POST"])
@limiter.limit("20 per hour")
def user_register():
    d        = request.get_json(force=True)
    name     = (d.get("name") or "").strip()
    if not name:
        return jsonify({"error": "Naam zaroori hai"}), 400
    db       = get_db()
    mobile   = (d.get("mobile") or "").strip()
    language = d.get("language", "hi")
    vocation = d.get("vocation", "other")
    voc_custom = d.get("vocation_custom", "")
    age      = d.get("age")

    # START OVER: update existing user record, keep same user_id
    existing_uid = d.get("existing_user_id")
    if existing_uid:
        household_size   = d.get("household_size")
        employment_type  = d.get("employment_type", "")
        has_bank_account = 1 if d.get("has_bank_account") else 0
        db.execute(
            "UPDATE users SET name=?,age=?,vocation=?,vocation_custom=?,language=?,household_size=?,employment_type=?,has_bank_account=?,last_active=datetime('now') WHERE id=?",
            (name, age, vocation, voc_custom, language, household_size, employment_type, has_bank_account, existing_uid)
        )
        db.commit()
        row = db.execute("SELECT id,session_id FROM users WHERE id=?", (existing_uid,)).fetchone()
        db.execute("INSERT INTO app_events (user_id,event,meta) VALUES (?,?,?)",
                   (existing_uid, "start_over", json.dumps({"vocation": vocation, "lang": language})))
        db.commit()
        return jsonify({"success": True, "user_id": row["id"], "session_id": row["session_id"]})

    # Duplicate mobile check — return all existing profiles for frontend to handle
    if mobile and len(mobile) >= 6 and not d.get("force_new"):
        existing_rows = db.execute(
            "SELECT * FROM users WHERE mobile_hash=? AND deleted_at IS NULL ORDER BY created_at DESC",
            (_hash_mobile(mobile),)
        ).fetchall()
        if existing_rows:
            profiles = [{
                "id":              row["id"],
                "session_id":      row["session_id"],
                "name":            row["name"],
                "age":             row["age"],
                "mobile_last4":    row["mobile_last4"] or "",
                "vocation":        row["vocation"],
                "vocation_custom": row["vocation_custom"] or "",
                "language":        row["language"] or "hi",
            } for row in existing_rows]
            return jsonify({"exists": True, "profiles": profiles})

    # New user INSERT
    sid = str(uuid.uuid4())
    household_size   = d.get("household_size")
    employment_type  = d.get("employment_type", "")
    has_bank_account = 1 if d.get("has_bank_account") else 0
    mob_hash  = _hash_mobile(mobile) if mobile and len(mobile) >= 6 else None
    mob_last4 = mobile[-4:] if mobile and len(mobile) >= 4 else (mobile or None)
    try:
        db.execute("""
            INSERT INTO users
              (session_id,name,age,mobile_hash,mobile_last4,vocation,vocation_custom,city,state,language,
               household_size,employment_type,has_bank_account)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
        """, (sid, name, age, mob_hash, mob_last4,
              vocation, voc_custom,
              d.get("city", ""), d.get("state", ""), language,
              household_size, employment_type, has_bank_account))
        db.commit()
        uid = db.execute("SELECT id FROM users WHERE session_id=?", (sid,)).fetchone()["id"]
        db.execute("INSERT INTO app_events (user_id,event,meta) VALUES (?,?,?)",
                   (uid, "register", json.dumps({"vocation": vocation, "lang": language})))
        db.commit()
        return jsonify({"success": True, "session_id": sid, "user_id": uid})
    except sqlite3.IntegrityError as e:
        return jsonify({"error": str(e)}), 409


@user_bp.route("/profile/<int:uid>", methods=["DELETE"])
def delete_user_profile(uid):
    db  = get_db()
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        token = auth[7:]
        valid = db.execute("""
            SELECT 1 FROM admin_sessions s JOIN admin_users a ON a.id=s.admin_id
            WHERE s.token=? AND s.expires_at > datetime('now')
        """, (token,)).fetchone()
        if not valid:
            return jsonify({"error": "Unauthorized"}), 401
    else:
        body = request.get_json(silent=True) or {}
        sid  = body.get("session_id", "")
        if not sid or not db.execute(
            "SELECT 1 FROM users WHERE id=? AND session_id=?", (uid, sid)
        ).fetchone():
            return jsonify({"error": "Unauthorized"}), 401

    db.execute("DELETE FROM open_questions WHERE user_id=?", (uid,))
    db.execute("DELETE FROM app_events WHERE user_id=?", (uid,))
    db.execute("""
        UPDATE users SET
            name='[deleted]', mobile_hash=NULL, mobile_last4=NULL,
            ip_address=NULL, user_agent=NULL,
            deleted_at=datetime('now')
        WHERE id=?
    """, (uid,))
    db.commit()
    return jsonify({"success": True})


@user_bp.route("/calculate", methods=["POST"])
@limiter.limit("60 per hour")
def user_calculate():
    d = request.get_json(force=True)
    try:
        income    = float(d.get("income", 0)          or 0)
        rent      = float(d.get("rent", 0)            or 0)
        grocery   = float(d.get("grocery", 0)         or 0)
        medicine  = float(d.get("medicine", 0)        or 0)
        education = float(d.get("education", 0)       or 0)
        mob       = float(d.get("mobile_bill", 0)     or 0)
        gaon      = float(d.get("gaon", 0)            or 0)
        other     = float(d.get("other_expenses", 0)  or 0)
        loan      = float(d.get("loan_amount", 0)     or 0)
        rate      = float(d.get("interest_rate", 12)  or 12)
        months    = int(  d.get("tenure_months", 12)  or 12)
        remaining = float(d.get("loan_remaining", loan) or loan)
        monthly_emi = float(d.get("monthly_emi", 0) or 0)
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid numeric value in request"}), 400

    existing_summary = None
    existing_loans = d.get("existing_loans") or []
    if isinstance(existing_loans, list) and existing_loans:
        try:
            existing_summary = summarize_existing_loans(existing_loans)
            if existing_summary["total_amount"] > 0:
                loan = existing_summary["total_amount"]
                remaining = existing_summary["total_remaining"] or loan
                rate = existing_summary["weighted_interest_rate"]
                if not monthly_emi and existing_summary["monthly_payment_total"] > 0:
                    monthly_emi = existing_summary["monthly_payment_total"]
        except (ValueError, TypeError):
            return jsonify({"error": "Invalid existing loan details"}), 400

    loan_type = d.get("loan_type", "existing")
    errs = []
    if not (0 <= income <= 1_000_000):
        errs.append("income must be 0–10,00,000")
    for fname, val in [("rent", rent), ("grocery", grocery), ("medicine", medicine),
                       ("education", education), ("mobile_bill", mob),
                       ("gaon", gaon), ("other_expenses", other)]:
        if not (0 <= val <= 500_000):
            errs.append(f"{fname} must be 0–5,00,000")
    if not (0 <= loan <= 10_000_000):
        errs.append("loan_amount must be 0–1,00,00,000")
    max_rate_allowed = 1000 if existing_summary else 60
    if not (0 <= rate <= max_rate_allowed):
        errs.append(f"interest_rate must be 0–{max_rate_allowed}")
    if not (1 <= months <= 360):
        errs.append("tenure_months must be 1–360")
    if not (0 <= remaining <= max(loan, 0)):
        errs.append("loan_remaining must be 0–loan_amount")
    if not (0 <= monthly_emi <= 1_000_000):
        errs.append("monthly_emi must be 0–10,00,000")
    if errs:
        return jsonify({"error": "Out of range", "fields": errs}), 400

    expenses  = rent + grocery + medicine + education + mob + gaon + other
    purpose   = d.get("loan_purpose", "")
    source    = d.get("loan_source", "")

    r = run_calculator(
        income, expenses, loan, rate, months,
        remaining=remaining,
        actual_monthly_emi=monthly_emi if loan_type == "existing" else None,
    )
    if existing_summary:
        r["existing_loans_summary"] = existing_summary
        r["interest_rate"] = existing_summary["weighted_interest_rate"]
        r["max_existing_interest_rate"] = existing_summary["max_interest_rate"]
    r["expenses_breakdown"] = {
        "rent": rent, "grocery": grocery, "medicine": medicine,
        "education": education, "mobile_bill": mob, "gaon": gaon, "other": other
    }
    surplus = max(0, income - expenses)

    # ── Excel validation gates (F6, L6, I7) ─────────────────────────
    if existing_summary and existing_summary.get("loans"):
        affordability = validate_affordability(surplus, existing_summary["loans"])
        r["affordability_gates"] = affordability
    else:
        r["affordability_gates"] = {
            "gates": [], "all_ok": True,
            "savings_after_all_payments": round(surplus, 2),
        }

    # ── Excel I10/I11: simple-interest loan eligibility ──────────────
    new_loan_rate = float(d.get("new_loan_rate", 18) or 18)
    new_loan_tenure = int(d.get("new_loan_tenure", months) or months)
    new_loan_payment = float(d.get("new_loan_payment", 0) or 0)
    savings_after_existing = r["affordability_gates"]["savings_after_all_payments"]
    if new_loan_payment <= 0:
        new_loan_payment = savings_after_existing

    simple_eligible = calc_max_loan_simple(new_loan_payment, new_loan_rate, new_loan_tenure)
    simple_interest = calc_simple_interest(simple_eligible, new_loan_rate, new_loan_tenure)
    emi_eligible = calc_max_loan(max(0, new_loan_payment), new_loan_rate, new_loan_tenure)

    r["new_loan_eligibility"] = {
        "monthly_payment_capacity": round(new_loan_payment, 2),
        "interest_rate": new_loan_rate,
        "tenure_months": new_loan_tenure,
        "simple_interest_eligible": simple_eligible,
        "simple_interest_amount": simple_interest,
        "emi_eligible": emi_eligible,
    }

    # ── Excel I4: Kul Jama (total savings after all obligations) ─────
    if existing_summary:
        kul_jama = calc_kul_jama(surplus, new_loan_tenure, existing_summary)
    else:
        kul_jama = round(max(0, surplus * new_loan_tenure), 2)
    r["kul_jama"] = kul_jama

    # ── Excel H14: Cross-check ───────────────────────────────────────
    r["cross_check"] = calc_cross_check(kul_jama, simple_interest, simple_eligible)

    # ── Excel K16/K17: "Haan / Na" follow-up for interest-only tier ──
    if r.get("conclusion") == "interest_only":
        r["follow_up"] = {
            "question_hi": "Koi nayi amdani ya paise aana hai kya?",
            "question_en": "Do you expect any new income or funds?",
            "question_bn": "নতুন আয় বা টাকা আসার সম্ভাবনা আছে?",
            "options": [
                {"value": "haan", "label_hi": "Haan", "label_en": "Yes", "label_bn": "হ্যাঁ"},
                {"value": "na",   "label_hi": "Na",   "label_en": "No",  "label_bn": "না"},
            ],
        }

    # For flat-rate / informal loans where actual monthly payment is known, avoid
    # feeding an inferred flat rate into a reducing-balance payoff formula.
    if existing_summary and existing_summary.get("monthly_payment_total", 0) > 0:
        r["payoff_months_at_surplus"] = calc_payoff_months_simple(
            existing_summary["total_remaining"], surplus
        )
        # Max safe loan = how much NEW additional debt the post-EMI surplus can handle
        # at a standard MFI/bank rate (18%), not the existing flat rate.
        after_emi_surplus = max(0, surplus - existing_summary["monthly_payment_total"])
        r["max_safe_loan"] = calc_max_loan(after_emi_surplus, 18.0, months)
    else:
        r["payoff_months_at_surplus"] = calc_payoff_months(remaining or loan, rate, surplus)

    db = get_db()
    uid = d.get("user_id")
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
                   loan_to_income,foir,dscr,max_safe_loan,status,conclusion)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """, (uid, loan_type, loan, purpose, source, rate, months, remaining,
                  income, rent, grocery, medicine, education, mob, gaon, other, expenses,
                  r["monthly_savings"], r["emi"], r["total_interest"], r["monthly_interest"],
                  r["lti_ratio"], r["foir"], r["dscr"], r["max_safe_loan"], r["status"], r["conclusion"]))
            db.execute("INSERT INTO app_events (user_id,event,meta) VALUES (?,?,?)",
                       (uid, "assessment", json.dumps({
                           "status": r["status"], "income_slab": income_slab(income),
                           "loan_source": source, "loan_type": loan_type, "lti": r["lti_ratio"]})))
            db.execute("UPDATE users SET last_active=datetime('now') WHERE id=?", (uid,))
            db.commit()
        except Exception as e:
            from flask import current_app
            current_app.logger.error(f"DB error: {e}")

    return jsonify(r)


@user_bp.route("/calculate_max", methods=["POST"])
def user_calculate_max():
    """Reverse calc — monthly surplus + tenure + rate → max safe loan."""
    d = request.get_json(force=True)
    try:
        surplus = float(d.get("monthly_savings", 0) or 0)
        rate    = float(d.get("interest_rate", 12)  or 12)
        months  = int(  d.get("tenure_months", 12)  or 12)
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid numeric value in request"}), 400

    errs = []
    if not (0 <= surplus <= 1_000_000):
        errs.append("monthly_savings must be 0–10,00,000")
    if not (0 <= rate <= 60):
        errs.append("interest_rate must be 0–60")
    if not (1 <= months <= 360):
        errs.append("tenure_months must be 1–360")
    if errs:
        return jsonify({"error": "Out of range", "fields": errs}), 400

    max_loan = calc_max_loan(surplus, rate, months)
    emi_per_lakh = calc_emi(100000, rate, months)
    return jsonify({
        "max_safe_loan":   max_loan,
        "monthly_savings": surplus,
        "interest_rate":   rate,
        "tenure_months":   months,
        "emi_per_lakh":    emi_per_lakh,
    })


@user_bp.route("/event", methods=["POST"])
@limiter.limit("120 per hour")
def log_event():
    d     = request.get_json(force=True, silent=True) or {}
    event = str(d.get("event", "page_view"))[:64]
    meta  = json.dumps(d.get("meta") or {})[:1024]
    db    = get_db()
    db.execute("INSERT INTO app_events (user_id,event,meta) VALUES (?,?,?)",
               (d.get("user_id"), event, meta))
    db.commit()
    return jsonify({"ok": True})


@user_bp.route("/lookup", methods=["POST"])
def user_lookup():
    d      = request.get_json(force=True)
    mobile = (d.get("mobile") or "").strip()
    if len(mobile) < 6:
        return jsonify({"found": False})
    db   = get_db()
    user = db.execute(
        "SELECT * FROM users WHERE mobile_hash=? AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 1",
        (_hash_mobile(mobile),)
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
            "mobile_last4":    user["mobile_last4"] or "",
            "vocation":        user["vocation"],
            "vocation_custom": user["vocation_custom"] or "",
            "language":        user["language"] or "hi",
        },
        "last_assessment": dict(last) if last else None,
    })


@user_bp.route("/question", methods=["POST"])
@limiter.limit("30 per hour")
def log_question():
    d = request.get_json(force=True)
    q = (d.get("question") or "").strip()
    if not q:
        return jsonify({"error": "empty"}), 400
    db = get_db()
    db.execute("INSERT INTO open_questions (user_id,question,context) VALUES (?,?,?)",
               (d.get("user_id"), q, json.dumps(d.get("context", {}))))
    db.execute("INSERT INTO app_events (user_id,event,meta) VALUES (?,?,?)",
               (d.get("user_id"), "open_question", json.dumps({"len": len(q)})))
    db.commit()
    return jsonify({"ok": True})
