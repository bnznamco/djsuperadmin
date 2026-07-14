clean:
	@find . -name "*.pyc" | xargs rm -rf
	@find . -name "*.pyo" | xargs rm -rf
	@find . -name "__pycache__" -type d | xargs rm -rf
	@rm -rf .pytest_cache
	@rm -rf htmlcov
	@rm -rf .coverage*
	@rm -rf coverage.xml
	@rm -rf dist
	@rm -rf djsuperadmin.egg-info

install:
	uv sync --dev
	pnpm install

format:
	uv run black .

lint:
	uv run flake8 djsuperadmin

test: clean lint
	uv run pytest --cov=djsuperadmin -s --cov-report=xml --cov-report=term-missing

build:
	pnpm run build

migrations: clean
	uv run python manage.py makemigrations

docs-dev: clean
	bash scripts/sync-docs-from-root.sh
	pnpm run docs:dev

docs-build: clean
	bash scripts/sync-docs-from-root.sh
	pnpm run docs:build

docs-preview: clean
	pnpm run docs:preview

.PHONY: clean install format lint test build migrations docs-dev docs-build docs-preview
