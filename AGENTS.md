# AGENTS.md

Guide for AI coding agents and humans working **in this repository**. For
end-user library docs, see `docs/` and the [README](README.md).

`djsuperadmin` is a tiny Django app (no runtime dependencies except Django) that
lets superusers edit page contents inline in the browser. It works with Django
2.0 through the latest release (tested 2.2 → 6.0) on Python 3.6+, is MIT
licensed, and ships a small JS bundle (built with Vite) that injects
[CKEditor 4](https://ckeditor.com/) from a CDN for the WYSIWYG editor.

## Repository layout

| Path | What lives here |
| --- | --- |
| `djsuperadmin/` | The Django package (models, mixins, template tags, API view, urls). |
| `djsuperadmin/src/` | JS/SCSS source, built by Vite. |
| `djsuperadmin/dist/djsuperadmin.bundle.js` | The built bundle that gets injected into pages. **Generated — do not hand-edit.** |
| `example/` | Demo Django project; also the test project. Settings module: `example.djsuperadmin_example.settings`. |
| `tests/` | pytest + pytest-django suite. |
| `docs/` | VitePress documentation. |

Tooling: [uv](https://docs.astral.sh/uv/) for Python deps/venv, `pnpm` for the
JS build and docs.

## Dev commands

All wrapped as Makefile targets:

```bash
make install     # uv sync --dev && pnpm install
make test        # flake8 djsuperadmin, then pytest with coverage
make lint        # flake8 djsuperadmin
make format      # black .
make build       # pnpm run build -> rebuilds djsuperadmin/dist/djsuperadmin.bundle.js
make migrations  # uv run python manage.py makemigrations
make docs-dev    # VitePress dev server
make docs-build  # build docs
make docs-preview
```

## Run the example app

The example project doubles as the test project. Its settings module is
`example.djsuperadmin_example.settings`.

```bash
uv run python manage.py migrate
uv run python manage.py createsuperuser
uv run python manage.py runserver
```

Then log in at `/admin/` and open `/`. Editable contents only appear for
authenticated superusers.

## Frontend build

The browser code lives in `djsuperadmin/src/` and is bundled by Vite to
`djsuperadmin/dist/djsuperadmin.bundle.js`. **Rebuild after any change to
`djsuperadmin/src/`:**

```bash
make build   # or: pnpm run build
```

Commit the rebuilt bundle alongside the source change.

## Testing

Tests use pytest + pytest-django against the example settings and live in
`tests/`:

```bash
make test    # runs flake8 then pytest --cov
```

Keep the suite green across the whole supported Django matrix (2.2 → 6.0). CI
runs the matrix; if you touch template tags, the mixin, the API view, or models,
run the tests locally first.

## Conventions

- **Formatting:** `black` (`make format`).
- **Linting:** `flake8` on `djsuperadmin/` (`make lint`).
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/).
  Releases are cut by `python-semantic-release` from commit history, run via the
  manual **Release** GitHub Actions workflow (`workflow_dispatch`), which builds
  with uv and publishes to PyPI.

## How it works

The template tags render for superusers only. `{% superadmin_content obj attr %}`
(and the raw variant) emit an editable `<span class="djsuperadmin">` carrying the
object's `superadmin_get_url` and `superadmin_patch_url`. `{% djsuperadminjs %}`,
placed once in the footer, injects CKEditor and the bundle.

The bundle (`djsuperadmin/dist/djsuperadmin.bundle.js`) wires click handlers to
those spans, opens the CKEditor (or a raw textarea) editor, `GET`s the current
value as JSON `{"content": ...}`, and `PATCH`es the edited value back as
`{"content": ...}`.

Any model can expose those URLs by mixing in `DjSuperAdminMixin` and defining
`superadmin_get_url` / `superadmin_patch_url` (the mixin raises
`NotImplementedError` otherwise). The endpoint must serve `GET -> {"content": ...}`
and accept `PATCH {"content": ...}` to save. The bare-string tag form uses the
built-in `Content` model and `ContentApiView`, which requires
`djsuperadmin.urls` to be included in the project.

## Note

`CLAUDE.md` is a thin adapter that defers to this file. Keep guidance here.
