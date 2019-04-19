from .views import ContentViewSet
from django.conf.urls import url, include
from rest_framework import routers
from django.contrib.auth import views as auth_views


router = routers.DefaultRouter()

router.register(r'contents', ContentViewSet)

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^logout/$', auth_views.logout, {'next_page': '/'}, name='logout'),
]
