from django.http import JsonResponse
from django.shortcuts import render


def index(request):
    return render(request, "website/index.html")


def demo_gallery(request):
    """A stand-in for a media gallery, in the shape SunEditor's imageGallery
    expects. In a real CMS this endpoint would list the media gallery instead.
    """
    images = [
        {"src": f"https://picsum.photos/seed/djsa{i}/300/200", "name": f"Photo {i}"}
        for i in range(1, 13)
    ]
    return JsonResponse({"result": images})
