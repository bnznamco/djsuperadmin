import os
from djsuperadmin.models import Content
from django import template
from django.utils.safestring import mark_safe
from ..settings import DJSUPERADMIN_SETTINGS


def _get_obj_span(obj, attribute, placeholder, editor_mode):
    # WYSIWYG content is block-level HTML (paragraphs, images, ...), which cannot
    # legally live inside an inline <span> — the browser would eject it from the
    # wrapper. Use a <div> for WYSIWYG; keep the inline <span> for raw text.
    tag = "div" if editor_mode else "span"
    html = '<%s class="djsuperadmin"' % tag
    html += ' data-djsa-mode="%s"' % editor_mode
    html += ' data-djsa-id="%s"' % str(obj.id)
    html += ' data-djsa-getcontenturl="%s"' % str(obj.superadmin_get_url)
    html += ' data-djsa-patchcontenturl="%s"' % str(obj.superadmin_patch_url)
    # Optional: only models exposing a history url get the revert/history panel.
    history_url = getattr(obj, "superadmin_history_url", None)
    if history_url:
        html += ' data-djsa-historyurl="%s"' % str(history_url)
    html += ">%s</%s>" % (getattr(obj, attribute, placeholder), tag)
    return html


def _get_obj_content(context, obj, attribute, placeholder="New content", editor_mode=1):
    if context["request"].user.is_superuser:
        return mark_safe(_get_obj_span(obj, attribute, placeholder, editor_mode))
    else:
        return mark_safe(getattr(obj, attribute, placeholder))


register = template.Library()


@register.simple_tag(takes_context=True)
def superadmin_content(context, *args):
    if len(args) == 1 and isinstance(args[0], str):
        args = Content.get_from_default_data(args[0]), "data"
    return _get_obj_content(context, args[0], args[1])


@register.simple_tag(takes_context=True)
def superadmin_raw_content(context, *args):
    if len(args) == 1 and isinstance(args[0], str):
        args = Content.get_from_default_data(args[0]), "data"
    return _get_obj_content(context, args[0], args[1], editor_mode=0)


@register.simple_tag(takes_context=True)
def djsuperadminjs(context):
    if (
        context["request"].user.is_authenticated
        and context["request"].user.is_superuser
    ):
        superadmin_basedir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
        inplace = (
            "true" if DJSUPERADMIN_SETTINGS.get("INPLACE_EDIT", False) else "false"
        )
        # Optional overrides so the rich-text editor can be self-hosted (e.g.
        # under a strict CSP). Empty -> the bundle falls back to its CDN default.
        suneditor_js = DJSUPERADMIN_SETTINGS.get("SUNEDITOR_JS", "")
        suneditor_css = DJSUPERADMIN_SETTINGS.get("SUNEDITOR_CSS", "")
        # Optional image endpoints. Point IMAGE_GALLERY_URL at a view returning
        # {"result": [{"src": "...", "name": "..."}, ...]} (e.g. camomilla's media
        # gallery) to let editors insert images from it.
        image_gallery_url = DJSUPERADMIN_SETTINGS.get("IMAGE_GALLERY_URL", "")
        image_upload_url = DJSUPERADMIN_SETTINGS.get("IMAGE_UPLOAD_URL", "")
        with open(
            os.path.join(
                superadmin_basedir, "static", "djsuperadmin", "djsuperadmin.bundle.js"
            ),
            "r",
        ) as js_file:
            js = (
                "<script>"
                'var djsa_logout_url="%s";'
                "var inplace_edit_enabled = %s;"
                'var djsa_suneditor_js = "%s";'
                'var djsa_suneditor_css = "%s";'
                'var djsa_image_gallery_url = "%s";'
                'var djsa_image_upload_url = "%s";'
                "%s"
                "</script>"
            ) % (
                "",
                inplace,
                suneditor_js,
                suneditor_css,
                image_gallery_url,
                image_upload_url,
                js_file.read(),
            )
        return mark_safe(js)
    return ""
