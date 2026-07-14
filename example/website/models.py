from django.db import models

from djsuperadmin.mixins import DjSuperAdminMixin


class Content(models.Model, DjSuperAdminMixin):
    """Example of a custom content model wired to your own API endpoint."""

    identifier = models.CharField(max_length=200, unique=True)
    content = models.TextField()

    @property
    def superadmin_get_url(self):
        return "/api/content"

    @property
    def superadmin_patch_url(self):
        return "/api/content"


class ContentWithoutUrls(models.Model, DjSuperAdminMixin):
    """A model that forgets to implement the required urls (used in tests)."""

    identifier = models.CharField(max_length=200, unique=True)
    content = models.TextField()
