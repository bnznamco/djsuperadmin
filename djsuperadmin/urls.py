from .views import ContentViewSet
from django.conf.urls import url, include
from rest_framework import routers


router = routers.DefaultRouter()

router.register(r'contents', ContentViewSet)

urlpatterns = [
    url(r'^', include(router.urls)),
]
