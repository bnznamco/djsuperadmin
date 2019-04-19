var a = document.createElement('a');
a.innerHTML = 'LOGOUT';
a.href = "/insuperadmin/logout";
a.classList.add("insuperadmin-logout");
document.body.appendChild(a);

var classname = document.getElementsByClassName("adminyo");

var content;

var csrftoken = jQuery("[name=csrfmiddlewaretoken]").val();
function csrfSafeMethod(method) {
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});

var getContent = function() {
    var attribute = this.getAttribute("data-myattribute");
    $.ajax({
        type: 'GET',
        url: '/insuperadmin/contents/'+attribute+'/',
        success: function(res){
                content = res;
                getUpEdit();

        },
        error: function(error) {
            console.log(error,self)
        }
    })
};

var pushContent = function(htmlcontent) {
    content.content = htmlcontent;
    $.ajax({
        type: 'PATCH',
        data:  content,
        url: '/insuperadmin/contents/'+content.id+'/',
        success: function(res){
                location.reload();
        },
        error: function(error) {
            alert('qualcosa è andato storto')
        }
    })
};

var getUpEdit = function(){
    var background = document.createElement('div');
    var container = document.createElement('div');
    var editor = document.createElement('div');
    var btn = document.createElement("button");
    btn.innerHTML = 'SALVA';
    btn.classList.add('insuperadmin-save');
    editor.id = 'editor';
    editor.innerHTML = content.content;
    background.classList.add("insuperadmin-background");
    container.classList.add("insuperadmin-editor");
    container.appendChild(editor);
    container.appendChild(btn);
    background.appendChild(container);
    document.body.appendChild(background);
    var quill = new Quill('#editor', {
        theme: 'snow'
    });
    btn.addEventListener('click', function(){pushContent(quill.container.firstChild.innerHTML)}, false);
    window.onclick = function(event) {
        if (event.target == background) {
            background.remove()
        }
    }
};

var destroyEdit = function(){
    this.remove()
};

for (var i = 0; i < classname.length; i++) {
    classname[i].addEventListener('dblclick', getContent, false);
    classname[i].parentNode.classList.add('insuperadmin-content')
}