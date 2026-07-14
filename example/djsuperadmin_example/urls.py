from django.contrib import admin
from django.urls import include, path

from example.website.views import demo_gallery, index

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", index, name="index"),
    path("djsa-demo-gallery/", demo_gallery, name="demo-gallery"),
    path("", include("djsuperadmin.urls")),
]
