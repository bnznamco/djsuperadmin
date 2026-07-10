# How to

Practical recipes for the everyday uses of DjSuperAdmin. Every template needs
the tag library loaded once at the top:

```html
{% load djsuperadmintag %}
```

And every page that should be editable needs the JS injected once in the footer —
see [The `{% djsuperadminjs %}` tag](#the-djsuperadminjs-tag) at the bottom.

## Bare-string content (built-in Content model)

The one-argument form of `superadmin_content` uses DjSuperAdmin's **built-in
`Content` model**. You pass a default string; it is keyed by a hash of that
string and auto-created the first time the page renders. No model of your own,
no migration to write.

```html
{% load djsuperadmintag %}

<h1>{% superadmin_content 'Welcome to our site' %}</h1>
```

There is a raw variant that gives a plain textarea instead of the WYSIWYG editor:

```html
<p>{% superadmin_raw_content 'A short plain-text tagline' %}</p>
```

::: warning The tag is `superadmin_raw_content`
Not `superadmin_content_raw`. Mind the word order.
:::

Because this form is backed by the built-in model and its API view, you **must
include the DjSuperAdmin URLs** in your project's `urls.py`:

```python
from django.urls import path, include

urlpatterns = [
    # ...
    path('', include('djsuperadmin.urls')),
]
```

Without those URLs the editor has no endpoint to read from or save to. (The URLs
are only required for the bare-string form and the built-in model — the
model-field form below does not need them.)

## Editing a model field

The two-argument form binds the editor to `obj.<attribute>` on an object you
already have in the template context. This is the common case: an editable field
on one of your own models.

```html
{% load djsuperadmintag %}

<article>
  <h1>{% superadmin_content page 'title' %}</h1>
  <div>{% superadmin_content page 'body' %}</div>
</article>
```

Superusers see an editable `<span class="djsuperadmin">…</span>`; everyone else
sees the plain field value.

For a WYSIWYG (CKEditor) editor use `superadmin_content`. For a plain textarea —
good for snippets, code, or anything where you don't want markup — use the raw
variant:

```html
<pre>{% superadmin_raw_content page 'code_snippet' %}</pre>
```

Note that for the model-field form to actually save, your model must expose the
`superadmin_get_url` / `superadmin_patch_url` properties via the
`DjSuperAdminMixin` — see [Bring your own content model](#bring-your-own-content-model).

## In-place editing

By default, **raw** contents open in a small modal for editing. Set the
`INPLACE_EDIT` option to edit them directly on the page via `contenteditable`
instead:

```python
# settings.py
DJSUPERADMIN = {"INPLACE_EDIT": True}
```

The default is `False`. This affects raw contents (`superadmin_raw_content`);
the WYSIWYG editor always uses its own overlay.

## Bring your own content model

You don't have to use the built-in `Content` model. Any of your models can be
made editable by mixing in `DjSuperAdminMixin` and pointing it at your own API
endpoint.

The mixin requires two properties — `superadmin_get_url` and
`superadmin_patch_url`. If they are not defined, the mixin raises
`NotImplementedError`.

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

Use it in a template exactly like any other model field:

```html
{% load djsuperadmintag %}

<div>{% superadmin_content mycontent 'body' %}</div>
```

Now provide the endpoint those two URLs point at. The contract is minimal — no
DRF required:

- **GET** returns JSON `{"content": <value>}`.
- **PATCH** receives a body of `{"content": <value>}` and saves it.

```python
import json

from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views import View

from .models import MyContent


class MyContentApiView(View):
    def get(self, request, pk):
        obj = get_object_or_404(MyContent, pk=pk)
        return JsonResponse({"content": obj.body})

    def patch(self, request, pk):
        obj = get_object_or_404(MyContent, pk=pk)
        payload = json.loads(request.body)
        obj.body = payload["content"]
        obj.save()
        return JsonResponse({"content": obj.body})
```

```python
# urls.py
from django.urls import path

from .views import MyContentApiView

urlpatterns = [
    path("api/mycontent/<int:pk>", MyContentApiView.as_view()),
]
```

That's the whole contract. As long as GET returns `{"content": …}` and PATCH
accepts `{"content": …}`, the editor works against your model.

## The `{% djsuperadminjs %}` tag

This tag wires everything together. Place it **once**, in your page footer:

```html
{% load djsuperadmintag %}

<body>
  <!-- your page … -->

  {% djsuperadminjs %}
</body>
```

It injects **CKEditor 4 (loaded from a CDN)** plus the DjSuperAdmin JS bundle
that turns the wrapped spans into editors.

It renders **only for authenticated superusers** — for every other visitor
(anonymous users, non-superuser staff) it outputs an empty string, so there is
no extra markup or JS on public page loads. You can leave it in your base
template unconditionally.
