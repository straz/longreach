# /// script
# requires-python = ">=3.14"
# dependencies = ["requests"]
# ///

import requests
import sys

BASE_URL = "https://longreach--report-output-fastapi-app.modal.run"

TEST_ID = '54044df563'

def main() -> None:
    lid = TEST_ID

    url = f"{BASE_URL}/report/{lid}"
    result = requests.get(url)
    result.raise_for_status()
    print(result.json()['report'])


if __name__ == "__main__":
    main()
