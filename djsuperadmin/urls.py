from django.urls import path

from djsuperadmin.api import ContentApiView, ContentHistoryApiView

urlpatterns = [
    path(
        "djsuperadmin/content/<slug:uuid>/",
        ContentApiView.as_view(),
        name="djsuperadmin-content-api",
    ),
    path(
        "djsuperadmin/content/<slug:uuid>/history/",
        ContentHistoryApiView.as_view(),
        name="djsuperadmin-content-history-api",
    ),
]
