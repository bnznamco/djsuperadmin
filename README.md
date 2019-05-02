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
    'djsuperadmin.context_processors.djsuperamin' 
    ...
]
```


**In your template.html**
```html
{% load admintag %}
```
```html
<head>   
    {{djsuperadmincss}}
</head>
```
```html
<body>
    <div>
        {% content 'customcontent_id' %}
    </div>
</body>
```
```html
<footer>
    {{djsuperadminjs}}
</footer>
```
