
import Quill from 'quill/core';

import Toolbar from 'quill/modules/toolbar';
import Snow from 'quill/themes/snow';

import Bold from 'quill/formats/bold';
import Italic from 'quill/formats/italic';
import Header from 'quill/formats/header';


Quill.register({
  'modules/toolbar': Toolbar,
  'themes/snow': Snow,
  'formats/bold': Bold,
  'formats/italic': Italic,
  'formats/header': Header
});


export default Quill;

var getCookie = (name) => {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
};

var status = (response) => {
    if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response)
    } else {
        return Promise.reject(new Error(response.statusText))
    }
};

var json = (response) => {
    return response.json()
};

const csrftoken = getCookie('csrftoken');


var logout_link_button = document.createElement('a');
logout_link_button.innerHTML = 'LOGOUT';
logout_link_button.href = djsa_logout_url;
logout_link_button.classList.add("djsuperadmin-logout");
document.body.appendChild(logout_link_button);


var classname = document.getElementsByClassName("djsuperadmin");
var content;
var editor_mode = 1
/**
 * editor mode 
 * 0 : bare editor, only a textare USE IT WITH CAUTION
 * 1 : full quill editor
 * 2 : lite quill editor (you can't use other than <strong> <b> <i> <u>) 
 */
var isTokenNeeded = (method) => {
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

var getOptions = (req_method) => {
    let opt = {}
    opt['method'] = req_method;
    opt['headers'] = {};
    opt['headers']['Content-Type'] = 'application/json';
    if (!isTokenNeeded(req_method)) {
        opt['headers']["X-CSRFToken"] = csrftoken;
    }
    return opt;
}


var getContent = function () {
    var attribute = this.getAttribute("data-djsa");
    editor_mode = this.getAttribute("data-mode");
    var options = getOptions('GET');
    var url = "/djsuperadmin/contents/" + attribute + "/";
    fetch(url, options).then(status).then(json).then(function (data) {
        content = data;
        getUpEdit(editor_mode);
    }).catch(function (error) {
        console.log('Request failed', error);
    });
};


var pushContent = (htmlcontent) => {
    content.content = htmlcontent;
    var url = '/djsuperadmin/contents/' + content.id + '/';
    var options = getOptions('PATCH');
    options['body'] = JSON.stringify(content);
    fetch(url, options).then(status).then(json).then(function (data) {
        location.reload()
    }).catch(function (error) {
        console.log('Request failed', error);
    });
};



var getUpEdit = (editor_mode = editor_mode) => {
    var background = document.createElement('div');
    var container = document.createElement('div');
    var btn = document.createElement("button");
    btn.innerHTML = 'SALVA';
    btn.classList.add('djsuperadmin-save');

    background.classList.add("djsuperadmin-background");
    container.classList.add("djsuperadmin-editor");

    background.appendChild(container);
    document.body.appendChild(background);
    var editor = null;
    var editor_content = null;
    switch (editor_mode) {
        case '0':
            editor = document.createElement("textarea");
            editor.value = content.content;
            editor.className = "ql-container";
            editor_content = () => { return editor.value }
            container.appendChild(editor);

            break;
        case '2':
            // code block
            break;
        default:
            editor = document.createElement('div');
            editor.id = 'editor';
            editor.innerHTML = content.content;
            container.appendChild(editor);
            editor = new Quill('#editor', {
                theme: 'snow'
            });
            editor_content = () => { return editor.container.firstChild.innerHTML }
    }
    container.appendChild(btn);
    btn.addEventListener('click', function () { pushContent(editor_content()) }, false);
    window.onclick = function (event) {
        if (event.target == background) {
            background.remove()
        }
    }
};

for (var i = 0; i < classname.length; i++) {
    classname[i].addEventListener('dblclick', getContent, false);
    classname[i].parentNode.classList.add('djsuperadmin-content')
}