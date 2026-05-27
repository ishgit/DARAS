"""Pure financial calculation engine — no Flask dependencies."""
import math


_PRINCIPAL_RISK_THRESHOLD = 0.4  # flag when >40% of principal can't be repaid from savings


# ---------------------------------------------------------------------------
# Simple-interest helpers — matching the Excel "DARAS V3" workbook exactly
# ---------------------------------------------------------------------------

def calc_max_loan_simple(monthly_payment, annual_pct, months):
    """Excel cell I10: max principal under simple / flat interest.

    Formula:  P = (monthly_payment × months) / (1 + rate × months / 12)
    """
    if months <= 0 or monthly_payment <= 0:
        return 0.0
    rate = annual_pct / 100  # Excel stores as decimal, we receive %
    return round((monthly_payment * months) / (1 + rate * months / 12), 2)


def calc_simple_interest(principal, annual_pct, months):
    """Excel cell I11: interest on a simple-interest loan.

    Formula:  I = P × rate × months / 12
    """
    if principal <= 0 or months <= 0:
        return 0.0
    rate = annual_pct / 100
    return round(principal * rate * months / 12, 2)


def calc_kul_jama(monthly_savings, new_tenure_months, loans_summary):
    """Excel cell I4 — total surplus over the new-loan term after all obligations.

    Formula:  MAX(0, savings × tenure − Σ(interest_i) − Σ(principal_i))
    """
    total_savings = monthly_savings * new_tenure_months
    total_obligations = (
        loans_summary.get("total_interest", 0)
        + loans_summary.get("total_amount", 0)
    )
    return round(max(0, total_savings - total_obligations), 2)


def validate_affordability(monthly_savings, loans):
    """Excel cells F6 / L6 / I7 — cascading "can afford?" gates.

    Each gate checks whether the borrower's remaining savings (after
    higher-priority payments) can cover the next payment.
    Returns a list of per-loan gate results, e.g.
        [{"loan_index": 0, "payment": 500, "remaining_savings": 6500, "ok": True}, …]
    and an overall boolean ``all_ok``.
    """
    gates = []
    remaining = monthly_savings
    for idx, loan in enumerate(loans or []):
        payment = float(loan.get("monthly_payment", 0) or 0)
        ok = payment <= remaining
        gates.append({
            "loan_index": idx,
            "payment": round(payment, 2),
            "remaining_savings_before": round(remaining, 2),
            "ok": ok,
        })
        remaining = max(0, remaining - payment)
    return {
        "gates": gates,
        "all_ok": all(g["ok"] for g in gates),
        "savings_after_all_payments": round(remaining, 2),
    }


def calc_cross_check(kul_jama, new_loan_interest, new_loan_principal):
    """Excel cell H14 — verification: kul_jama − new interest − new principal."""
    return round(kul_jama - new_loan_interest - new_loan_principal, 2)


def income_slab(inc):
    if inc < 10000: return "below_10k"
    if inc < 20000: return "10k_20k"
    if inc < 35000: return "20k_35k"
    if inc < 50000: return "35k_50k"
    return "above_50k"


def calc_emi(p, annual_pct, months):
    if months <= 0: return 0.0
    if annual_pct <= 0: return round(p / months, 2)
    r = (annual_pct / 100) / 12
    return round(p * r * (1 + r) ** months / ((1 + r) ** months - 1), 2)


def calc_max_loan(surplus, annual_pct, months):
    if months <= 0 or surplus <= 0: return 0.0
    if annual_pct <= 0: return round(surplus * months, 2)
    r = (annual_pct / 100) / 12
    return round(surplus * ((1 + r) ** months - 1) / (r * (1 + r) ** months), 2)


def calc_payoff_months(p, annual_pct, monthly_pay):
    """How many months to pay off principal p at given rate with monthly_pay?"""
    if monthly_pay <= 0 or p <= 0: return 0
    r = (annual_pct / 100) / 12
    if r <= 0:
        return math.ceil(p / monthly_pay)
    if monthly_pay <= p * r:  # cannot even cover interest
        return -1
    n = math.log(monthly_pay / (monthly_pay - p * r)) / math.log(1 + r)
    return math.ceil(n)


