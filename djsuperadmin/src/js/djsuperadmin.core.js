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


var classname = document.getElementsByClassName("djsuperadmin");
var content;
var editor_mode = 0
var patch_content_url = null;
var pushing = null;

var editor;
var editor_content;
var background;
var container;
var btnSave;
var clickedElement;
var errorBanner;
var sunEditorInstance = null;
var inlineEl = null;
var editingParent = null;
var history_content_url = null;
/**
 * editor mode
 * 0 : bare editor, only a textarea. Edited in place when INPLACE_EDIT is on.
 * 1 : rich text editor (SunEditor). Edited in place (balloon) when INPLACE_EDIT
 *     is on, otherwise in a modal.
 */

// SunEditor is lazy-loaded from a CDN the first time a rich-text editor opens,
// so the injected bundle stays tiny. The URLs can be overridden from Django via
// DJSUPERADMIN = {"SUNEDITOR_JS": "...", "SUNEDITOR_CSS": "..."} (e.g. to
// self-host under a strict CSP) — the template tag exposes them as globals.
var SUNEDITOR_JS_DEFAULT = 'https://cdn.jsdelivr.net/npm/suneditor@2.47.10/dist/suneditor.min.js';
var SUNEDITOR_CSS_DEFAULT = 'https://cdn.jsdelivr.net/npm/suneditor@2.47.10/dist/css/suneditor.min.css';
var sunEditorLoading = null;

var loadSunEditor = () => {
    if (typeof SUNEDITOR !== 'undefined') return Promise.resolve();
    if (sunEditorLoading) return sunEditorLoading;
    var jsUrl = (typeof djsa_suneditor_js !== 'undefined' && djsa_suneditor_js) || SUNEDITOR_JS_DEFAULT;
    var cssUrl = (typeof djsa_suneditor_css !== 'undefined' && djsa_suneditor_css) || SUNEDITOR_CSS_DEFAULT;
    sunEditorLoading = new Promise((resolve, reject) => {
        if (!document.querySelector('link[data-djsa-suneditor]')) {
            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = cssUrl;
            link.setAttribute('data-djsa-suneditor', '');
            document.head.appendChild(link);
        }
        var script = document.createElement('script');
        script.src = jsUrl;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Could not load the editor'));
        document.head.appendChild(script);
    });
    return sunEditorLoading;
};

// Optional image controls. The gallery/upload endpoints are provided by Django
// (e.g. camomilla's media gallery) via DJSUPERADMIN settings; when neither is
// configured the buttons are omitted. SunEditor's `imageGalleryUrl` expects an
// endpoint that returns {"result": [{"src": "...", "name": "..."}, ...]}.
var imageGalleryUrl = () => (typeof djsa_image_gallery_url !== 'undefined' && djsa_image_gallery_url) || '';
var imageUploadUrl = () => (typeof djsa_image_upload_url !== 'undefined' && djsa_image_upload_url) || '';

var buildEditorConfig = (extra) => {
    var buttonList = [
        ['undo', 'redo'],
        ['bold', 'underline', 'italic', 'strike'],
        ['fontColor', 'hiliteColor', 'removeFormat'],
        ['list', 'align'],
        ['link'],
    ];
    var imageGroup = [];
    if (imageUploadUrl() || imageGalleryUrl()) imageGroup.push('image');
    if (imageGalleryUrl()) imageGroup.push('imageGallery');
    if (imageGroup.length) buttonList.push(imageGroup);
    buttonList.push(['codeView']);

    var config = { value: content.content, width: '100%', buttonList: buttonList };
    if (imageGalleryUrl()) config.imageGalleryUrl = imageGalleryUrl();
    if (imageUploadUrl()) config.imageUploadUrl = imageUploadUrl();
    return Object.assign(config, extra || {});
};

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

var handleClick = function (event) {
    event.stopPropagation();
    event.preventDefault();
    clickedElement = this
    clearTimeout(this.clickTimeout);
    this.clickTimeout = setTimeout(function () {
        if (event.detail == 2) {
            getContent(clickedElement)
        } else {
            event.target.parentNode.click()
        }
    }, 200);

}

var generateCacheAttr = function () {
    return '?cache=' + ("" + (Math.random() * 100) + "" + Date.now()).replace('.', '');
}

