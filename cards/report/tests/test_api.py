import requests

BASE_URL = "https://longreach--report-output-fastapi-app.modal.run"


# This should be an actual LID in the leads table on supabase
# See https://supabase.com/dashboard/project/astvrwkwhpckcyqqdotu/editor/19067?schema=public
TEST_LID = "7e8790c363"


def test_get_report():
    response = requests.get(f"{BASE_URL}/report/{TEST_LID}")
    response.raise_for_status()
    data = response.json()
    assert data["success"] is True
    assert data["report"]


def test_get_report_not_found():
    response = requests.get(f"{BASE_URL}/report/doesnotexist")
    response.raise_for_status()
    data = response.json()
    assert data["success"] is False
    assert data["error"]
