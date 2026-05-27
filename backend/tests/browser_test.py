"""
Browser-level tests for DARAS front-end flows using Playwright.

Tests are skipped (with a clear install message) if playwright is not present.
Install once with:
    venv/bin/pip install pytest-playwright
    venv/bin/playwright install chromium

Then run all tests together:
    venv/bin/pytest tests/backend_test.py tests/browser_test.py -v

The shared `server` fixture in conftest.py starts one isolated uvicorn process
for the whole session — API tests and browser tests hit the same DB.
"""
import json

import pytest
import requests

# Skip entire module if playwright or pytest-playwright is not installed.
# Both are required: playwright for the browser bindings, pytest-playwright for
# the `page` fixture.  Checking only `playwright` lets collection pass when
# pytest-playwright is absent, which causes a confusing "fixture 'page' not found"
# error at run time rather than a clean skip.
_skip_reason = (
    "playwright / pytest-playwright not installed — run:\n"
    "  venv/bin/pip install pytest-playwright\n"
    "  venv/bin/playwright install chromium"
)
pytest.importorskip("playwright",       reason=_skip_reason)
pytest.importorskip("pytest_playwright", reason=_skip_reason)

from tests.test_config import BASE_URL, API  # noqa: E402  (import after importorskip guard)


# ── Admin helper fixture ──────────────────────────────────────────────────────

@pytest.fixture()
def admin_page(page, admin_token):
    """Return a Playwright page already authenticated as admin.

    Injects the token into localStorage before reload so the page's
    window.load handler picks it up and skips the login screen.
    """
    page.goto(f"{BASE_URL}/api/admin/panel")
    page.evaluate("(tok) => localStorage.setItem('daras_token', tok)", admin_token)
    page.reload()
    # #app transitions from display:none to display:block once auth/me succeeds
    page.wait_for_selector("#app", state="visible", timeout=8000)
    return page


# ── 1. Admin modal: mobile_last4, never "undefined" ──────────────────────────

class TestAdminModal:
    def test_modal_shows_mobile_last4_not_undefined(self, admin_page, s):
        # Seed a user with a known mobile so last-4 is predictable
        r = s.post(f"{API}/user/register", json={
            "name": "ModalBrowserTest", "age": 35, "mobile": "6611111111",
            "vocation": "driver", "language": "hi", "force_new": True,
        })
        assert r.status_code == 200
        uid = r.json()["user_id"]

        # Navigate to Users tab and wait for our row
        admin_page.click("#nav-users")
        admin_page.wait_for_selector(f"button[data-uid='{uid}']", timeout=8000)
        admin_page.click(f"button[data-uid='{uid}']")
        admin_page.wait_for_selector("#user-modal.show", timeout=5000)

        # Locate the "Mobile (last 4)" detail item and read its value cell
        mobile_item = admin_page.locator(".detail-item").filter(
            has=admin_page.locator(".dl", has_text="Mobile (last 4)")
        )
        value = mobile_item.locator(".dv").text_content().strip()

        # Core regression: the field must never render the JS string "undefined"
        assert "undefined" not in value, f"Modal rendered 'undefined' for mobile: {value!r}"
        # Positive check: last 4 of 6611111111 is 1111
        assert value == "1111", f"Expected '1111' (last 4 digits), got {value!r}"
        # Privacy guard: never more than 4 digits shown
        assert len([c for c in value if c.isdigit()]) <= 4


# ── 2. CSV export: fetch carries Authorization header ────────────────────────

class TestCSVExport:
    def test_csv_uses_bearer_auth_and_downloads(self, admin_page, admin_token):
        captured = {}

        def intercept(route):
            # Playwright lowercases header names
            captured["authorization"] = route.request.headers.get("authorization", "")
            route.continue_()

        admin_page.route("**/api/admin/export/csv", intercept)

        # Research page hosts the export button (rendered by loadResearch())
        admin_page.click("#nav-research")
        admin_page.wait_for_selector(".export-btn", state="visible", timeout=10000)

        with admin_page.expect_download(timeout=10000) as dl_info:
            admin_page.click(".export-btn")

        dl = dl_info.value
        assert dl.suggested_filename == "daras_export.csv", (
            f"Expected filename 'daras_export.csv', got {dl.suggested_filename!r}"
        )
        # Verify the fetch — not a plain anchor — sent the bearer token
        assert captured.get("authorization") == f"Bearer {admin_token}", (
            f"Authorization header missing or wrong: {captured.get('authorization')!r}\n"
            "This means the export button fell back to a bare <a> link without auth."
        )


# ── 3. Duplicate profile selection: S.userId and localStorage populated ──────