var getContent = function (element) {
    clickedElement = element;
    var attribute = element.getAttribute("data-djsa-id");
    var get_content_url = element.getAttribute("data-djsa-getcontenturl");
    patch_content_url = element.getAttribute("data-djsa-patchcontenturl");
    history_content_url = element.getAttribute("data-djsa-historyurl");
    var options = getOptions('GET');
    if (!get_content_url) {
        var url = "/djsuperadmin/contents/" + attribute + "/";
    } else {
        var url = get_content_url;
    }
    fetch(url + generateCacheAttr(), options).then(status).then(json).then(function (data) {
        content = data;
        startEditing(element);
    }).catch(function (error) {
        console.log(error);
    });
};

var pushContent = async (htmlcontent) => {
    var currentE = clickedElement;
    content.content = htmlcontent;
    if (`${pushing}` == `${content.id}`) return
    pushing = content.id;
    if (!patch_content_url) {
        var url = '/djsuperadmin/contents/' + content.id + '/';
    } else {
        var url = patch_content_url;
    }
    var options = getOptions('PATCH');
    options['body'] = JSON.stringify(content);
    await fetch(url + generateCacheAttr(), options).then(status).then(json).then(function (data) {
        currentE.innerHTML = htmlcontent;
        closeEditor();
    }).catch(function (error) {
        if (!errorBanner) return
        errorBanner.classList.add('active')
        errorBanner.innerHTML = error;
        setTimeout(function () {
            errorBanner.classList.remove('active')
        }, 2000);
    }).finally(() => pushing = null);
};


var setEditorHeight = (editor) => {
    editor.style.height = "";
    editor.style.height = editor.scrollHeight + 10 + "px"
}

var pushOnEnter = (editor) => {
    editor.addEventListener("keydown", async (event) => {
        const { keyCode } = event;
        if(keyCode === 13) {
            event.preventDefault()
            await pushContent(editor_content())
            if (editor.hasAttribute("contenteditable")){
                editor.removeAttribute("contenteditable");
            }
            return false;
        }
    }, false)
}

// Flag the surrounding content region so it shows the "editing" ring + badge.
var markEditing = function (element) {
    editingParent = element.parentNode;
    if (editingParent) editingParent.classList.add('djsuperadmin-editing');
};

// ── Edit / history toolbar ───────────────────────────────────────────────────
// A small pill of icon buttons floats over each editable region: a pencil (open
// the editor) and — when the content exposes a history url — a clock (open the
// version list to revert). Built once per element on load, revealed on hover and
// while editing.
var PENCIL_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
var HISTORY_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l3 2"/></svg>';

var stripTags = function (html) {
    var d = document.createElement('div');
    d.innerHTML = html || '';
    return (d.textContent || '').replace(/\s+/g, ' ').trim();
};

var formatWhen = function (iso) {
    var d = new Date(iso);
    return isNaN(d) ? iso : d.toLocaleString();
};

// The toolbar is otherwise hover-only, so an open history panel would vanish the
// moment the pointer leaves the content. While a panel is open we pin its
// toolbar visible (.djsa-open) and dismiss it on an outside click instead.
var onHistoryOutside = function (e) {
    if (e.target.closest && e.target.closest('.djsa-toolbar')) return;
    closeAllHistory();
};

var closeAllHistory = function () {
    var bars = document.querySelectorAll('.djsa-toolbar.djsa-open');
    for (var i = 0; i < bars.length; i++) {
        bars[i].classList.remove('djsa-open');
        var p = bars[i].querySelector('.djsa-history-panel');
        if (p) p.style.display = 'none';
    }
    document.removeEventListener('mousedown', onHistoryOutside, true);
};

var makeToolButton = function (icon, label, cls) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'djsa-tool ' + cls;
    b.title = label;
    b.setAttribute('aria-label', label);
    b.innerHTML = icon;
    return b;
};

var buildToolbar = function (element) {
    var host = element.parentNode;
    if (!host || host.querySelector(':scope > .djsa-toolbar')) return;
    var bar = document.createElement('div');
    bar.className = 'djsa-toolbar';
    // Keep focus in the editor when clicking a tool, so save-on-exit (blur /
    // outside-click) doesn't fire and tear the editor down mid-click.
    bar.addEventListener('mousedown', function (e) { e.preventDefault(); });

    var editBtn = makeToolButton(PENCIL_ICON, 'Edit', 'djsa-tool-edit');
    editBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (!editingParent) getContent(element);
    });
    bar.appendChild(editBtn);

    if (element.getAttribute('data-djsa-historyurl')) {
        var histBtn = makeToolButton(HISTORY_ICON, 'Version history', 'djsa-tool-history');
        var panel = document.createElement('div');
        panel.className = 'djsa-history-panel';
        panel.style.display = 'none';
        histBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (panel.style.display === 'none') {
                closeAllHistory();
                openHistory(panel, element);
                bar.classList.add('djsa-open');
                document.addEventListener('mousedown', onHistoryOutside, true);
            } else {
                closeAllHistory();
            }
        });
        bar.appendChild(histBtn);
        bar.appendChild(panel);
    }
    host.appendChild(bar);
};

