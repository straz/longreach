"""Regenerate observation fixture files from current observations.py output.

Run with: uv run python3 tests/regen_fixtures.py
Or:        make regen-fixtures
"""
from datetime import datetime
from pathlib import Path
import yaml
from models import Lead
from observations import make_observations

FIXTURES_DIR = Path(__file__).parent / "fixtures" / "observations"


def make_lead(**kwargs) -> Lead:
    defaults = dict(
        id=1,
        created_at=datetime(2026, 1, 1),
        name="Test User",
        email="test@example.com",
        lid="abc123",
    )
    return Lead(**(defaults | kwargs))


def regen():
    for path in sorted(FIXTURES_DIR.glob("*.md")):
        content = path.read_text()
        _, front, _ = content.split("---", 2)
        params = yaml.safe_load(front) or {}
        lead = make_lead(**params)
        path.write_text(f"---{front}---\n{make_observations(lead)}")
        print(f"Updated {path.name}")


if __name__ == "__main__":
    regen()
