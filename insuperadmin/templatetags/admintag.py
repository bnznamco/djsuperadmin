from django import template
from django.utils.safestring import mark_safe
from insuperadmin.models import Content


register = template.Library()

@register.simple_tag(takes_context=True)
def content(context, identifier):
    content, created = Content.objects.language().fallbacks().get_or_create(identifier=identifier)
    if created:
        content.content = 'Nuovo contenuto'
        content.save()
    if context['request'].user.is_superuser:
        return mark_safe('<span class = "adminyo" data-myattribute = "'+str(content.id)+'">'+content.content+'</span>')
    else:
        return mark_safe(content.content)
