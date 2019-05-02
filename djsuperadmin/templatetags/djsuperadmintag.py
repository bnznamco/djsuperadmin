from django import template
from django.utils.safestring import mark_safe
from djsuperadmin.models import Content

def _get_span(editor_mode,content):
    return ("<span class=\"djsuperadmin\" data-mode="+str(editor_mode)+" data-djsa ="+str(content.id)+">"+content.content+"</span>")

def _get_content(context,identifier,editor_mode,placeholder="New content"):
    content, created = Content.objects.language().fallbacks().get_or_create(identifier=identifier)
    if created:
        content.content = placeholder
        content.save()
    if context['request'].user.is_superuser:
        return mark_safe(_get_span(editor_mode,content))
    else:
        return mark_safe(content.content)

register = template.Library()



@register.simple_tag(takes_context=True)
def content(context, identifier):
    return _get_content(context, identifier, 1)

@register.simple_tag(takes_context=True)
def content_lite(context, identifier):
    return _get_content(context, identifier, 2, placeholder="New Lite content")

@register.simple_tag(takes_context=True)
def content_raw(context, identifier):
    return _get_content(context, identifier, 0, placeholder="New RAW content")
