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


def _patch(client, uuid, value):
    url = reverse("djsuperadmin-content-api", kwargs={"uuid": uuid})
    return client.patch(
        url, data=json.dumps({"content": value}), content_type="application/json"
    )


def test_patch_snapshots_previous_value(client):
    _patch(client, "v1", "first")
    # the first write (from empty) creates no version
    assert Content.objects.get(id="v1").versions.count() == 0
    _patch(client, "v1", "second")
    versions = Content.objects.get(id="v1").versions.all()
    assert versions.count() == 1
    assert versions[0].data == "first"
    # re-saving the same value doesn't add a version
    _patch(client, "v1", "second")
    assert Content.objects.get(id="v1").versions.count() == 1


def test_history_endpoint_lists_versions_newest_first(client):
    for value in ["a", "b", "c"]:
        _patch(client, "v2", value)
    hist = reverse("djsuperadmin-content-history-api", kwargs={"uuid": "v2"})
    payload = client.get(hist).json()
    # "a" came from empty (no version); "b" then "c" each snapshot the prior value
    assert [v["data"] for v in payload["versions"]] == ["b", "a"]
    assert "created_at" in payload["versions"][0]


def test_revert_is_a_normal_patch_and_is_undoable(client):
    for value in ["one", "two"]:
        _patch(client, "v3", value)
    _patch(client, "v3", "one")  # revert
    content = Content.objects.get(id="v3")
    assert content.data == "one"
    # the value we reverted away from is itself snapshotted
    assert "two" in [v.data for v in content.versions.all()]


def test_history_is_capped(client, monkeypatch):
    monkeypatch.setattr("djsuperadmin.api.DJSUPERADMIN_SETTINGS", {"MAX_VERSIONS": 2})
    for value in ["1", "2", "3", "4", "5"]:
        _patch(client, "v4", value)
    assert Content.objects.get(id="v4").versions.count() == 2
