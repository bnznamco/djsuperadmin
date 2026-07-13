import json

from django.http import JsonResponse
from django.views import View

from djsuperadmin.models import Content, ContentVersion
from djsuperadmin.settings import DJSUPERADMIN_SETTINGS


class ContentApiView(View):
    def get_object(self, uuid):
        content, _ = Content.objects.get_or_create(id=uuid)
        return content

    def get(self, request, uuid, *args, **kwargs):
        content = self.get_object(uuid)
        return JsonResponse({"content": content.data})

    def patch(self, request, uuid, *args, **kwargs):
        content = self.get_object(uuid)
        data = json.loads(request.body)
        content_data = data["content"]
        # Snapshot the value we're about to overwrite so it can be reverted to.
        # Reverting is itself a PATCH, so it snapshots the current value too.
        if content.data is not None and content.data != content_data:
            ContentVersion.objects.create(content=content, data=content.data)
            self._prune(content)
        content.data = content_data
        content.save()
        return JsonResponse({"content": content_data})

    def _prune(self, content):
        # ponytail: keep last MAX_VERSIONS (default 20), tune via settings.
        max_versions = DJSUPERADMIN_SETTINGS.get("MAX_VERSIONS", 20)
        stale = list(content.versions.values_list("id", flat=True)[max_versions:])
        if stale:
            content.versions.filter(id__in=stale).delete()


class ContentHistoryApiView(View):
    def get(self, request, uuid, *args, **kwargs):
        content, _ = Content.objects.get_or_create(id=uuid)
        max_versions = DJSUPERADMIN_SETTINGS.get("MAX_VERSIONS", 20)
        versions = content.versions.all()[:max_versions]
        return JsonResponse(
            {
                "versions": [
                    {
                        "id": v.id,
                        "data": v.data,
                        "created_at": v.created_at.isoformat(),
                    }
                    for v in versions
                ]
            }
        )