var openHistory = function (panel, element) {
    var url = element.getAttribute('data-djsa-historyurl');
    panel.style.display = 'block';
    panel.innerHTML = '<div class="djsa-history-msg">Loading…</div>';
    fetch(url + generateCacheAttr(), getOptions('GET'))
        .then(status).then(json).then(function (data) {
            var versions = data.versions || [];
            if (!versions.length) {
                panel.innerHTML = '<div class="djsa-history-msg">No previous versions yet</div>';
                return;
            }
            panel.innerHTML = '';
            versions.forEach(function (v) {
                var item = document.createElement('button');
                item.type = 'button';
                item.className = 'djsa-history-item';
                var when = document.createElement('span');
                when.className = 'djsa-history-when';
                when.textContent = formatWhen(v.created_at);
                var preview = document.createElement('span');
                preview.className = 'djsa-history-preview';
                preview.textContent = stripTags(v.data) || '(empty)';
                item.appendChild(when);
                item.appendChild(preview);
                item.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    closeAllHistory();
                    restoreVersion(element, v.data);
                });
                panel.appendChild(item);
            });
        }).catch(function (err) {
            panel.innerHTML = '<div class="djsa-history-msg">Could not load history</div>';
            console.log(err);
        });
};

// Restoring a past version is just a normal save (PATCH) of that body, so it
// works whether or not the editor is open and is itself undoable.
var restoreVersion = function (element, body) {
    clickedElement = element;
    patch_content_url = element.getAttribute('data-djsa-patchcontenturl');
    if (!content) content = {};
    pushContent(body);
};

var onEscKey = function (event) {
    if (event.key === 'Escape') closeEditor();
};

// "Save on exit": a pointer press anywhere outside the editor (and its dialogs)
// commits and closes it. Native contenteditable blur doesn't fire when clicking
// non-focusable page areas, so we detect the outside click ourselves.
var onOutsideDown = function (event) {
    if (!sunEditorInstance) return;
    if (event.target.closest && event.target.closest('.sun-editor')) return;
    if (event.target.closest && event.target.closest('.djsa-toolbar')) return;
    if (document.querySelector('.sun-editor .se-dialog[style*="display: block"]')) return;
    pushContent(editor_content());
};

// Tears down whatever editor is open (modal or inline) and restores the page.
var closeEditor = () => {
    if (sunEditorInstance) {
        try { sunEditorInstance.destroy(); } catch (e) { /* noop */ }
        sunEditorInstance = null;
    }
    // SunEditor hides the element it is mounted on; bring it back.
    if (inlineEl) {
        inlineEl.style.display = '';
        inlineEl = null;
    }
    if (editingParent) {
        editingParent.classList.remove('djsuperadmin-editing');
        editingParent = null;
    }
    // Toolbars are persistent; just collapse any open history panel.
    closeAllHistory();
    document.removeEventListener('keydown', onEscKey);
    document.removeEventListener('mousedown', onOutsideDown, true);
    if (background) {
        background.remove();
        background = null;
    }
};

// Rich-text editing right on the page (no modal), mirroring the raw in-place
// flow. SunEditor runs in "inline" mode: the toolbar docks above the content
// while it is focused, so tools (incl. the image gallery) are always reachable.
// A toolbar "save" button commits (blur is unreliable for contenteditable);
// Escape cancels.
var inPlaceWysiwyg = (element) => {
    inlineEl = element;
    markEditing(element);
    editor_content = () => content.content;
    loadSunEditor().then(() => {
        var config = buildEditorConfig({
            mode: 'inline',
            height: 'auto', // grow the editor with its content (no inner scroll)
            minHeight: '1.5em',
        });
        config.buttonList.push(['save']);
        config.callBackSave = (contents) => pushContent(contents);
        // Save on exit (blur) too — unless focus moved into the editor's own UI
        // (a toolbar button, or a dialog such as the image gallery), in which
        // case we must not commit and tear the editor down.
        config.onBlur = () => {
            setTimeout(() => {
                if (!sunEditorInstance) return;
                var se = document.querySelector('.sun-editor');
                if (!se || se.contains(document.activeElement)) return;
                if (se.querySelector('.se-dialog[style*="display: block"]')) return;
                pushContent(editor_content());
            }, 200);
        };
        sunEditorInstance = SUNEDITOR.create(element, config);
        editor_content = () => sunEditorInstance.getContents(true);
        sunEditorInstance.core.focus();
        document.addEventListener('mousedown', onOutsideDown, true);
    }).catch((error) => console.log(error));
    document.addEventListener('keydown', onEscKey);
};

