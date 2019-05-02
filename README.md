# djSuperAdmin

**In your settings.py**
```py
INSTALLED_APPS = [
    'rest_framework',
    'hvad',
    'djsuperadmin'
    # Django modules
    ...
]



context_processors = [
    ...
    'djsuperadmin.context_processors.djsuperadmin' 
    ...
]
```


**In your template.html**
```html
{% load djsuperadmin %}
```
```html
<head>   
    {{djsuperadmincss}}
</head>
```
If you want use Quill Editor
```html
<body>
    <div>
        {% content 'customcontent_id' %}
    </div>
</body>
```
If you want a raw content (use it with caution, `<script>` tag are allowed)
```html
<body>
    <div>
        {% content_raw 'customcontent_id' %}
    </div>
</body>
```
```html
<footer>
    {{djsuperadminjs}}
</footer>
```