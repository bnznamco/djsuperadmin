import pytest

from djsuperadmin.templatetags.djsuperadmintag import (
    djsuperadminjs,
    superadmin_content,
    superadmin_raw_content,
)
from example.website.models import Content, ContentWithoutUrls

pytestmark = pytest.mark.django_db


def test_content_rendering_admin_user(rf, admin_user):
    content = Content.objects.create(identifier="1", content="Try")
    request = rf.get("/")
    request.user = admin_user
    expected_html = '<div class="djsuperadmin" data-djsa-mode="1" data-djsa-id="1" data-djsa-getcontenturl="/api/content" data-djsa-patchcontenturl="/api/content">Try</div>'
    assert superadmin_content({"request": request}, content, "content") == expected_html


def test_content_rendering_simple_user(rf, django_user_model):
    user = django_user_model.objects.create(username="someone", password="something")
    content = Content.objects.create(identifier="1", content="Try")
    request = rf.get("/")
    request.user = user
    assert superadmin_content({"request": request}, content, "content") == "Try"


def test_content_raw_rendering_admin_user(rf, admin_user):
    content = Content.objects.create(identifier="1", content="Try")
    request = rf.get("/")
    request.user = admin_user
    expected_html = '<span class="djsuperadmin" data-djsa-mode="0" data-djsa-id="1" data-djsa-getcontenturl="/api/content" data-djsa-patchcontenturl="/api/content">Try</span>'
    assert (
        superadmin_raw_content({"request": request}, content, "content")
        == expected_html
    )


def test_content_raw_rendering_simple_user(rf, django_user_model):
    user = django_user_model.objects.create(username="someone", password="something")
    content = Content.objects.create(identifier="1", content="Try")
    request = rf.get("/")
    request.user = user
    assert superadmin_raw_content({"request": request}, content, "content") == "Try"


def test_djsuperadminjs_rendering_admin_user(rf, admin_user):
    request = rf.get("/")
    request.user = admin_user
    output = djsuperadminjs({"request": request})
    assert "<script>" in output
    assert "inplace_edit_enabled" in output
    assert "djsa_suneditor_js" in output


def test_djsuperadminjs_rendering_simple_user(rf, django_user_model):
    user = django_user_model.objects.create(username="someone", password="something")
    request = rf.get("/")
    request.user = user
    assert "" == djsuperadminjs({"request": request})


def test_raise_exception_for_not_implemented_urls_in_model(rf, admin_user):
    content = ContentWithoutUrls.objects.create(identifier="1", content="Try")
    request = rf.get("/")
    request.user = admin_user
    with pytest.raises(NotImplementedError):
        content.superadmin_get_url
    with pytest.raises(NotImplementedError):
        content.superadmin_patch_url
    with pytest.raises(NotImplementedError):
        superadmin_content({"request": request}, content, "content")


def test_default_content_creates_builtin_content(rf, admin_user):
    """A bare string default falls back to djsuperadmin's own Content model."""
    request = rf.get("/")
    request.user = admin_user
    html = superadmin_content({"request": request}, "Some default content")
    assert 'class="djsuperadmin"' in html
    assert "Some default content" in html
    assert "/djsuperadmin/content/" in html
