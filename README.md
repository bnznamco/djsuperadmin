# DjSuperAdmin

[![PyPI version](https://img.shields.io/pypi/v/djsuperadmin?style=flat-square)](https://pypi.org/project/djsuperadmin/)
![Codecov](https://img.shields.io/codecov/c/github/lotrekagency/djsuperadmin?style=flat-square)
![CI status](https://img.shields.io/github/actions/workflow/status/lotrekagency/djsuperadmin/ci.yml?style=flat-square)
[![License](https://img.shields.io/github/license/lotrekagency/djsuperadmin?style=flat-square)](./LICENSE)

> ✍️ Edit contents directly on your page with Django

## Here's how it works

<img src="https://github.com/lotrekagency/djsuperadmin/raw/master/demo.gif" width="100%" alt="djsuperadmin demo" />

Superusers get an inline editor ([SunEditor](https://github.com/JiHong88/SunEditor),
lazy-loaded from a CDN on first edit) right on the rendered page. Everyone else just
sees the plain content.

## Compatibility

- **Django** 2.0 → latest (tested 2.2 → 6.0)
- **Python** 3.6+
- **Zero runtime dependencies** (other than Django itself)

## Installation

```bash
pip install djsuperadmin
# or
uv add djsuperadmin
```

## Setup

Add the app to `INSTALLED_APPS`:

```python
INSTALLED_APPS = [
    # ...
    "djsuperadmin",
]
```

Include the urls **only** if you use the built-in `Content` model (i.e. the bare-string
tag form shown below):

```python
from django.urls import path, include

urlpatterns = [
    # ...
    path("", include("djsuperadmin.urls")),
]
```

Finally, load the template tags and drop `{% djsuperadminjs %}` **once** in your footer.
It injects the djsuperadmin bundle (which lazy-loads SunEditor on first edit), and
renders **only** for authenticated superusers (empty string for everyone else):

```html
{% load djsuperadmintag %}

<!-- ... your page ... -->

{% djsuperadminjs %}
```

## Usage

### Simple (bare string)

Pass a default string. djsuperadmin stores it in its built-in `Content` model, keyed by a
hash of the text and auto-created on first render. Requires the urls to be included.

```html
{% load djsuperadmintag %}

{% superadmin_content 'Some default text' %}
```

### Raw content

Same as above but with a plain textarea editor (no WYSIWYG) — good for plain text or
snippets. Note the tag name is `superadmin_raw_content`:

```html
{% superadmin_raw_content 'Some default text' %}
```

### Bind to a model attribute

Both tags also accept an object and an attribute name. Superusers see an editable
element (a `<div class="djsuperadmin">` for WYSIWYG, a `<span>` for raw), everyone
else sees the plain value:

```html
{% superadmin_content my_object 'body' %}
{% superadmin_raw_content my_object 'body' %}
```

### Advanced: your own content model + endpoint

Mix in `DjSuperAdminMixin` and expose a GET/PATCH endpoint. The mixin raises
`NotImplementedError` if the two url properties are not defined.

```python
from django.db import models
from djsuperadmin.mixins import DjSuperAdminMixin


class MyContent(models.Model, DjSuperAdminMixin):
    body = models.TextField()

    @property
    def superadmin_get_url(self):
        return f"/api/mycontent/{self.pk}"

    @property
    def superadmin_patch_url(self):
        return f"/api/mycontent/{self.pk}"
```

Your endpoint must:

- `GET` → return JSON `{"content": <value>}`
- `PATCH` with body `{"content": <value>}` → save it

Then render it like any other object:

```html
{% superadmin_content my_content 'body' %}
```

## Settings

```python
DJSUPERADMIN = {"INPLACE_EDIT": True}
```

When `INPLACE_EDIT` is `True`, contents are edited **right on the page** instead of in a
modal: raw contents via `contenteditable`, and WYSIWYG contents via an inline SunEditor
(its toolbar docks above the content while editing; click the toolbar's save button to
commit, or press <kbd>Esc</kbd> to cancel). Defaults to `False` (modal editing).

### Version history / revert

Every save keeps the previous value. Hovering an editable content shows a toolbar
(✏️ edit + **⟲ history**); the history icon lists past versions (timestamp + preview)
and clicking one restores it — reverting is itself an undoable save. Works out of the box for the built-in `Content` model (capped by
`MAX_VERSIONS`, default 20). Your own models opt in by exposing a
`superadmin_history_url` — see the [docs](https://lotrekagency.github.io/djsuperadmin/).

```python
DJSUPERADMIN = {"INPLACE_EDIT": True, "MAX_VERSIONS": 20}
```

### Insert images from a media gallery

Point `IMAGE_GALLERY_URL` at an endpoint that returns
`{"result": [{"src": "...", "name": "..."}, ...]}` and the WYSIWYG toolbar gains an
"insert image from gallery" button. This is designed to plug into a CMS media
library — e.g. [camomilla](https://github.com/camomillacms/camomilla-core)'s media
gallery. `IMAGE_UPLOAD_URL` (optional) enables direct uploads.

```python
DJSUPERADMIN = {
    "INPLACE_EDIT": True,
    "IMAGE_GALLERY_URL": "/api/camomilla/media/",  # returns the media list as JSON
}
```

The WYSIWYG editor (SunEditor) is lazy-loaded from jsDelivr. To self-host it — e.g.
under a strict Content-Security-Policy — override the URLs:

```python
DJSUPERADMIN = {
    "SUNEDITOR_JS": "/static/vendor/suneditor.min.js",
    "SUNEDITOR_CSS": "/static/vendor/suneditor.min.css",
}
```

## Development

Contributions welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md). Tooling is
[uv](https://github.com/astral-sh/uv) (Python) + [pnpm](https://pnpm.io/) (JS build & docs),
with the frontend bundle built by Vite.

```bash
make install      # uv sync --dev && pnpm install
make test         # flake8 + pytest with coverage
make format       # black .
make lint         # flake8 djsuperadmin
make build        # rebuild djsuperadmin/dist/djsuperadmin.bundle.js
make migrations   # uv run python manage.py makemigrations
make docs-dev     # VitePress docs (also: docs-build, docs-preview)
```

Run the demo / test project (`example/`, settings module
`example.djsuperadmin_example.settings`):

```bash
uv run python manage.py migrate
uv run python manage.py createsuperuser
uv run python manage.py runserver   # log in at /admin/, then open /
```

## Documentation

Full docs: <https://lotrekagency.github.io/djsuperadmin/>

---

MIT licensed, by [Lotrèk](https://www.lotrek.it/).
