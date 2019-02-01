(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Menu;
(function (Menu) {
    Menu[Menu["MAIN"] = 0] = "MAIN";
    Menu[Menu["CHAPTERS"] = 1] = "CHAPTERS";
    Menu[Menu["THANKS"] = 2] = "THANKS";
    Menu[Menu["STYLE"] = 3] = "STYLE";
    Menu[Menu["CONTACT"] = 4] = "CONTACT";
    Menu[Menu["SETTINGS"] = 5] = "SETTINGS";
    Menu[Menu["STATS"] = 6] = "STATS";
})(Menu = exports.Menu || (exports.Menu = {}));

},{}],2:[function(require,module,exports){
"use strict";
// export enum Style {
//   BRIGHT,
//   DARK,
//   PARCHMENT,
// }
// export const styleClassNames: Map<Style, string> = new Map();
// styleClassNames.set(Style.BRIGHT, 'style-bright');
// styleClassNames.set(Style.DARK, 'style-dark');
// styleClassNames.set(Style.PARCHMENT, 'style-parchment');
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Style = /** @class */ (function () {
    function Style(name, def) {
        this.name = name;
        this.def = def;
        this.styleSheet = null;
        var selectionButton = document.createElement('div');
        selectionButton.classList.add('selectable', 'small', 'button');
        selectionButton.innerText = name;
        selectionButton.addEventListener('click', this.active.bind(this));
        this.selectionButton = selectionButton;
    }
    Style.prototype.injectStyleSheet = function () {
        var $style = document.createElement('style');
        document.head.appendChild($style);
        var sheet = $style.sheet;
        sheet.disabled = true;
        sheet.insertRule(".rect.reading { background-color: " + this.def.rectBgColor + "; }");
        sheet.insertRule(".rect.reading>.content { background-color: " + this.def.paperBgColor + "; }");
        sheet.insertRule(".rect.reading>.content { color: " + this.def.textColor + "; }");
        sheet.insertRule(".rect.reading>.content a { color: " + this.def.linkColor + "; }");
        sheet.insertRule(".rect.reading>.content a:visited { color: " + this.def.linkColor + "; }");
        sheet.insertRule(".rect.reading>.content a:hover { color: " + this.def.linkHoverColor + "; }");
        sheet.insertRule(".rect.reading>.content a:active { color: " + this.def.linkActiveColor + "; }");
        this.styleSheet = sheet;
    };
    Style.prototype.active = function () {
        if (Style.currentlyEnabled !== null) {
            var currentlyEnabled = Style.currentlyEnabled;
            if (currentlyEnabled.styleSheet !== null) {
                currentlyEnabled.styleSheet.disabled = true;
            }
            currentlyEnabled.selectionButton.classList.remove('selected');
        }
        if (this.styleSheet === null) {
            this.injectStyleSheet();
        }
        this.styleSheet.disabled = false;
        this.selectionButton.classList.add('selected');
        window.localStorage.setItem('style', this.name);
        Style.currentlyEnabled = this;
    };
    Style.currentlyEnabled = null;
    return Style;
}());
function load(buttonsParent) {
    var e_1, _a;
    var styles = [
        new Style('默认', {
            rectBgColor: '#EFEFED',
            paperBgColor: '#FFF',
            textColor: '#000',
            linkColor: '#00E',
            linkHoverColor: '#00E',
            linkActiveColor: '#00C',
        }),
        new Style('夜间', {
            rectBgColor: '#272B36',
            paperBgColor: '#38404D',
            textColor: '#DDD',
            linkColor: '#55E',
            linkHoverColor: '#55E',
            linkActiveColor: '#33C',
        }),
        new Style('羊皮纸', {
            rectBgColor: '#D8D4C9',
            paperBgColor: '#F8F4E9',
            textColor: '#552830',
            linkColor: '#00E',
            linkHoverColor: '#00E',
            linkActiveColor: '#00C',
        }),
        new Style('可穿戴科技', {
            rectBgColor: '#444',
            paperBgColor: '#333',
            textColor: '#DDD',
            linkColor: '#66F',
            linkHoverColor: '#66F',
            linkActiveColor: '#44D',
        }),
        new Style('巧克力', {
            rectBgColor: '#2C1C11',
            paperBgColor: '#3E2519',
            textColor: '#CD9F89',
            linkColor: '#66F',
            linkHoverColor: '#66F',
            linkActiveColor: '#44D',
        }),
    ];
    var usedStyle = window.localStorage.getItem('style');
    var flag = false;
    try {
        for (var styles_1 = __values(styles), styles_1_1 = styles_1.next(); !styles_1_1.done; styles_1_1 = styles_1.next()) {
            var style = styles_1_1.value;
            if (usedStyle === style.name) {
                style.active();
                flag = true;
                break;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (styles_1_1 && !styles_1_1.done && (_a = styles_1.return)) _a.call(styles_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    if (!flag) {
        styles[0].active();
    }
    styles.forEach(function (style) { return buttonsParent.appendChild(style.selectionButton); });
}
exports.load = load;

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getTextNodes(parent, initArray) {
    var textNodes = initArray || [];
    var pointer = parent.firstChild;
    while (pointer !== null) {
        if (pointer instanceof HTMLElement) {
            getTextNodes(pointer, textNodes);
        }
        if (pointer instanceof Text) {
            textNodes.push(pointer);
        }
        pointer = pointer.nextSibling;
    }
    return textNodes;
}
exports.getTextNodes = getTextNodes;

},{}],4:[function(require,module,exports){
"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
var _a, e_1, _b;
var getTextNodes_1 = require("./getTextNodes");
var loadingText_1 = require("./loadingText");
var Menu_1 = require("./Menu");
var Style_1 = require("./Style");
var stylePreviewArticle_1 = require("./stylePreviewArticle");
var data = window.DATA;
var id = function (id) {
    return document.getElementById(id);
};
var $warning = id('warning');
var $buildNumber = id('build-number');
$buildNumber.innerText = "Build " + data.buildNumber;
var $rect = id('rect');
var $content = id('content');
var $btngrpMain = id('btngrp-main');
var $btnChapters = id('btn-chapters');
var $btnThanks = id('btn-thanks');
var $btnStyle = id('btn-style');
var $btnContact = id('btn-contact');
var $btnSettings = id('btn-settings');
var $btnStats = id('btn-stats');
var $btngrpChapters = id('btngrp-chapters');
var $btnChaptersBack = id('btn-chapters-back');
var $btngrpThanks = id('btngrp-thanks');
var $btnThanksBack = id('btn-thanks-back');
var $btngrpStyle = id('btngrp-style');
var $btnStyleBack = id('btn-style-back');
Style_1.load($btngrpStyle);
var $btngrpContact = id('btngrp-contact');
var $btnContactBack = id('btn-contact-back');
var $btngrpSettings = id('btngrp-settings');
var $btnSettingsBack = id('btn-settings-back');
var $btnSettingsWarning = id('btn-settings-warning');
var $btnSettingsAnimation = id('btn-settings-animation');
var $btngrpStats = id('btngrp-stats');
var $btnStatsBack = id('btn-stats-back');
var $txtStatsChars = id('txt-stats-chars');
var $txtStatsParagraphs = id('txt-stats-paragraphs');
$txtStatsChars.innerText = "\u603B\u5B57\u6570\uFF1A" + data.charsCount;
$txtStatsParagraphs.innerText = "\u603B\u6BB5\u843D\u6570\uFF1A" + data.paragraphsCount;
var RectMode;
(function (RectMode) {
    RectMode[RectMode["SIDE"] = 0] = "SIDE";
    RectMode[RectMode["MAIN"] = 1] = "MAIN";
    RectMode[RectMode["OFF"] = 2] = "OFF";
})(RectMode || (RectMode = {}));
var rectMode = RectMode.OFF;
var setRectMode = function (newRectMode) {
    // console.info(`${RectMode[rectMode]} -> ${RectMode[newRectMode]}`);
    if (rectMode === newRectMode) {
        return;
    }
    if (newRectMode === RectMode.OFF) {
        $rect.classList.remove('reading');
    }
    else {
        if (rectMode === RectMode.MAIN) {
            $rect.classList.remove('main');
        }
        else if (rectMode === RectMode.SIDE) {
            $rect.classList.remove('side');
        }
        else {
            $rect.classList.remove('main', 'side');
            $rect.classList.add('reading');
        }
        if (newRectMode === RectMode.MAIN) {
            $rect.classList.add('main');
        }
        else {
            $rect.classList.add('side');
        }
    }
    rectMode = newRectMode;
};
var menu = Menu_1.Menu.MAIN;
var menuGroups = (_a = {},
    _a[Menu_1.Menu.MAIN] = $btngrpMain,
    _a[Menu_1.Menu.CHAPTERS] = $btngrpChapters,
    _a[Menu_1.Menu.THANKS] = $btngrpThanks,
    _a[Menu_1.Menu.STYLE] = $btngrpStyle,
    _a[Menu_1.Menu.CONTACT] = $btngrpContact,
    _a[Menu_1.Menu.SETTINGS] = $btngrpSettings,
    _a[Menu_1.Menu.STATS] = $btngrpStats,
    _a);
var attachMenuSwitchEvent = function (button, from, to, cb) {
    button.addEventListener('click', function () {
        if (menu !== from) {
            return;
        }
        menu = to;
        if (cb !== undefined) {
            cb();
        }
        menuGroups[from].classList.add('hidden');
        menuGroups[to].classList.remove('hidden');
    });
};
attachMenuSwitchEvent($btnChapters, Menu_1.Menu.MAIN, Menu_1.Menu.CHAPTERS);
attachMenuSwitchEvent($btnChaptersBack, Menu_1.Menu.CHAPTERS, Menu_1.Menu.MAIN);
attachMenuSwitchEvent($btnThanks, Menu_1.Menu.MAIN, Menu_1.Menu.THANKS);
attachMenuSwitchEvent($btnThanksBack, Menu_1.Menu.THANKS, Menu_1.Menu.MAIN);
attachMenuSwitchEvent($btnStyle, Menu_1.Menu.MAIN, Menu_1.Menu.STYLE, function () {
    $content.innerHTML = stylePreviewArticle_1.stylePreviewArticle;
    setRectMode(RectMode.SIDE);
});
attachMenuSwitchEvent($btnStyleBack, Menu_1.Menu.STYLE, Menu_1.Menu.MAIN, function () {
    setRectMode(RectMode.OFF);
});
attachMenuSwitchEvent($btnContact, Menu_1.Menu.MAIN, Menu_1.Menu.CONTACT);
attachMenuSwitchEvent($btnContactBack, Menu_1.Menu.CONTACT, Menu_1.Menu.MAIN);
attachMenuSwitchEvent($btnSettings, Menu_1.Menu.MAIN, Menu_1.Menu.SETTINGS);
attachMenuSwitchEvent($btnSettingsBack, Menu_1.Menu.SETTINGS, Menu_1.Menu.MAIN);
attachMenuSwitchEvent($btnStats, Menu_1.Menu.MAIN, Menu_1.Menu.STATS);
attachMenuSwitchEvent($btnStatsBack, Menu_1.Menu.STATS, Menu_1.Menu.MAIN);
var settingsWarning = window.localStorage.getItem('warning') === 'true';
var settingsAnimation = window.localStorage.getItem('animation') !== 'false';
var updateSettingsWarning = function () {
    window.localStorage.setItem('warning', String(settingsWarning));
    $btnSettingsWarning.innerText = "NSFW \u8B66\u544A\uFF1A" + (settingsWarning ? '开' : '关');
};
updateSettingsWarning();
var updateSettingsAnimation = function () {
    $btnSettingsAnimation.innerText = "\u4F7F\u7528\u52A8\u753B\uFF1A" + (settingsAnimation ? '开' : '关');
    if (settingsAnimation) {
        document.body.classList.add('animation-enabled');
    }
    else {
        document.body.classList.remove('animation-enabled');
    }
    window.localStorage.setItem('animation', String(settingsAnimation));
};
updateSettingsAnimation();
$btnSettingsWarning.addEventListener('click', function () {
    settingsWarning = !settingsWarning;
    updateSettingsWarning();
});
$btnSettingsAnimation.addEventListener('click', function () {
    settingsAnimation = !settingsAnimation;
    updateSettingsAnimation();
});
if ($warning !== null) {
    $warning.addEventListener('click', function () {
        $warning.style.opacity = '0';
        if (settingsAnimation) {
            $warning.addEventListener('transitionend', function () {
                $warning.remove();
            });
        }
        else {
            $warning.remove();
        }
    });
}
var chaptersCache = new Map();
var currentChapter = null;
var chapterSelection = null;
var chapterTextNodes = null;
var closeChapter = function () {
    setRectMode(RectMode.OFF);
    currentChapter = null;
    chapterSelection = null;
    chapterTextNodes = null;
};
var select = function (_a) {
    var _b = __read(_a, 4), anchorNodeIndex = _b[0], anchorOffset = _b[1], focusNodeIndex = _b[2], focusOffset = _b[3];
    if (chapterTextNodes === null) {
        return;
    }
    var anchorNode = chapterTextNodes[anchorNodeIndex];
    var focusNode = chapterTextNodes[focusNodeIndex];
    if (anchorNode === undefined || focusNode === undefined) {
        return;
    }
    document.getSelection().setBaseAndExtent(anchorNode, anchorOffset, focusNode, focusOffset);
    var element = anchorNode.parentElement;
    if (element !== null && (typeof element.scrollIntoView) === 'function') {
        element.scrollIntoView();
    }
};
var getFlexOneSpan = function () {
    var $span = document.createElement('span');
    $span.style.flex = '1';
    return $span;
};
var finalizeChapterLoading = function (selection) {
    chapterTextNodes = getTextNodes_1.getTextNodes($content);
    if (selection !== undefined) {
        select(selection);
    }
    var chapterIndex = data.chapters.indexOf(currentChapter);
    var $div = document.createElement('div');
    $div.style.display = 'flex';
    if (chapterIndex !== -1 && (chapterIndex !== 0)) {
        var prevChapter_1 = data.chapters[chapterIndex - 1];
        var $prevLink = document.createElement('a');
        $prevLink.innerText = '上一章';
        $prevLink.href = window.location.pathname + "?chapter=" + prevChapter_1;
        $prevLink.style.textAlign = 'left';
        $prevLink.style.flex = '1';
        $prevLink.addEventListener('click', function (event) {
            event.preventDefault();
            loadChapter(prevChapter_1);
            updateHistory(true);
        });
        $div.appendChild($prevLink);
    }
    else {
        $div.appendChild(getFlexOneSpan());
    }
    var $menuLink = document.createElement('a');
    $menuLink.innerText = '返回菜单';
    $menuLink.href = window.location.pathname;
    $menuLink.style.textAlign = 'center';
    $menuLink.style.flex = '1';
    $menuLink.addEventListener('click', function (event) {
        event.preventDefault();
        closeChapter();
        updateHistory(true);
    });
    $div.appendChild($menuLink);
    if (chapterIndex !== -1 && (chapterIndex < data.chapters.length - 1)) {
        var nextChapter_1 = data.chapters[chapterIndex + 1];
        var $nextLink = document.createElement('a');
        $nextLink.innerText = '下一章';
        $nextLink.href = window.location.pathname + "?chapter=" + nextChapter_1;
        $nextLink.style.textAlign = 'right';
        $nextLink.style.flex = '1';
        $nextLink.addEventListener('click', function (event) {
            event.preventDefault();
            loadChapter(nextChapter_1);
            updateHistory(true);
        });
        $div.appendChild($nextLink);
    }
    else {
        $div.appendChild(getFlexOneSpan());
    }
    $content.appendChild($div);
};
var loadChapter = function (chapter, selection) {
    setRectMode(RectMode.MAIN);
    currentChapter = chapter;
    if (chaptersCache.has(chapter)) {
        if (chaptersCache.get(chapter) === null) {
            $content.innerText = loadingText_1.loadingText;
        }
        else {
            $content.innerHTML = chaptersCache.get(chapter);
            finalizeChapterLoading(selection);
        }
    }
    else {
        $content.innerText = loadingText_1.loadingText;
        fetch("./chapters/" + chapter + ".html")
            .then(function (response) { return response.text(); })
            .then(function (text) {
            chaptersCache.set(chapter, text);
            if (chapter === currentChapter) {
                $content.innerHTML = text;
                finalizeChapterLoading(selection);
            }
        });
    }
    return true;
};
var getTitle = function () {
    var title = '可穿戴科技';
    if (currentChapter !== null) {
        title += ' - 章节 ' + currentChapter;
    }
    return title;
};
var updateHistory = function (push) {
    var method = push ? window.history.pushState : window.history.replaceState;
    var query = window.location.pathname;
    if (currentChapter !== null) {
        query += '?chapter=' + currentChapter;
        if (chapterSelection !== null) {
            query += "&selection=" + chapterSelection.join(',');
        }
    }
    var title = getTitle();
    document.title = title;
    method.call(window.history, null, title, query);
};
document.addEventListener('selectionchange', function () {
    if (chapterTextNodes === null) {
        return;
    }
    var before = String(chapterSelection);
    var selection = document.getSelection();
    if (selection === null) {
        chapterSelection = null;
    }
    else {
        var anchor = ((selection.anchorNode instanceof HTMLElement)
            ? selection.anchorNode.firstChild
            : selection.anchorNode);
        var anchorNodeIndex = chapterTextNodes.indexOf(anchor);
        var focus_1 = ((selection.focusNode instanceof HTMLElement)
            ? selection.focusNode.firstChild
            : selection.focusNode);
        var focusNodeIndex = chapterTextNodes.indexOf(focus_1);
        if ((anchorNodeIndex === -1) || (focusNodeIndex === -1) ||
            (anchorNodeIndex === focusNodeIndex && selection.anchorOffset === selection.focusOffset)) {
            chapterSelection = null;
        }
        else {
            if ((anchorNodeIndex < focusNodeIndex) ||
                (anchorNodeIndex === focusNodeIndex && selection.anchorOffset < selection.focusOffset)) {
                chapterSelection = [
                    anchorNodeIndex,
                    selection.anchorOffset,
                    focusNodeIndex,
                    selection.focusOffset,
                ];
            }
            else {
                chapterSelection = [
                    focusNodeIndex,
                    selection.focusOffset,
                    anchorNodeIndex,
                    selection.anchorOffset,
                ];
            }
        }
    }
    if (before !== String(chapterSelection)) {
        updateHistory(false);
    }
});
var followQuery = function () {
    if (typeof URLSearchParams !== 'function') {
        return;
    }
    var query = new URLSearchParams(window.location.search);
    var chapter = query.get('chapter');
    if (chapter === null) {
        if (currentChapter !== null) {
            closeChapter();
            document.title = getTitle();
        }
        return;
    }
    if (currentChapter !== chapter) {
        var selectionQuery = query.get('selection');
        var selection = selectionQuery !== null
            ? selectionQuery.split(',').map(function (str) { return +str; })
            : [];
        if (selection.length !== 4 || !selection.every(function (num) { return (num >= 0) && (num % 1 === 0) && (!Number.isNaN(num)) && (Number.isFinite(num)); })) {
            loadChapter(chapter);
        }
        else {
            loadChapter(chapter, selection);
        }
        document.title = getTitle();
    }
};
window.addEventListener('popstate', function () {
    followQuery();
});
var _loop_1 = function (chapter) {
    var $button = document.createElement('div');
    $button.classList.add('small', 'button');
    $button.innerText = "\u7AE0\u8282 " + chapter;
    $button.addEventListener('click', function () {
        loadChapter(chapter);
        updateHistory(true);
    });
    $btngrpChapters.appendChild($button);
};
try {
    for (var _c = __values(data.chapters), _d = _c.next(); !_d.done; _d = _c.next()) {
        var chapter = _d.value;
        _loop_1(chapter);
    }
}
catch (e_1_1) { e_1 = { error: e_1_1 }; }
finally {
    try {
        if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
    }
    finally { if (e_1) throw e_1.error; }
}
followQuery();

},{"./Menu":1,"./Style":2,"./getTextNodes":3,"./loadingText":5,"./stylePreviewArticle":6}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadingText = '加载中...';

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stylePreviewArticle = "<h1>\u5348\u996D</h1>\n<p><em>\u4F5C\u8005\uFF1A\u53CB\u4EBA\u266AB</em></p>\n<p>\u201C\u5348\u996D\uFF0C\u5348\u996D\u266A\u201D</p>\n<p>\u9633\u4F1E\u4E0B\u7684\u7433\uFF0C\u5F88\u662F\u671F\u5F85\u4ECA\u5929\u7684\u5348\u996D\u3002</p>\n<p>\u6216\u8BB8\u662F\u4F53\u8D28\u548C\u522B\u7684\u8840\u65CF\u4E0D\u592A\u4E00\u6837\uFF0C\u7433\u80FD\u591F\u611F\u77E5\u5230\u98DF\u7269\u7684\u5473\u9053\uFF0C\u4F3C\u4E4E\u4E5F\u4FDD\u6709\u7740\u751F\u7269\u5BF9\u98DF\u7269\u7684\u559C\u7231\u3002</p>\n<p>\u867D\u7136\u5979\u5E76\u4E0D\u80FD\u4ECE\u8FD9\u4E9B\u98DF\u7269\u4E2D\u83B7\u53D6\u80FD\u91CF\u5C31\u662F\u3002</p>\n<p>\u5B66\u6821\u98DF\u5802\u7684\u590F\u5B63\u9650\u5B9A\u751C\u70B9\u4ECA\u5929\u4E5F\u5F88\u662F\u62A2\u624B\uFF0C\u8FD9\u70B9\u4ECE\u961F\u4F0D\u7684\u957F\u5EA6\u5C31\u80FD\u770B\u51FA\u6765\u2014\u2014\u961F\u4F0D\u9669\u4E9B\u5C31\u8981\u8D85\u51FA\u98DF\u5802\u7684\u8303\u56F4\u4E86\u3002</p>\n<p>\u201C\u4F60\u8BF4\u6211\u8981\u6709\u94B1\u591A\u597D\u2014\u2014\u201D</p>\n<p>\u5DF2\u7ECF\u4ECE\u9694\u58C1\u7A97\u53E3\u4E70\u4E0B\u4E86\u666E\u901A\uFF0C\u4F46\u662F\u5F88\u4FBF\u5B9C\u7684\u8425\u517B\u9910\u7684\u79CB\u955C\u60AC\uFF0C\u770B\u7740\u961F\u4F0D\u4E2D\u5174\u81F4\u52C3\u52C3\u7684\u7433\u3002</p>\n<p>\u5176\u5B9E\u5979\u5E76\u4E0D\u662F\u7F3A\u94B1\uFF0C\u5927\u7EA6\u662F\u541D\u556C\u3002</p>\n<p>\u8FD9\u5F97\u602A\u5979\u5A18\uFF0C\u7A77\u517B\u79CB\u955C\u60AC\u517B\u4E60\u60EF\u4E86\uFF0C\u73B0\u5728\u5979\u5149\u81EA\u5DF1\u9664\u7075\u9000\u9B54\u6323\u6765\u7684\u5916\u5FEB\u90FD\u591F\u5979\u5962\u4F88\u4E0A\u4E00\u628A\u4E86\uFF0C\u53EF\u5374\u8FD8\u4FDD\u7559\u7740\u80FD\u4E0D\u82B1\u94B1\u7EDD\u5BF9\u4E0D\u82B1\uFF0C\u5FC5\u987B\u82B1\u94B1\u8D8A\u5C11\u8D8A\u597D\u7684\u541D\u556C\u4E60\u60EF\u3002</p>\n<p>\u5C11\u9877\uFF0C\u7433\u5DF2\u7ECF\u5E26\u7740\u5979\u7684\u751C\u54C1\u5EFA\u7B51\u2014\u2014\u6BCF\u5757\u7816\u5934\u90FD\u662F\u4E00\u5757\u86CB\u7CD5\uFF0C\u5806\u6210\u4E00\u4E2A\u8BE1\u5F02\u7684\u706B\u67F4\u76D2\u2014\u2014\u6765\u5230\u4E86\u684C\u524D\u3002</p>\n<p>\u201C\uFF08\u5403\u4E0D\u80D6\u771F\u597D\uFF0C\u6709\u94B1\u771F\u597D\u2026\u2026\u201D</p>\n<p>\u8840\u65CF\u7684\u542C\u89C9\u81EA\u7136\u662F\u6355\u6349\u5230\u4E86\u79CB\u955C\u60AC\u7684\u5600\u5495\uFF0C\u7433\u653E\u4E0B\u76D8\u5B50\uFF0C\u6084\u54AA\u54AA\u5730\u5C06\u7259\u8D34\u4E0A\u4E86\u79CB\u955C\u60AC\u7684\u8116\u9888\u3002</p>\n<p>\u201C\u563B\u563B\u266A\u201D</p>\n<p>\u201C\u545C\u2014\u2014\u201D</p>\n<p>\u76EF\u2014\u2014</p>\n<p>\u79CB\u955C\u60AC\u770B\u4E86\u770B\u76D8\u4E2D\u5269\u4E0B\u7684\u4E00\u5757\u6BDB\u8840\u65FA\uFF0C\u4F3C\u662F\u8054\u7CFB\u5230\u4E86\u4EC0\u4E48\uFF0C\u5C06\u76EE\u5149\u8F6C\u5411\u4E86\u7433\u7684\u7259\u3002</p>\n<p>\u6B63\u5728\u4EAB\u7528\u86CB\u7CD5\u76DB\u5BB4\u7684\u7433\u4EE5\u4F59\u5149\u77A5\u89C1\u4E86\u5979\u7684\u89C6\u7EBF\uFF0C</p>\n<p>\u201C\u76EF\u7740\u672C\u5C0F\u59D0\u662F\u8981\u505A\u4EC0\u4E48\u5462\uFF1F\u201D</p>\n<p>\u201C\u554A\uFF0C\u6CA1\uFF0C\u6CA1\u4EC0\u4E48\u2026\u2026\u201D</p>\n<p>\u79CB\u955C\u60AC\u652F\u652F\u543E\u543E\u7684\u8BF4\u7740\uFF0C</p>\n<p>\u201C\u5C31\u662F\u597D\u5947\u4E00\u4E2A\u95EE\u9898\uFF0C\u8840\u65CF\u4E3A\u4EC0\u4E48\u4E0D\u5403\u6BDB\u8840\u65FA\u2026\u2026\u201D</p>\n<p>\u201C\u5662\u2606\u6BDB\u8840\u65FA\u5C31\u662F\u90A3\u4E2A\u716E\u719F\u7684\u8840\u5757\u662F\u5427\uFF1F\u592A\u6CA1\u6709\u7F8E\u611F\u4E86\u8FD9\u79CD\u8840\uFF01\u800C\u4E14\u5403\u4E86\u4E5F\u6CA1\u6CD5\u513F\u6062\u590D\u80FD\u91CF\uFF0C\u7B80\u76F4\u5C31\u662F\u8840\u6DB2\u7684\u7EDD\u4F73\u6D6A\u8D39\u2606\uFF01\u201D</p>\n<p>\u7433\u53D1\u51FA\u4E86\u5BF9\u8FD9\u6837\u7F8E\u98DF\u7684\u9119\u89C6\uFF0C\u4E0D\u8FC7\u8FD9\u79CD\u9119\u89C6\u5927\u7EA6\u53EA\u6709\u8840\u65CF\u548C\u868A\u5B50\u4F1A\u51FA\u73B0\u5427\u2026\u2026</p>\n<p>\u201C\u8840\u65CF\u9700\u8981\u6444\u5165\u8840\uFF0C\u662F\u56E0\u4E3A\u8840\u6240\u5177\u6709\u7684\u751F\u547D\u80FD\u91CF\uFF0C\u5982\u679C\u716E\u719F\u4E86\u7684\u8BDD\uFF0C\u8D85\u8FC7\u4E5D\u6210\u7684\u80FD\u91CF\u90FD\u88AB\u8F6C\u5316\u6210\u5176\u4ED6\u7684\u4E1C\u897F\u4E86\uFF0C\u5BF9\u6211\u4EEC\u6765\u8BF4\u5B9E\u5728\u662F\u6CA1\u4EC0\u4E48\u7528\u5904\uFF0C\u8FD8\u767D\u767D\u6D6A\u8D39\u4E86\u4F5C\u4E3A\u539F\u6599\u7684\u8840\uFF0C\u8FD9\u79CD\u4E1C\u897F\u672C\u5C0F\u59D0\u624D\u4E0D\u5403\u54A7\u2718\uFF01\u997F\u6B7B\uFF0C\u6B7B\u5916\u8FB9\uFF0C\u4ECE\u8FD9\u8FB9\u8DF3\u4E0B\u53BB\u4E5F\u4E0D\u5403\u2718\uFF01\u201D</p>\n<p>\u201C\u6B38\uFF0C\u522B\u8FD9\u4E48\u8BF4\u561B\uFF0C\u4F60\u80FD\u5C1D\u5F97\u5230\u5473\u9053\u7684\u5427\uFF0C\u5403\u4E00\u5757\u8BD5\u8BD5\u5457\uFF1F\u201D</p>\n<p>\u201C\u771F\u2026\u2026\u771F\u9999\u266A\u201D</p>\n<p>\u5F53\u665A\uFF0C\u56E0\u4E3A\u89E6\u53D1\u4E86\u771F\u9999\u5B9A\u5F8B\u800C\u611F\u5230\u5F88\u706B\u5927\u7684\u7433\uFF0C\u628A\u79CB\u955C\u60AC\u4E22\u8FDB\u4E86\u81EA\u5DF1\u7684\u9AD8\u7EF4\u7A7A\u95F4\u91CC\u5934\u653E\u7F6E\u4E86\u4E00\u665A\u4E0A\uFF08\u9AD8\u7EF4\u65F6\u95F4\u4E09\u5929\uFF09\u6CC4\u6124\u3002</p>";

},{}]},{},[4]);
