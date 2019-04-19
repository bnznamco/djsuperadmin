from django.utils.safestring import mark_safe
import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))


def insuperamin(request):
    js = '''
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <script src="//cdn.quilljs.com/1.3.6/quill.min.js"></script>
    '''
    if request.user.is_superuser: 
        with open(os.path.join(BASE_DIR, 'static/main.min.js'), 'r') as js_file:
            js+='<script>'+js_file.read().replace('\n', '')+'</script>'
        with open(os.path.join(BASE_DIR, 'static/style.min.css'), 'r') as css_file:
            css='<style>'+css_file.read().replace('\n', '')+'</style>'
        return {'insuperadminjs': mark_safe(js), 'insuperamincss':mark_safe(css) }
    return {}