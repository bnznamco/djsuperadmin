from rest_framework import viewsets
from .models import Content
from .serializers import ContentSerializer

# Create your views here.

class ContentViewSet(viewsets.ModelViewSet):

    queryset = Content.objects.all()
    serializer_class = ContentSerializer
    model = Content
    lookup_field = 'pk'

    