class TestDuplicateProfileSelection:
    def test_resume_profile_sets_js_state_and_localstorage(self, page, s):
        mobile = "5599887711"
        r = s.post(f"{API}/user/register", json={
            "name": "DupBrowserTest", "age": 30, "mobile": mobile,
            "vocation": "driver", "language": "hi", "force_new": True,
        })
        assert r.status_code == 200
        expected_uid = r.json()["user_id"]
        expected_sid = r.json()["session_id"]

        page.goto(f"{BASE_URL}/")
        page.fill("#in-name", "DupBrowserTest")
        page.fill("#in-age", "30")
        page.fill("#in-mobile", mobile)
        page.click('[data-testid="vocation-driver"]')
        page.click("#btn-register")

        # Backend returns {exists: true} → profile selection panel appears
        page.wait_for_selector("#profile-selection", state="visible", timeout=8000)
        assert page.locator(".profile-card").count() >= 1, "No profile cards rendered"

        # Click Resume on the first card
        page.locator(".profile-card").first().locator(".profile-select").click()

        # Panel closes and app navigates to s-existing
        page.wait_for_selector("#profile-selection", state="hidden", timeout=5000)
        page.wait_for_selector("#s-existing.on", timeout=5000)

        # Verify in-memory JS state (window.S exposed for dev introspection)
        assert page.evaluate("window.S.userId") == expected_uid, (
            "S.userId not set after profile resume"
        )
        assert page.evaluate("window.S.sessionId") == expected_sid, (
            "S.sessionId not set after profile resume"
        )

        # go() calls saveState() — localStorage must reflect the selected profile
        raw = page.evaluate("localStorage.getItem('daras-v3-state')")
        assert raw is not None, "saveState() did not write to localStorage after profile selection"
        state = json.loads(raw)
        assert state["userId"] == expected_uid, (
            f"localStorage userId={state['userId']!r}, expected {expected_uid!r}"
        )
        assert state["sessionId"] == expected_sid, (
            f"localStorage sessionId={state['sessionId']!r}, expected {expected_sid!r}"
        )


# ── 4. Profile delete: DELETE body contains session_id ───────────────────────

class TestProfileDelete:
    def test_delete_request_carries_session_id(self, page, s):
        mobile = "4422115566"
        r = s.post(f"{API}/user/register", json={
            "name": "DelBrowserTest", "age": 25, "mobile": mobile,
            "vocation": "security", "language": "hi", "force_new": True,
        })
        assert r.status_code == 200
        uid = r.json()["user_id"]
        sid = r.json()["session_id"]

        captured = {}

        def intercept_delete(route):
            captured["body"]   = route.request.post_data
            captured["method"] = route.request.method
            route.continue_()

        page.route(f"**/api/user/profile/{uid}", intercept_delete)

        page.goto(f"{BASE_URL}/")
        page.fill("#in-name", "DelBrowserTest")
        page.fill("#in-age", "25")
        page.fill("#in-mobile", mobile)
        page.click('[data-testid="vocation-security"]')
        page.click("#btn-register")

        page.wait_for_selector("#profile-selection", state="visible", timeout=8000)

        card = page.locator(".profile-card").first()
        card.locator(".profile-del-btn").click()   # reveal confirm buttons
        card.locator(".pc-yes").click()             # confirm delete

        # Card removed from DOM after successful DELETE + res.ok check
        page.wait_for_selector(".profile-card", state="hidden", timeout=5000)

        # Verify the DELETE was intercepted and body contained session_id
        assert captured.get("method") == "DELETE", "Expected a DELETE request"
        assert captured.get("body") is not None, "DELETE request body was empty"
        delete_body = json.loads(captured["body"])
        assert delete_body.get("session_id") == sid, (
            f"DELETE body session_id={delete_body.get('session_id')!r}, expected {sid!r}\n"
            "Backend requires session_id to authorise user-initiated deletes."
        )


# ── 5. localStorage resume: welcome screen bypassed ─────────────────────────

class TestLocalStorageResume:
    def test_resume_bypasses_welcome_and_restores_state(self, page, s):
        r = s.post(f"{API}/user/register", json={
            "name": "ResumeTest", "age": 40, "mobile": "3311223344",
            "vocation": "driver", "language": "hi", "force_new": True,
        })
        assert r.status_code == 200
        uid = r.json()["user_id"]
        sid = r.json()["session_id"]

        # Snapshot that restoreState() will accept: userId set + history past welcome
        snap = {
            "userId":          uid,
            "sessionId":       sid,
            "name":            "ResumeTest",
            "age":             40,
            "mobile":          "3344",
            "vocation":        "driver",
            "vocationCustom":  "",
            "householdSize":   None,
            "employmentType":  None,
            "hasBankAccount":  None,
            "loanType":        None,
            "existing":        {"amount": 0, "purpose": "", "source": "", "rate": 0,
                                "remaining": 0, "monthly_emi": 0},
            "branch":          None,
            "income":          0,
            "expenses":        {},
            "tenure":          12,
            "lastResult":      None,
            "paceMonths":      24,
            "newLoan":         {"amount": 0, "purpose": "", "rate": 0, "source": "",
                                "spoken": ""},
            "history":         ["s-welcome", "s-register", "s-existing"],
        }

        # Inject state before page load so restoreState() sees it during init
        page.goto(f"{BASE_URL}/")
        page.evaluate(
            "(snap) => localStorage.setItem('daras-v3-state', JSON.stringify(snap))",
            snap,
        )
        page.reload()

        # restoreState() should call go("s-existing") — welcome must not be active
        page.wait_for_selector("#s-existing.on", timeout=5000)
        welcome_has_on = page.evaluate(
            "document.getElementById('s-welcome').classList.contains('on')"
        )
        assert not welcome_has_on, "#s-welcome.on is still active — restoreState() did not run"

        # Restored JS state must match the injected snapshot
        assert page.evaluate("window.S.userId")    == uid,          "S.userId not restored"
        assert page.evaluate("window.S.sessionId") == sid,          "S.sessionId not restored"
        assert page.evaluate("window.S.name")      == "ResumeTest", "S.name not restored"
