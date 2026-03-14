.PHONY: test regen-fixtures

test:
	uv run pytest

regen-fixtures:
	PYTHONPATH=. uv run python3 tests/regen_fixtures.py
