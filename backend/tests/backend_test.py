"""Backend tests for Thay Nail Designer API."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://nails-admin-build.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"
ADMIN_PASSWORD = "1611"


@pytest.fixture(scope="session")
def token():
    r = requests.post(f"{API}/auth/login", json={"password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="session")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# ---------- Auth ----------
class TestAuth:
    def test_login_wrong_password(self):
        r = requests.post(f"{API}/auth/login", json={"password": "wrong"}, timeout=15)
        assert r.status_code == 401

    def test_login_correct(self):
        r = requests.post(f"{API}/auth/login", json={"password": ADMIN_PASSWORD}, timeout=15)
        assert r.status_code == 200
        assert "token" in r.json()

    def test_auth_check_ok(self, auth_headers):
        r = requests.get(f"{API}/auth/check", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        assert r.json().get("ok") is True

    def test_auth_check_no_token(self):
        r = requests.get(f"{API}/auth/check", timeout=15)
        assert r.status_code == 401


# ---------- Services ----------
class TestServices:
    def test_list_services_seeded(self):
        r = requests.get(f"{API}/services", timeout=15)
        assert r.status_code == 200
        services = r.json()
        assert len(services) >= 5
        names = {s["name"] for s in services}
        for expected in ["Unhas de Gel", "Fibra de Vidro", "Molde F1", "Banho de Gel", "Gel na Tips"]:
            assert expected in names, f"missing seeded service {expected}"

    def test_create_service_unauth(self):
        r = requests.post(f"{API}/services", json={"name": "x", "description": "y", "price": 1}, timeout=15)
        assert r.status_code == 401

    def test_service_crud_flow(self, auth_headers):
        payload = {"name": "TEST_Service", "description": "testing", "price": 99.5, "duration_minutes": 60, "image": ""}
        r = requests.post(f"{API}/services", json=payload, headers=auth_headers, timeout=15)
        assert r.status_code == 201, r.text
        created = r.json()
        sid = created["id"]
        assert created["name"] == "TEST_Service"
        assert created["price"] == 99.5

        # verify in list
        listed = requests.get(f"{API}/services", timeout=15).json()
        assert any(s["id"] == sid for s in listed)

        # update
        payload["price"] = 111.0
        r = requests.put(f"{API}/services/{sid}", json=payload, headers=auth_headers, timeout=15)
        assert r.status_code == 200
        assert r.json()["price"] == 111.0

        # delete
        r = requests.delete(f"{API}/services/{sid}", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        listed = requests.get(f"{API}/services", timeout=15).json()
        assert not any(s["id"] == sid for s in listed)


# ---------- Work Days ----------
class TestWorkDays:
    def test_list_workdays(self):
        r = requests.get(f"{API}/work-days", timeout=15)
        assert r.status_code == 200
        days = r.json()
        assert len(days) == 7

    def test_update_workday_unauth(self):
        r = requests.put(f"{API}/work-days/1", json={"active": True, "opening_time": "09:00", "closing_time": "12:00"}, timeout=15)
        assert r.status_code == 401

    def test_update_monday_then_revert(self, auth_headers):
        # save original
        original = next(d for d in requests.get(f"{API}/work-days", timeout=15).json() if d["day"] == 1)

        r = requests.put(f"{API}/work-days/1",
                         json={"active": True, "opening_time": "09:00", "closing_time": "12:00"},
                         headers=auth_headers, timeout=15)
        assert r.status_code == 200
        got = r.json()
        assert got["active"] is True
        assert got["opening_time"] == "09:00"
        assert got["closing_time"] == "12:00"

        # revert
        r = requests.put(f"{API}/work-days/1",
                         json={"active": original["active"], "opening_time": original["opening_time"], "closing_time": original["closing_time"]},
                         headers=auth_headers, timeout=15)
        assert r.status_code == 200

    def test_update_workday_invalid_times(self, auth_headers):
        r = requests.put(f"{API}/work-days/1",
                         json={"active": True, "opening_time": "18:00", "closing_time": "09:00"},
                         headers=auth_headers, timeout=15)
        assert r.status_code == 400


# ---------- Blocked slots ----------
class TestBlockedSlots:
    def test_list_blocked(self):
        r = requests.get(f"{API}/blocked-slots", timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_create_block_unauth(self):
        r = requests.post(f"{API}/blocked-slots", json={"date": "2030-01-01"}, timeout=15)
        assert r.status_code == 401

    def test_block_create_delete(self, auth_headers):
        r = requests.post(f"{API}/blocked-slots", json={"date": "2030-12-31"},
                          headers=auth_headers, timeout=15)
        assert r.status_code == 201
        bid = r.json()["id"]
        r = requests.delete(f"{API}/blocked-slots/{bid}", headers=auth_headers, timeout=15)
        assert r.status_code == 200


# ---------- Appointments ----------
class TestAppointments:
    def test_booked_public(self):
        r = requests.get(f"{API}/appointments/booked", timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_list_appointments_unauth(self):
        r = requests.get(f"{API}/appointments", timeout=15)
        assert r.status_code == 401

    def test_create_appointment_and_duplicate(self, auth_headers):
        appt = {"name": "TEST_Client", "phone": "11999999999", "service": "Unhas de Gel",
                "date": "2035-06-14", "time": "10:00"}
        r = requests.post(f"{API}/appointments", json=appt, timeout=15)
        assert r.status_code == 201, r.text
        # duplicate
        r2 = requests.post(f"{API}/appointments", json=appt, timeout=15)
        assert r2.status_code == 409

    def test_list_appointments_auth(self, auth_headers):
        r = requests.get(f"{API}/appointments", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)