var buildModal = (editor_mode = editor_mode) => {
    background = document.createElement('div');
    container = document.createElement('div');
    background.classList.add("djsuperadmin-background");
    container.classList.add("djsuperadmin-editor");

    // Header: title + close button
    var header = document.createElement('div');
    header.classList.add('djsuperadmin-header');
    var title = document.createElement('span');
    title.classList.add('djsuperadmin-title');
    title.textContent = 'Edit content';
    var btnClose = document.createElement('button');
    btnClose.classList.add('djsuperadmin-close');
    btnClose.setAttribute('aria-label', 'Close');
    btnClose.innerHTML = '&times;';
    header.appendChild(title);
    header.appendChild(btnClose);

    var body = document.createElement('div');
    body.classList.add('djsuperadmin-body');

    container.appendChild(header);
    container.appendChild(body);
    background.appendChild(container);
    document.body.appendChild(background);

    switch (editor_mode) {
        case '0':
            editor = document.createElement("textarea");
            editor.value = content.content;
            editor.className = "raw-editor";
            editor_content = () => { return editor.value }
            body.appendChild(editor);
            setEditorHeight(editor)
            editor.addEventListener('input', () => setEditorHeight(editor), false);
            pushOnEnter(editor)
            editor.focus()
            break;
        default:
            editor = document.createElement('textarea');
            body.appendChild(editor);
            // Until SunEditor finishes loading, saving falls back to the
            // untouched content so a fast click never sends `undefined`.
            editor_content = () => content.content;
            loadSunEditor().then(() => {
                sunEditorInstance = SUNEDITOR.create(editor, buildEditorConfig({
                    height: 'auto',
                    minHeight: '180px',
                }));
                editor_content = () => sunEditorInstance.getContents(true);
                sunEditorInstance.core.focus();
            }).catch((error) => {
                errorBanner.classList.add('active');
                errorBanner.innerHTML = error;
            });
    }

    errorBanner = document.createElement('div');
    errorBanner.classList.add('djsuperadmin-errorbanner');

    var footer = document.createElement('div');
    footer.classList.add('djsuperadmin-footer');
    var btnCancel = document.createElement('button');
    btnCancel.classList.add('djsuperadmin-btn', 'djsuperadmin-btn-cancel');
    btnCancel.textContent = 'Cancel';
    btnSave = document.createElement("button");
    btnSave.textContent = 'Save';
    btnSave.classList.add('djsuperadmin-btn', 'djsuperadmin-btn-save');
    footer.appendChild(btnCancel);
    footer.appendChild(btnSave);

    container.appendChild(errorBanner);
    container.appendChild(footer);

    btnSave.addEventListener('click', async () => {
        await pushContent(editor_content());
    }, false);
    btnCancel.addEventListener('click', closeEditor, false);
    btnClose.addEventListener('click', closeEditor, false);
    background.addEventListener('mousedown', function (e) {
        if (e.target == background) closeEditor();
    }, false);
    document.addEventListener('keydown', onEscKey);
}

var inPlaceEdit = (element) => {
    editor = element;
    markEditing(element);
    editor.setAttribute("contenteditable", "true")
    editor_content = () => { return element.innerHTML }
    editor.addEventListener('blur', async () => {
        await pushContent(editor_content());
        editor.removeAttribute("contenteditable");
    }, false);
    pushOnEnter(editor)
    editor.focus()
};

var startEditing = (element) => {
    editor_mode = element.getAttribute("data-djsa-mode");
    if (inplace_edit_enabled) {
        if (editor_mode == "0") {
            inPlaceEdit(element)
        } else {
            inPlaceWysiwyg(element)
        }
    } else {
        buildModal(editor_mode)
    }
};

for (var i = 0; i < classname.length; i++) {
    classname[i].addEventListener('click', handleClick, false);
    classname[i].parentNode.classList.add('djsuperadmin-content')
    buildToolbar(classname[i]);
}
