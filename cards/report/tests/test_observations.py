from datetime import datetime
from pathlib import Path
import pytest
import yaml
from models import Lead
from observations import make_observations

FIXTURES_DIR = Path(__file__).parent / "fixtures" / "observations"


def parse_fixture(path: Path) -> tuple[dict, str]:
    """Split YAML frontmatter and markdown body from a fixture file."""
    content = path.read_text()
    _, front, body = content.split("---", 2)
    return yaml.safe_load(front) or {}, body.lstrip("\n")


def make_lead(**kwargs) -> Lead:
    defaults = dict(
        id=1,
        created_at=datetime(2026, 1, 1),
        name="Test User",
        email="test@example.com",
        lid="abc123",
    )
    return Lead(**(defaults | kwargs))


@pytest.mark.parametrize("fixture_path", sorted(FIXTURES_DIR.glob("*.md")), ids=lambda p: p.stem)
def test_observation_fixture(fixture_path: Path):
    params, expected = parse_fixture(fixture_path)
    lead = make_lead(**params)
    assert make_observations(lead) == expected
