"""
DARAS backend regression tests.
Covers: HTML pages, user APIs (register / calculate / calculate_max / event / question),
admin auth, admin data endpoints.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:5001").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_USER = "daras_admin"
ADMIN_PASS = "Daras@2024"


@pytest.fixture(scope="session")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


@pytest.fixture(scope="session")
def admin_token(s):
    r = s.post(f"{API}/admin/auth/login", json={"username": ADMIN_USER, "password": ADMIN_PASS})
    assert r.status_code == 200, r.text
    tok = r.json().get("token")
    assert tok
    return tok


@pytest.fixture(scope="session")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


# ─── HTML pages ──────────────────────────────────────────────────────────────
class TestPages:
    def test_user_page_loads(self, s):
        r = s.get(f"{API}/")
        assert r.status_code == 200
        assert "text/html" in r.headers.get("content-type", "")
        assert "दारस" in r.text  # brand marker

    def test_admin_panel_loads(self, s):
        r = s.get(f"{API}/admin/panel")
        assert r.status_code == 200, f"admin panel returned {r.status_code}: {r.text[:200]}"
        assert "text/html" in r.headers.get("content-type", "")


# ─── User APIs ───────────────────────────────────────────────────────────────
class TestUserRegister:
    def test_register_success(self, s):
        r = s.post(f"{API}/user/register", json={
            "name": "TEST_Ravi",
            "age": 32,
            "mobile": "9999999999",
            "vocation": "driver",
            "language": "hi",
        })
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("success") is True
        assert isinstance(d.get("user_id"), int)
        assert isinstance(d.get("session_id"), str) and len(d["session_id"]) > 10

    def test_register_empty_name_rejected(self, s):
        r = s.post(f"{API}/user/register", json={"name": "", "vocation": "other"})
        assert r.status_code == 400
        assert "error" in r.json()


@pytest.fixture(scope="class")
def user_id(s):
    r = s.post(f"{API}/user/register", json={
        "name": "TEST_Calc_User", "age": 30, "mobile": "8888888888",
        "vocation": "shopkeeper", "language": "hi"
    })
    return r.json()["user_id"]


class TestCalculate:
    def test_green_scenario(self, s, user_id):
        r = s.post(f"{API}/user/calculate", json={
            "user_id": user_id,
            "loan_type": "existing",
            "loan_amount": 50000,
            "interest_rate": 12,
            "tenure_months": 24,
            "income": 60000, "rent": 8000, "grocery": 5000,
            "medicine": 1000, "education": 2000, "mobile_bill": 500,
            "gaon": 1000, "other_expenses": 2000,
            "loan_remaining": 50000,
        })
        assert r.status_code == 200
        d = r.json()
        assert d["status"] == "green"
        assert d["emi"] > 0
        assert d["monthly_savings"] > 0
        assert d["max_safe_loan"] > 0
        assert "message_hi" in d and "message_bn" in d and "message_en" in d
        assert "payoff_months_at_surplus" in d

    def test_red_scenario_no_savings(self, s, user_id):
        r = s.post(f"{API}/user/calculate", json={
            "user_id": user_id, "loan_type": "existing",
            "loan_amount": 100000, "interest_rate": 24, "tenure_months": 12,
            "income": 10000, "rent": 5000, "grocery": 4000,
            "medicine": 500, "education": 0, "mobile_bill": 300,
            "gaon": 500, "other_expenses": 1000,
            "loan_remaining": 100000,
        })
        assert r.status_code == 200
        d = r.json()
        assert d["status"] == "red"
        assert d["monthly_savings"] <= 0

    def test_orange_scenario(self, s, user_id):
        # Make EMI > 60% of savings but <= savings
        r = s.post(f"{API}/user/calculate", json={
            "user_id": user_id, "loan_type": "existing",
            "loan_amount": 200000, "interest_rate": 18, "tenure_months": 24,
            "income": 30000, "rent": 5000, "grocery": 4000,
            "medicine": 500, "education": 1000, "mobile_bill": 500,
            "gaon": 1000, "other_expenses": 1000,
            "loan_remaining": 200000,
        })
        assert r.status_code == 200
        d = r.json()
        assert d["status"] in ("orange", "red")  # depends on math

    def test_bengali_message_present(self, s, user_id):
        r = s.post(f"{API}/user/calculate", json={
            "user_id": user_id, "loan_type": "existing",
            "loan_amount": 30000, "interest_rate": 10, "tenure_months": 24,
            "income": 50000, "rent": 5000, "grocery": 3000,
            "medicine": 500, "education": 1000, "mobile_bill": 300,
            "gaon": 500, "other_expenses": 500,
        })
        d = r.json()
        assert d["status"] == "green"
        # green Bengali fragment
        assert "আরামে" in d["message_bn"]


class TestCalculateMax:
    def test_calculate_max(self, s):
        r = s.post(f"{API}/user/calculate_max", json={
            "monthly_savings": 5000, "interest_rate": 12, "tenure_months": 24,
        })
        assert r.status_code == 200
        d = r.json()
        assert d["max_safe_loan"] > 0
        assert d["emi_per_lakh"] > 0


class TestEventAndQuestion:
    def test_event(self, s, user_id):
        r = s.post(f"{API}/user/event", json={
            "user_id": user_id, "event": "page_view", "meta": {"screen": "welcome"}
        })
        assert r.status_code == 200
        assert r.json().get("ok") is True

    def test_question_ok(self, s, user_id):
        r = s.post(f"{API}/user/question", json={
            "user_id": user_id, "question": "TEST_kya yeh sahi hai?", "context": {}
        })
        assert r.status_code == 200
        assert r.json().get("ok") is True

    def test_question_empty_rejected(self, s, user_id):
        r = s.post(f"{API}/user/question", json={"user_id": user_id, "question": ""})
        assert r.status_code == 400


# ─── Admin auth + data ───────────────────────────────────────────────────────
class TestAdminAuth:
    def test_login_success(self, s):
        r = s.post(f"{API}/admin/auth/login", json={"username": ADMIN_USER, "password": ADMIN_PASS})
        assert r.status_code == 200
        d = r.json()
        assert "token" in d and len(d["token"]) > 20
        assert "expires" in d
        assert d.get("role") == "superadmin"

    def test_login_wrong_password(self, s):
        r = s.post(f"{API}/admin/auth/login", json={"username": ADMIN_USER, "password": "wrong"})
        assert r.status_code == 401

    def test_dashboard_no_token(self, s):
        r = requests.get(f"{API}/admin/dashboard")
        assert r.status_code == 401

    def test_dashboard_invalid_token(self):
        r = requests.get(f"{API}/admin/dashboard", headers={"Authorization": "Bearer invalid"})
        assert r.status_code == 401


class TestAdminData:
    def test_dashboard(self, auth_headers):
        r = requests.get(f"{API}/admin/dashboard", headers=auth_headers)
        assert r.status_code == 200
        d = r.json()
        for k in ("total_users", "total_assessments", "status_distribution", "recent_assessments"):
            assert k in d

    def test_users(self, auth_headers):
        r = requests.get(f"{API}/admin/users", headers=auth_headers)
        assert r.status_code == 200
        assert "users" in r.json()

    def test_assessments(self, auth_headers):
        r = requests.get(f"{API}/admin/assessments", headers=auth_headers)
        assert r.status_code == 200
        assert "assessments" in r.json()

    def test_research(self, auth_headers):
        r = requests.get(f"{API}/admin/research", headers=auth_headers)
        assert r.status_code == 200
        assert "vocation_breakdown" in r.json()

    def test_questions(self, auth_headers):
        r = requests.get(f"{API}/admin/questions", headers=auth_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)