def calc_payoff_months_simple(remaining, monthly_surplus):
    """Payoff months for flat-rate / informal loans where interest is baked into total_return.
    Remaining is principal; no compounding — each rupee of surplus reduces principal directly.
    """
    if remaining <= 0: return 0
    if monthly_surplus <= 0: return -1
    return math.ceil(remaining / monthly_surplus)


def infer_flat_annual_rate(principal, total_return, months):
    """Infer flat annual interest % from total repayment, matching the Excel model."""
    if principal <= 0 or months <= 0:
        return 0.0
    interest = max(0, total_return - principal)
    return round((interest / months / principal) * 12 * 100, 2)


def summarize_existing_loans(loans):
    """
    Combine multiple existing loans using the workbook's formulas:
    total principal, total interest, highest rate/tenure, weighted tenure,
    and weighted flat annual interest.
    """
    clean = []
    for loan in loans or []:
        amount = float(loan.get("amount", 0) or 0)
        if amount <= 0:
            continue
        tenure = int(loan.get("tenure_months", 0) or 0)
        if tenure <= 0:
            tenure = 1
        total_return = loan.get("total_return")
        rate = loan.get("interest_rate")
        if total_return not in (None, ""):
            total_return = float(total_return or 0)
            interest = max(0, total_return - amount)
            rate = infer_flat_annual_rate(amount, total_return, tenure)
            monthly_payment = total_return / tenure if tenure else 0
        else:
            rate = float(rate or 0)
            interest = amount * (rate / 100) * (tenure / 12)
            total_return = amount + interest
            monthly_payment = float(loan.get("monthly_payment", 0) or 0)

        remaining = float(loan.get("remaining", amount) or amount)
        clean.append({
            "amount": amount,
            "remaining": min(max(remaining, 0), amount),
            "tenure_months": tenure,
            "interest_rate": round(rate, 2),
            "interest_amount": round(interest, 2),
            "total_return": round(total_return, 2),
            "monthly_payment": round(monthly_payment, 2),
        })

    total_amount = sum(x["amount"] for x in clean)
    total_interest = sum(x["interest_amount"] for x in clean)
    total_remaining = sum(x["remaining"] for x in clean)
    weighted_tenure = (
        sum(x["amount"] * x["tenure_months"] for x in clean) / total_amount
        if total_amount else 0
    )
    weighted_rate = (
        (total_interest / weighted_tenure / total_amount) * 12 * 100
        if total_amount and weighted_tenure else 0
    )
    monthly_payment_total = sum(x["monthly_payment"] for x in clean)

    return {
        "loans": clean,
        "total_amount": round(total_amount, 2),
        "total_remaining": round(total_remaining, 2),
        "total_interest": round(total_interest, 2),
        "max_interest_rate": round(max((x["interest_rate"] for x in clean), default=0), 2),
        "max_tenure_months": max((x["tenure_months"] for x in clean), default=0),
        "weighted_tenure_months": round(weighted_tenure, 2),
        "weighted_interest_rate": round(weighted_rate, 2),
        "monthly_payment_total": round(monthly_payment_total, 2),
    }


