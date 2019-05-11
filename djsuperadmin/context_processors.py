from django.utils.safestring import mark_safe
import os
from django.urls import reverse


BASE_DIR = os.path.abspath(os.path.dirname(__file__))


def djsuperadmin(request):
    js = '<script src="//cdn.quilljs.com/1.3.6/quill.min.js"></script>'

    if request.user.is_authenticated and request.user.is_superuser:
        with open(os.path.join(BASE_DIR, 'static/main.min.js'), 'r') as js_file:
            js += "<script>var djsa_logout_url='{0}'</script>".format(
                   reverse('account:logout', current_app=request.resolver_match.namespace))
            js += '<script>{0}</script>'.format(js_file.read())
        with open(os.path.join(BASE_DIR, 'static/style.min.css'), 'r') as css_file:
            css = '<style>{0}</style>'.format(css_file.read().replace('\n', ''))
        return {'djsuperadminjs': mark_safe(js), 'djsuperadmincss': mark_safe(css)}
    return {'djsuperadminjs': '', 'djsuperadmincss': ''}
