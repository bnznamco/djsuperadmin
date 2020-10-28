from django.utils.safestring import mark_safe
import os
from django.urls import reverse
from djsuperadmin.models import Content


BASE_DIR = os.path.abspath(os.path.dirname(__file__))


def djsuperadmin(request):
    context = {"djsa-contents": list(Content.objects.language().fallbacks().all()), "djsuperadminjs": ""}
    if request.user.is_authenticated and request.user.is_superuser:
        with open(os.path.join(BASE_DIR, "dist/djsuperadmin.bundle.js"), "r") as js_file:
            js = "<script>var djsa_logout_url='{0}';{1}</script>".format(
                reverse("account:logout", current_app=request.resolver_match.namespace), js_file.read()
            )
        context.update({"djsuperadminjs": mark_safe(js)})
    return context