def run_calculator(income, expenses, loan, rate, months, remaining=None, actual_monthly_emi=None):
    emi_principal = remaining if (remaining and 0 < remaining <= loan) else loan
    savings  = income - expenses
    # EMI — Reducing Balance (RBI DBOD.No.Dir.BC.56/13.03.00/2003-04)
    emi      = round(float(actual_monthly_emi), 2) if actual_monthly_emi and actual_monthly_emi > 0 else calc_emi(emi_principal, rate, months)
    # Total interest = total payments minus principal (not simple interest)
    tot_int  = round(max(0, emi * months - emi_principal), 2)
    mon_int  = round(tot_int / months, 2) if months else 0
    tot_pay  = round(emi_principal + tot_int, 2)
    # LTI — loan vs annual income (RBI Financial Stability Report standard)
    lti      = round(loan / (income * 12), 2) if income else 0
    # FOIR — EMI as % of monthly income (RBI Master Direction on Advances 2016)
    foir     = round((emi / income) * 100, 2) if income else 0
    # DSCR — savings per rupee of EMI (NABARD/Sa-Dhan MFI Guidelines)
    dscr     = round(max(savings, 0) / emi, 2) if emi > 0 else 0
    after_emi_savings = round(savings - emi, 2)
    int_pay  = round(min(max(savings, 0) * months, tot_int), 2)
    int_unp  = round(max(0, tot_int - int_pay), 2)
    rem_sav  = max(0, savings * months - tot_int)
    prin_pay = round(min(rem_sav, emi_principal), 2)
    prin_unp = round(emi_principal - prin_pay, 2)
    max_loan = calc_max_loan(max(savings, 0), rate, months)

    if savings <= 0:
        s, c = "red", "no_savings"
        mh = "Aapki amdani se kharcha hi pura nahi hota. Loan bilkul mat lein."
        me = "Income does not cover expenses. Do NOT take any loan."
        mb = "আপনার আয়ে খরচই পুরো হয় না। ঋণ একদম নেবেন না।"
    elif dscr < 1.0:
        s, c = "red", "emi_exceeds_savings"
        # Excel E15: "Loan uthana risky hai. Apki amdani se app bayaaj tak bhi nahi chuka payenge"
        mh = "Loan uthana risky hai. Apki amdani se aap bayaaj tak bhi nahi chuka payenge."
        me = "Taking a loan is risky. Your income cannot even cover the interest."
        mb = "ঋণ নেওয়া ঝুঁকিপূর্ণ। আপনার আয়ে সুদও দিতে পারবেন না।"
    elif foir > 50:
        s, c = "orange", "foir_high"
        mh = "EMI aapki amdani ka aadhe se zyaada hissa le legi. Aapki rozana ki zarooraton par asar padega."
        me = "EMI will consume over half your income. Day-to-day needs will be at risk."
        mb = "EMI আপনার আয়ের অর্ধেকেরও বেশি নেবে। প্রতিদিনের প্রয়োজন মেটানো কঠিন হবে।"
    elif prin_unp > 0 and int_unp <= 0:
        # Excel E16: can pay interest but not principal — ask "koi nayi amdani?"
        s, c = "orange", "interest_only"
        mh = "Apki amdani se aap byaaj hi bhar payenge. Mool kaise chukayenge? Koi nayi amdani ya paise aana hai kya?"
        me = "Your income can only cover the interest. How will you repay the principal? Any new income expected?"
        mb = "আপনার আয়ে শুধু সুদই দিতে পারবেন। মূল কিভাবে শোধ করবেন? নতুন আয় আসার সম্ভাবনা আছে?"
    elif dscr < 2.0:
        s, c = "orange", "emi_high"
        mh = "EMI aapki bachat ka zyaada hissa le legi. Dhyan se – koi bhi emergency mein phans sakte hain."
        me = "EMI takes most of your savings. Any emergency could trap you."
        mb = "EMI আপনার সঞ্চয়ের বড় অংশ নেবে। সাবধান — যেকোনো জরুরি অবস্থায় ফেঁসে যাবেন।"
    elif prin_unp > emi_principal * _PRINCIPAL_RISK_THRESHOLD:
        s, c = "orange", "principal_risk"
        mh = "Bayaaj to de payenge lekin mool chukana mushkil hoga. Thoda chota loan lein."
        me = "Interest is manageable but repaying principal is risky. Consider smaller amount."
        mb = "সুদ দিতে পারবেন কিন্তু মূল ফেরত দেওয়া কঠিন হবে। ছোট পরিমাণ বিবেচনা করুন।"
    else:
        # Excel E17: "Aap Loan le sakte hai"
        s, c = "green", "safe"
        mh = "Aap ye loan aaram se le sakte hain. Aapki bachat EMI se zyaada hai."
        me = "You can comfortably take this loan. Savings cover EMI well."
        mb = "আপনি এই ঋণ আরামে নিতে পারেন। আপনার সঞ্চয় EMI-এর চেয়ে বেশি।"

    return dict(
        income=income, expenses_total=round(expenses, 2),
        loan_amount=loan, emi_principal=emi_principal,
        interest_rate=rate, tenure_months=months,
        monthly_savings=round(savings, 2), emi=emi,
        after_emi_savings=after_emi_savings,
        total_interest=tot_int, monthly_interest=mon_int,
        total_payable=tot_pay, lti_ratio=lti,
        foir=foir, dscr=dscr,
        interest_payable=int_pay, interest_unpayable=int_unp,
        principal_payable=prin_pay, principal_unpayable=prin_unp,
        max_safe_loan=max_loan,
        status=s, conclusion=c, message_hi=mh, message_en=me, message_bn=mb
    )
