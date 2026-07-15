"""
Django settings for the djsuperadmin example project.

This project doubles as the demo app and as the settings used by the test
suite (see pytest.ini). It is intentionally minimal and supports every Django
version from 2.0 to the latest release.
"""

import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

SECRET_KEY = "django-insecure-djsuperadmin-example-do-not-use-in-production"

DEBUG = True

TESTING = "test" in sys.argv or "PYTEST_VERSION" in os.environ

ALLOWED_HOSTS = ["*"]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "djsuperadmin",
    "example.website",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "example.djsuperadmin_example.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "example.djsuperadmin_example.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        # str() keeps Django < 3.0 happy (os.PathLike support landed in 3.0).
        "NAME": str(BASE_DIR / "example" / "db.sqlite3"),
    }
}

LANGUAGE_CODE = "en"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"

# Ignored by Django < 3.2, honoured from 3.2 onwards.
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# djsuperadmin configuration.
# - INPLACE_EDIT: edit contents on the page (raw = contenteditable, WYSIWYG =
#   inline SunEditor) instead of a modal.
# - IMAGE_GALLERY_URL: an endpoint returning a media gallery for the editor's
#   "insert image" button. Here it's the demo endpoint; in a real CMS you would
#   point it at the media gallery API.
DJSUPERADMIN = {
    "INPLACE_EDIT": True,
    "IMAGE_GALLERY_URL": "/djsa-demo-gallery/",
}
