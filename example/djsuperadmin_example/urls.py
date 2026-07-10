from django.contrib import admin
from django.urls import include, path

from example.website.views import index

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", index, name="index"),
    path("", include("djsuperadmin.urls")),
]
