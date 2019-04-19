from rest_framework import serializers, permissions
from .models import Content
from hvad.contrib.restframework import TranslatableModelSerializer


class ContentSerializer(TranslatableModelSerializer):

    class Meta:
        model = Content
        fields = '__all__'

