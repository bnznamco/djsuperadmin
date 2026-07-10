import json

import pytest
from django.urls import reverse

from djsuperadmin.models import Content

pytestmark = pytest.mark.django_db


def test_content_api_get_creates_content(client):
    url = reverse("djsuperadmin-content-api", kwargs={"uuid": "abc123"})
    response = client.get(url)
    assert response.status_code == 200
    assert response.json() == {"content": None}
    assert Content.objects.filter(id="abc123").exists()


def test_content_api_patch_updates_content(client):
    url = reverse("djsuperadmin-content-api", kwargs={"uuid": "abc123"})
    response = client.patch(
        url, data=json.dumps({"content": "hello world"}), content_type="application/json"
    )
    assert response.status_code == 200
    assert response.json() == {"content": "hello world"}
    assert Content.objects.get(id="abc123").data == "hello world"
    # value survives a subsequent GET
    assert client.get(url).json() == {"content": "hello world"}
