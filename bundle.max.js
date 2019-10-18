(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commentBlockControl_1 = require("./commentBlockControl");
const Menu_1 = require("./Menu");
const messages_1 = require("./messages");
class BlockMenu extends Menu_1.Menu {
    update() {
        this.clearItems();
        const blockedUsers = commentBlockControl_1.getBlockedUsers();
        if (blockedUsers.length === 0) {
            this.addItem(messages_1.NO_BLOCKED_USERS, { small: true });
        }
        else {
            this.addItem(messages_1.CLICK_TO_UNBLOCK, { small: true });
        }
        blockedUsers.forEach(userName => {
            this.addItem(userName, { small: true, button: true })
                .onClick(() => {
                commentBlockControl_1.unblockUser(userName);
            });
        });
    }
    constructor(parent) {
        super('屏蔽用户评论管理', parent);
        this.update();
        commentBlockControl_1.blockedUserUpdateEvent.on(this.update.bind(this));
    }
}
exports.BlockMenu = BlockMenu;

},{"./Menu":8,"./commentBlockControl":16,"./messages":26}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chapterControl_1 = require("./chapterControl");
const data_1 = require("./data");
const history_1 = require("./history");
const Menu_1 = require("./Menu");
const shortNumber_1 = require("./shortNumber");
const chapterSelectionButtonsMap = new Map();
let currentLastReadLabelAt = null;
function attachLastReadLabelTo(button, htmlRelativePath) {
    currentLastReadLabelAt = button.append('[上次阅读]');
}
chapterControl_1.loadChapterEvent.on(newChapterHtmlRelativePath => {
    if (currentLastReadLabelAt !== null) {
        currentLastReadLabelAt.remove();
    }
    attachLastReadLabelTo(chapterSelectionButtonsMap.get(newChapterHtmlRelativePath), newChapterHtmlRelativePath);
});
function getDecorationForChapterType(chapterType) {
    switch (chapterType) {
        case 'Markdown': return Menu_1.ItemDecoration.ICON_FILE;
        case 'WTCD': return Menu_1.ItemDecoration.ICON_GAME;
    }
}
class ChaptersMenu extends Menu_1.Menu {
    constructor(parent, folder) {
        if (folder === undefined) {
            folder = data_1.data.chapterTree;
        }
        super(folder.isRoot ? '章节选择' : folder.displayName, parent);
        for (const subfolder of folder.subFolders) {
            const handle = this.addLink(new ChaptersMenu(this, subfolder), true, Menu_1.ItemDecoration.ICON_FOLDER);
            handle.append(`[${shortNumber_1.shortNumber(subfolder.folderCharCount)}]`, 'char-count');
        }
        for (const chapter of folder.chapters) {
            const handle = this.addItem(chapter.displayName, {
                small: true,
                button: true,
                decoration: getDecorationForChapterType(chapter.type),
            })
                .onClick(() => {
                chapterControl_1.loadChapter(chapter.htmlRelativePath);
                history_1.updateHistory(true);
            });
            if (chapter.isEarlyAccess) {
                handle.prepend('[编写中]');
                handle.addClass('early-access');
            }
            handle.append(`[${shortNumber_1.shortNumber(chapter.chapterCharCount)}]`, 'char-count');
            const lastRead = window.localStorage.getItem('lastRead');
            if (lastRead === chapter.htmlRelativePath) {
                attachLastReadLabelTo(handle, chapter.htmlRelativePath);
            }
            chapterSelectionButtonsMap.set(chapter.htmlRelativePath, handle);
        }
    }
}
exports.ChaptersMenu = ChaptersMenu;

},{"./Menu":8,"./chapterControl":15,"./data":18,"./history":22,"./shortNumber":28}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Menu_1 = require("./Menu");
class ContactMenu extends Menu_1.Menu {
    constructor(parent) {
        super('订阅/讨论组', parent);
        this.addItem('Telegram 更新推送频道', {
            small: true,
            button: true,
            link: 'https://t.me/joinchat/AAAAAEpkRVwZ-3s5V3YHjA',
            decoration: Menu_1.ItemDecoration.ICON_LINK,
        });
        this.addItem('Telegram 讨论组', {
            small: true,
            button: true,
            link: 'https://t.me/joinchat/Dt8_WlJnmEwYNbjzlnLyNA',
            decoration: Menu_1.ItemDecoration.ICON_LINK,
        });
        this.addItem('GitHub Repo', {
            small: true,
            button: true,
            link: 'https://github.com/SCLeoX/Wearable-Technology',
            decoration: Menu_1.ItemDecoration.ICON_LINK,
        });
        this.addItem('原始 Google Docs', {
            small: true,
            button: true,
            link: 'https://docs.google.com/document/d/1Pp5CtO8c77DnWGqbXg-3e7w9Q3t88P35FOl6iIJvMfo/edit?usp=sharing',
            decoration: Menu_1.ItemDecoration.ICON_LINK,
        });
    }
}
exports.ContactMenu = ContactMenu;

},{"./Menu":8}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DebugLogger_1 = require("./DebugLogger");
function id(id) {
    return document.getElementById(id);
}
exports.id = id;
function getTextNodes(parent, initArray) {
    const textNodes = initArray || [];
    let pointer = parent.firstChild;
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
const selectNodeDebugLogger = new DebugLogger_1.DebugLogger('selectNode');
function selectNode(node) {
    try {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(node);
        selection.removeAllRanges();
        selection.addRange(range);
    }
    catch (error) {
        selectNodeDebugLogger.log('Failed to select node: ', node, '; Error: ', error);
    }
}
exports.selectNode = selectNode;
function isAnyParent($element, predicate) {
    while ($element !== null) {
        if (predicate($element)) {
            return true;
        }
        $element = $element.parentElement;
    }
    return false;
}
exports.isAnyParent = isAnyParent;

},{"./DebugLogger":5}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const settings_1 = require("./settings");
function simpleToString(value) {
    switch (typeof value) {
        case 'string':
            return `"${value}"`;
        default:
            return String(value);
    }
}
class DebugLogger {
    constructor(name, parameters = {}) {
        this.prefix = name + '('
            + Object.keys(parameters).map(key => `${key}=${simpleToString(parameters[key])}`).join(',')
            + ')';
    }
    log(...stuff) {
        if (!settings_1.developerMode.getValue()) {
            return;
        }
        console.info(this.prefix, ...stuff);
    }
    info(...stuff) {
        if (!settings_1.developerMode.getValue()) {
            return;
        }
        console.info(this.prefix, ...stuff);
    }
    warn(...stuff) {
        if (!settings_1.developerMode.getValue()) {
            return;
        }
        console.warn(this.prefix, ...stuff);
    }
    error(...stuff) {
        if (!settings_1.developerMode.getValue()) {
            return;
        }
        console.error(this.prefix, ...stuff);
    }
}
exports.DebugLogger = DebugLogger;

},{"./settings":27}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Event {
    constructor() {
        this.listeners = null;
        this.onceListeners = null;
        this.isEmitting = false;
        this.queue = [];
    }
    on(listener) {
        if (this.isEmitting) {
            this.queue.push(() => {
                this.on(listener);
            });
            return listener;
        }
        if (this.listeners === null) {
            this.listeners = new Set();
        }
        this.listeners.add(listener);
        return listener;
    }
    off(listener) {
        if (this.isEmitting) {
            this.queue.push(() => {
                this.off(listener);
            });
            return;
        }
        if (this.listeners === null) {
            return;
        }
        this.listeners.delete(listener);
    }
    once(onceListener) {
        if (this.isEmitting) {
            this.queue.push(() => {
                this.once(onceListener);
            });
            return onceListener;
        }
        if (this.onceListeners === null) {
            this.onceListeners = [];
        }
        this.onceListeners.push(onceListener);
        return onceListener;
    }
    expect(filter) {
        if (this.isEmitting) {
            return new Promise(resolve => {
                this.queue.push(() => {
                    this.expect(filter).then(resolve);
                });
            });
        }
        if (filter === undefined) {
            return new Promise(resolve => this.once(resolve));
        }
        return new Promise(resolve => {
            const listener = this.on(arg => {
                if (!filter(arg)) {
                    return;
                }
                this.off(listener);
                resolve(arg);
            });
        });
    }
    emit(arg) {
        if (this.isEmitting) {
            this.queue.push(() => {
                this.emit(arg);
            });
            return;
        }
        this.isEmitting = true;
        if (this.listeners !== null) {
            this.listeners.forEach(listener => listener(arg));
        }
        if (this.onceListeners !== null) {
            this.onceListeners.forEach(onceListener => onceListener(arg));
            this.onceListeners.length = 0;
        }
        this.isEmitting = false;
        while (this.queue.length >= 1) {
            this.queue.shift()();
        }
    }
}
exports.Event = Event;

},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ChaptersMenu_1 = require("./ChaptersMenu");
const ContactMenu_1 = require("./ContactMenu");
const Menu_1 = require("./Menu");
const SettingsMenu_1 = require("./SettingsMenu");
const StatsMenu_1 = require("./StatsMenu");
const StyleMenu_1 = require("./StyleMenu");
const ThanksMenu_1 = require("./ThanksMenu");
class MainMenu extends Menu_1.Menu {
    constructor() {
        super('', null);
        this.addLink(new ChaptersMenu_1.ChaptersMenu(this));
        this.addLink(new ThanksMenu_1.ThanksMenu(this));
        this.addLink(new StyleMenu_1.StyleMenu(this));
        this.addLink(new ContactMenu_1.ContactMenu(this));
        this.addItem('源代码', { button: true, link: 'https://github.com/SCLeoX/Wearable-Technology' });
        this.addLink(new SettingsMenu_1.SettingsMenu(this));
        this.addLink(new StatsMenu_1.StatsMenu(this));
    }
}
exports.MainMenu = MainMenu;

},{"./ChaptersMenu":2,"./ContactMenu":3,"./Menu":8,"./SettingsMenu":10,"./StatsMenu":12,"./StyleMenu":13,"./ThanksMenu":14}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DebugLogger_1 = require("./DebugLogger");
const Event_1 = require("./Event");
const RectMode_1 = require("./RectMode");
var ItemDecoration;
(function (ItemDecoration) {
    ItemDecoration[ItemDecoration["SELECTABLE"] = 0] = "SELECTABLE";
    ItemDecoration[ItemDecoration["BACK"] = 1] = "BACK";
    ItemDecoration[ItemDecoration["ICON_FOLDER"] = 2] = "ICON_FOLDER";
    ItemDecoration[ItemDecoration["ICON_LINK"] = 3] = "ICON_LINK";
    ItemDecoration[ItemDecoration["ICON_EQUALIZER"] = 4] = "ICON_EQUALIZER";
    ItemDecoration[ItemDecoration["ICON_FILE"] = 5] = "ICON_FILE";
    ItemDecoration[ItemDecoration["ICON_GAME"] = 6] = "ICON_GAME";
})(ItemDecoration = exports.ItemDecoration || (exports.ItemDecoration = {}));
function createSpan(text, ...classNames) {
    const $span = document.createElement('span');
    $span.innerText = text;
    $span.classList.add(...classNames);
    return $span;
}
class ItemHandle {
    constructor(menu, element) {
        this.menu = menu;
        this.element = element;
        this.$prependSpan = null;
        this.$appendSpan = null;
    }
    setSelected(selected) {
        this.element.classList.toggle('selected', selected);
        return this;
    }
    onClick(handler) {
        this.element.addEventListener('click', () => {
            handler(this.element);
        });
        return this;
    }
    linkTo(targetMenu) {
        this.onClick(() => {
            this.menu.navigateTo(targetMenu);
        });
        return this;
    }
    setInnerText(innerText) {
        this.element.innerText = innerText;
        return this;
    }
    addClass(className) {
        this.element.classList.add(className);
        return this;
    }
    removeClass(className) {
        this.element.classList.remove(className);
        return this;
    }
    prepend(text, className) {
        if (this.$prependSpan === null) {
            this.$prependSpan = createSpan('', 'prepend');
            this.element.prepend(this.$prependSpan);
        }
        const $span = createSpan(text, 'item-side');
        if (className !== undefined) {
            $span.classList.add(className);
        }
        this.$prependSpan.prepend($span);
        return $span;
    }
    append(text, className) {
        if (this.$appendSpan === null) {
            this.$appendSpan = createSpan('', 'append');
            this.element.appendChild(this.$appendSpan);
        }
        const $span = createSpan(text, 'item-side');
        if (className !== undefined) {
            $span.classList.add(className);
        }
        this.$appendSpan.appendChild($span);
        return $span;
    }
}
exports.ItemHandle = ItemHandle;
class Menu {
    constructor(name, parent, rectMode = RectMode_1.RectMode.OFF) {
        this.name = name;
        this.parent = parent;
        this.rectMode = rectMode;
        this.active = false;
        this.clearableElements = [];
        this.activateEvent = new Event_1.Event();
        this.debugLogger = new DebugLogger_1.DebugLogger('Menu', { name });
        this.fullPath = parent === null ? [] : parent.fullPath.slice();
        if (name !== '') {
            this.fullPath.push(name);
        }
        this.container = document.createElement('div');
        this.container.classList.add('menu', 'hidden');
        if (this.fullPath.length >= 1) {
            const path = document.createElement('div');
            path.classList.add('path');
            path.innerText = this.fullPath.join(' > ');
            this.container.appendChild(path);
        }
        if (parent !== null) {
            this.addItem('返回', { button: true, decoration: ItemDecoration.BACK, unclearable: true })
                .linkTo(parent);
        }
        document.body.appendChild(this.container);
        // 当显示模式变化时
        RectMode_1.rectModeChangeEvent.on(({ newRectMode }) => {
            // 如果自己是当前激活的菜单并且显示模式正在变化为全屏阅读器
            if (this.active && newRectMode === RectMode_1.RectMode.MAIN) {
                // 设置自己为非激活模式
                this.setActive(false);
                // 等待显示模式再次变化时
                RectMode_1.rectModeChangeEvent.expect().then(() => {
                    // 设置自己为激活模式
                    this.setActive(true);
                });
            }
        });
    }
    navigateTo(targetMenu) {
        this.setActive(false);
        targetMenu.setActive(true);
        RectMode_1.setRectMode(targetMenu.rectMode);
    }
    exit() {
        if (this.parent === null) {
            throw new Error('Cannot exit the root menu.');
        }
        this.navigateTo(this.parent);
    }
    setActive(active) {
        this.debugLogger.log(`setActive(${active})`);
        if (!this.active && active) {
            this.activateEvent.emit();
        }
        this.active = active;
        this.container.classList.toggle('hidden', !active);
    }
    isActive() {
        return this.active;
    }
    addItem(title, options) {
        let $element;
        if (options.button && options.link !== undefined) {
            $element = document.createElement('a');
            $element.href = options.link;
            $element.target = '_blank';
        }
        else {
            $element = document.createElement('div');
        }
        $element.innerText = title;
        if (options.small) {
            $element.classList.add('small');
        }
        if (options.button) {
            $element.classList.add('button');
            switch (options.decoration) {
                case ItemDecoration.BACK:
                    $element.classList.add('back');
                    break;
                case ItemDecoration.SELECTABLE:
                    $element.classList.add('selectable');
                    break;
                case ItemDecoration.ICON_FOLDER:
                    $element.classList.add('icon', 'folder');
                    break;
                case ItemDecoration.ICON_LINK:
                    $element.classList.add('icon', 'link');
                    break;
                case ItemDecoration.ICON_EQUALIZER:
                    $element.classList.add('icon', 'equalizer');
                    break;
                case ItemDecoration.ICON_FILE:
                    $element.classList.add('icon', 'file');
                    break;
                case ItemDecoration.ICON_GAME:
                    $element.classList.add('icon', 'game');
            }
        }
        this.container.appendChild($element);
        if (!options.unclearable) {
            this.clearableElements.push($element);
        }
        return new ItemHandle(this, $element);
    }
    clearItems() {
        this.clearableElements.forEach($element => $element.remove());
        this.clearableElements = [];
    }
    addLink(menu, smallButton, decoration) {
        return this.addItem(menu.name, { small: smallButton, button: true, decoration })
            .linkTo(menu);
    }
}
exports.Menu = Menu;

},{"./DebugLogger":5,"./Event":6,"./RectMode":9}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DebugLogger_1 = require("./DebugLogger");
const DOM_1 = require("./DOM");
const Event_1 = require("./Event");
var RectMode;
(function (RectMode) {
    RectMode[RectMode["SIDE"] = 0] = "SIDE";
    RectMode[RectMode["MAIN"] = 1] = "MAIN";
    RectMode[RectMode["OFF"] = 2] = "OFF";
})(RectMode = exports.RectMode || (exports.RectMode = {}));
const $rect = DOM_1.id('rect');
const debugLogger = new DebugLogger_1.DebugLogger('RectMode');
exports.rectModeChangeEvent = new Event_1.Event();
let rectMode = RectMode.OFF;
function setRectMode(newRectMode) {
    debugLogger.log(`${RectMode[rectMode]} -> ${RectMode[newRectMode]}`);
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
    exports.rectModeChangeEvent.emit({
        previousRectMode: rectMode,
        newRectMode,
    });
    rectMode = newRectMode;
}
exports.setRectMode = setRectMode;

},{"./DOM":4,"./DebugLogger":5,"./Event":6}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BlockMenu_1 = require("./BlockMenu");
const commentsControl_1 = require("./commentsControl");
const DOM_1 = require("./DOM");
const Menu_1 = require("./Menu");
const RectMode_1 = require("./RectMode");
const settings_1 = require("./settings");
const stylePreviewArticle_1 = require("./stylePreviewArticle");
class EnumSettingMenu extends Menu_1.Menu {
    constructor(parent, label, setting, usePreview) {
        super(`${label}设置`, parent, usePreview ? RectMode_1.RectMode.SIDE : RectMode_1.RectMode.MAIN);
        let currentHandle;
        if (usePreview) {
            this.activateEvent.on(() => {
                commentsControl_1.hideComments();
                DOM_1.id('content').innerHTML = stylePreviewArticle_1.stylePreviewArticle;
            });
        }
        setting.options.forEach((valueName, value) => {
            const handle = this.addItem(valueName, { small: true, button: true, decoration: Menu_1.ItemDecoration.SELECTABLE })
                .onClick(() => {
                currentHandle.setSelected(false);
                handle.setSelected(true);
                setting.setValue(value);
                currentHandle = handle;
            });
            if (value === setting.getValue()) {
                currentHandle = handle;
                handle.setSelected(true);
            }
        });
    }
}
exports.EnumSettingMenu = EnumSettingMenu;
class SettingsMenu extends Menu_1.Menu {
    constructor(parent) {
        super('设置', parent);
        this.addBooleanSetting('NSFW 警告', settings_1.warning);
        this.addBooleanSetting('使用动画', settings_1.animation);
        this.addBooleanSetting('显示编写中章节', settings_1.earlyAccess);
        this.addBooleanSetting('显示评论', settings_1.useComments);
        this.addBooleanSetting('手势切换章节（仅限手机）', settings_1.gestureSwitchChapter);
        this.addEnumSetting('字体', settings_1.fontFamily, true);
        this.addBooleanSetting('显示每个章节的字数', settings_1.charCount);
        this.addBooleanSetting('开发人员模式', settings_1.developerMode);
        this.addLink(new BlockMenu_1.BlockMenu(this), true);
    }
    addBooleanSetting(label, setting) {
        const getText = () => `${label}：${setting.getValue() ? '开' : '关'}`;
        const handle = this.addItem(getText(), { small: true, button: true })
            .onClick(() => {
            setting.toggle();
            handle.setInnerText(getText());
        });
    }
    addEnumSetting(label, setting, usePreview) {
        const getText = () => `${label}：${setting.getValueName()}`;
        const handle = this.addItem(getText(), { small: true, button: true });
        const enumSettingMenu = new EnumSettingMenu(this, label, setting, usePreview === true);
        handle.linkTo(enumSettingMenu).onClick(() => {
            this.activateEvent.once(() => {
                handle.setInnerText(getText());
            });
        });
    }
}
exports.SettingsMenu = SettingsMenu;

},{"./BlockMenu":1,"./DOM":4,"./Menu":8,"./RectMode":9,"./commentsControl":17,"./settings":27,"./stylePreviewArticle":30}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_1 = require("./data");
const Menu_1 = require("./Menu");
class StatsKeywordsCountMenu extends Menu_1.Menu {
    constructor(parent) {
        super('关键词统计', parent);
        this.addItem('添加其他关键词', {
            small: true,
            button: true,
            link: 'https://github.com/SCLeoX/Wearable-Technology/edit/master/src/builder/keywords.ts',
            decoration: Menu_1.ItemDecoration.ICON_LINK,
        });
        data_1.data.keywordsCount.forEach(([keyword, count]) => {
            this.addItem(`${keyword}：${count}`, { small: true });
        });
    }
}
exports.StatsKeywordsCountMenu = StatsKeywordsCountMenu;

},{"./Menu":8,"./data":18}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_1 = require("./data");
const Menu_1 = require("./Menu");
const StatsKeywordsCountMenu_1 = require("./StatsKeywordsCountMenu");
class StatsMenu extends Menu_1.Menu {
    constructor(parent) {
        super('统计', parent);
        this.addItem('统计数据由构建脚本自动生成', { small: true });
        this.addLink(new StatsKeywordsCountMenu_1.StatsKeywordsCountMenu(this), true, Menu_1.ItemDecoration.ICON_EQUALIZER);
        this.addItem(`总字数：${data_1.data.charsCount}`, { small: true });
        this.addItem(`总段落数：${data_1.data.paragraphsCount}`, { small: true });
    }
}
exports.StatsMenu = StatsMenu;

},{"./Menu":8,"./StatsKeywordsCountMenu":11,"./data":18}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commentsControl_1 = require("./commentsControl");
const DebugLogger_1 = require("./DebugLogger");
const DOM_1 = require("./DOM");
const Menu_1 = require("./Menu");
const RectMode_1 = require("./RectMode");
const stylePreviewArticle_1 = require("./stylePreviewArticle");
class Style {
    constructor(name, def) {
        this.name = name;
        this.def = def;
        this.styleSheet = null;
        this.debugLogger = new DebugLogger_1.DebugLogger('Style', { name });
    }
    injectStyleSheet() {
        const $style = document.createElement('style');
        document.head.appendChild($style);
        const sheet = $style.sheet;
        sheet.disabled = true;
        const attemptInsertRule = (rule) => {
            try {
                sheet.insertRule(rule);
            }
            catch (error) {
                this.debugLogger.error(`Failed to inject rule "${rule}".`, error);
            }
        };
        const key = `rgb(${this.def.keyColor.join(',')})`;
        const keyAlpha = (alpha) => `rgba(${this.def.keyColor.join(',')},${alpha})`;
        attemptInsertRule(`.container { color: ${key}; }`);
        attemptInsertRule(`.menu { color: ${key}; }`);
        attemptInsertRule(`.menu .button:active::after { background-color: ${key}; }`);
        attemptInsertRule(`.button::after { background-color: ${key}; }`);
        attemptInsertRule(`body { background-color: ${this.def.paperBgColor}; }`);
        attemptInsertRule(`.rect { background-color: ${this.def.rectBgColor}; }`);
        attemptInsertRule(`.rect.reading>div { background-color: ${this.def.paperBgColor}; }`);
        attemptInsertRule(`.rect.reading>div { color: ${key}; }`);
        attemptInsertRule(`.rect.reading>.content a { color: ${this.def.linkColor}; }`);
        attemptInsertRule(`.rect.reading>.content a:hover { color: ${this.def.linkHoverColor}; }`);
        attemptInsertRule(`.rect.reading>.content a:active { color: ${this.def.linkActiveColor}; }`);
        attemptInsertRule(`.rect.reading>.content>.earlyAccess.block { background-color: ${this.def.contentBlockEarlyAccessColor}; }`);
        attemptInsertRule(`.rect>.comments>div { background-color: ${this.def.commentColor}; }`);
        attemptInsertRule(`@media (min-width: 901px) { ::-webkit-scrollbar-thumb { background-color: ${this.def.paperBgColor}; } }`);
        attemptInsertRule(`.rect>.comments>.create-comment::before { background-color: ${key}; }`);
        attemptInsertRule(`:root { --key: ${key}; }`);
        attemptInsertRule(`:root { --key-opacity-01: ${keyAlpha(0.1)}; }`);
        attemptInsertRule(`:root { --key-opacity-05: ${keyAlpha(0.5)}; }`);
        attemptInsertRule(`:root { --key-opacity-007: ${keyAlpha(0.07)}; }`);
        attemptInsertRule(`:root { --key-opacity-004: ${keyAlpha(0.04)}; }`);
        attemptInsertRule(`:root { --button-color: ${this.def.commentColor}; }`);
        this.styleSheet = sheet;
    }
    active() {
        if (Style.currentlyEnabled !== null) {
            const currentlyEnabled = Style.currentlyEnabled;
            if (currentlyEnabled.styleSheet !== null) {
                currentlyEnabled.styleSheet.disabled = true;
            }
            currentlyEnabled.itemHandle.setSelected(false);
        }
        if (this.styleSheet === null) {
            this.injectStyleSheet();
        }
        this.styleSheet.disabled = false;
        this.itemHandle.setSelected(true);
        window.localStorage.setItem('style', this.name);
        Style.currentlyEnabled = this;
    }
}
Style.currentlyEnabled = null;
const darkKeyLinkColors = {
    linkColor: '#00E',
    linkHoverColor: '#F00',
    linkActiveColor: '#00E',
};
const lightKeyLinkColors = {
    linkColor: '#88F',
    linkHoverColor: '#F33',
    linkActiveColor: '#88F',
};
const styles = [
    new Style('可穿戴科技（默认）', Object.assign(Object.assign({ rectBgColor: '#444', paperBgColor: '#333', keyColor: [221, 221, 221] }, lightKeyLinkColors), { contentBlockEarlyAccessColor: '#E65100', commentColor: '#444', keyIsDark: false })),
    new Style('白纸', Object.assign(Object.assign({ rectBgColor: '#EFEFED', paperBgColor: '#FFF', keyColor: [0, 0, 0] }, darkKeyLinkColors), { contentBlockEarlyAccessColor: '#FFE082', commentColor: '#F5F5F5', keyIsDark: true })),
    new Style('夜间', Object.assign(Object.assign({ rectBgColor: '#272B36', paperBgColor: '#38404D', keyColor: [221, 221, 221] }, lightKeyLinkColors), { contentBlockEarlyAccessColor: '#E65100', commentColor: '#272B36', keyIsDark: false })),
    new Style('羊皮纸', Object.assign(Object.assign({ rectBgColor: '#D8D4C9', paperBgColor: '#F8F4E9', keyColor: [85, 40, 48] }, darkKeyLinkColors), { contentBlockEarlyAccessColor: '#FFE082', commentColor: '#F9EFD7', keyIsDark: true })),
    new Style('巧克力', Object.assign(Object.assign({ rectBgColor: '#2E1C11', paperBgColor: '#3A2519', keyColor: [221, 175, 153] }, lightKeyLinkColors), { contentBlockEarlyAccessColor: '#E65100', commentColor: '#2C1C11', keyIsDark: false })),
];
class StyleMenu extends Menu_1.Menu {
    constructor(parent) {
        super('阅读器样式', parent, RectMode_1.RectMode.SIDE);
        for (const style of styles) {
            style.itemHandle = this.addItem(style.name, { small: true, button: true, decoration: Menu_1.ItemDecoration.SELECTABLE })
                .onClick(() => {
                style.active();
            });
        }
        const usedStyle = window.localStorage.getItem('style');
        let flag = false;
        for (const style of styles) {
            if (usedStyle === style.name) {
                style.active();
                flag = true;
                break;
            }
        }
        if (!flag) {
            styles[0].active();
        }
        this.activateEvent.on(() => {
            commentsControl_1.hideComments();
            DOM_1.id('content').innerHTML = stylePreviewArticle_1.stylePreviewArticle;
        });
    }
}
exports.StyleMenu = StyleMenu;

},{"./DOM":4,"./DebugLogger":5,"./Menu":8,"./RectMode":9,"./commentsControl":17,"./stylePreviewArticle":30}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Menu_1 = require("./Menu");
const thanks_1 = require("./thanks");
class ThanksMenu extends Menu_1.Menu {
    constructor(parent) {
        super('鸣谢列表', parent);
        for (const person of thanks_1.thanks) {
            this.addItem(person.name, person.link === undefined
                ? { small: true }
                : { small: true, button: true, link: person.link, decoration: Menu_1.ItemDecoration.ICON_LINK });
        }
    }
}
exports.ThanksMenu = ThanksMenu;

},{"./Menu":8,"./thanks":31}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FlowReader_1 = require("../wtcd/FlowReader");
const WTCDError_1 = require("../wtcd/WTCDError");
const commentsControl_1 = require("./commentsControl");
const data_1 = require("./data");
const DebugLogger_1 = require("./DebugLogger");
const DOM_1 = require("./DOM");
const Event_1 = require("./Event");
const gestures_1 = require("./gestures");
const history_1 = require("./history");
const keyboard_1 = require("./keyboard");
const loadingText_1 = require("./loadingText");
const messages_1 = require("./messages");
const RectMode_1 = require("./RectMode");
const settings_1 = require("./settings");
const state_1 = require("./state");
const debugLogger = new DebugLogger_1.DebugLogger('chapterControl');
const $content = DOM_1.id('content');
const chaptersCache = new Map();
exports.loadChapterEvent = new Event_1.Event();
function closeChapter() {
    RectMode_1.setRectMode(RectMode_1.RectMode.OFF);
    state_1.state.currentChapter = null;
    state_1.state.chapterSelection = null;
    state_1.state.chapterTextNodes = null;
}
exports.closeChapter = closeChapter;
const select = ([anchorNodeIndex, anchorOffset, focusNodeIndex, focusOffset,]) => {
    if (state_1.state.chapterTextNodes === null) {
        return;
    }
    const anchorNode = state_1.state.chapterTextNodes[anchorNodeIndex];
    const focusNode = state_1.state.chapterTextNodes[focusNodeIndex];
    if (anchorNode === undefined || focusNode === undefined) {
        return;
    }
    document.getSelection().setBaseAndExtent(anchorNode, anchorOffset, focusNode, focusOffset);
    const element = anchorNode.parentElement;
    if (element !== null && (typeof element.scrollIntoView) === 'function') {
        element.scrollIntoView();
    }
};
const getFlexOneSpan = () => {
    const $span = document.createElement('span');
    $span.style.flex = '1';
    return $span;
};
const canChapterShown = (chapter) => settings_1.earlyAccess.getValue() || !chapter.isEarlyAccess;
const createContentBlock = (type, title, text) => {
    const $block = document.createElement('div');
    $block.classList.add('block', type);
    const $title = document.createElement('h1');
    $title.innerText = title;
    $block.appendChild($title);
    const $text = document.createElement('p');
    $text.innerText = text;
    $block.appendChild($text);
    return $block;
};
function loadPrevChapter() {
    const chapterCtx = state_1.state.currentChapter;
    if (chapterCtx === null) {
        return;
    }
    const chapterIndex = chapterCtx.inFolderIndex;
    if (chapterIndex >= 1 && canChapterShown(chapterCtx.folder.chapters[chapterIndex - 1])) {
        const prevChapter = chapterCtx.folder.chapters[chapterIndex - 1].htmlRelativePath;
        loadChapter(prevChapter);
        history_1.updateHistory(true);
    }
}
exports.loadPrevChapter = loadPrevChapter;
function loadNextChapter() {
    const chapterCtx = state_1.state.currentChapter;
    if (chapterCtx === null) {
        return;
    }
    const chapterIndex = chapterCtx.inFolderIndex;
    if (chapterIndex < chapterCtx.folder.chapters.length - 1 && canChapterShown(chapterCtx.folder.chapters[chapterIndex + 1])) {
        const nextChapter = chapterCtx.folder.chapters[chapterIndex + 1].htmlRelativePath;
        loadChapter(nextChapter);
        history_1.updateHistory(true);
    }
}
exports.loadNextChapter = loadNextChapter;
const finalizeChapterLoading = (selection) => {
    state_1.state.chapterTextNodes = DOM_1.getTextNodes($content);
    if (selection !== undefined) {
        if (DOM_1.id('warning') === null) {
            select(selection);
        }
        else {
            DOM_1.id('warning').addEventListener('click', () => {
                select(selection);
            });
        }
    }
    Array.from($content.getElementsByTagName('a')).forEach($anchor => $anchor.target = '_blank');
    Array.from($content.getElementsByTagName('code')).forEach($code => $code.addEventListener('dblclick', () => {
        DOM_1.selectNode($code);
    }));
    Array.from($content.getElementsByTagName('img')).forEach($image => {
        const src = $image.src;
        const lastDotIndex = src.lastIndexOf('.');
        const pathNoExtension = src.substr(0, lastDotIndex);
        if (pathNoExtension.endsWith('_low')) {
            const extension = src.substr(lastDotIndex + 1);
            const pathNoLowNoExtension = pathNoExtension.substr(0, pathNoExtension.length - 4);
            $image.style.cursor = 'zoom-in';
            $image.addEventListener('click', () => window.open(pathNoLowNoExtension + '.' + extension));
        }
    });
    const chapterCtx = state_1.state.currentChapter;
    const chapterIndex = chapterCtx.inFolderIndex;
    if (chapterCtx.chapter.isEarlyAccess) {
        const $block = createContentBlock('earlyAccess', '编写中章节', '请注意，本文正在编写中，因此可能会含有未完成的句子或是尚未更新的信息。');
        $content.prepend($block);
    }
    const $div = document.createElement('div');
    $div.style.display = 'flex';
    $div.style.marginTop = '2vw';
    if (chapterIndex >= 1 && canChapterShown(chapterCtx.folder.chapters[chapterIndex - 1])) {
        const prevChapter = chapterCtx.folder.chapters[chapterIndex - 1].htmlRelativePath;
        const $prevLink = document.createElement('a');
        $prevLink.innerText = '上一章';
        $prevLink.href = `${window.location.pathname}#${prevChapter}`;
        $prevLink.style.textAlign = 'left';
        $prevLink.style.flex = '1';
        $prevLink.addEventListener('click', event => {
            event.preventDefault();
            loadPrevChapter();
        });
        $div.appendChild($prevLink);
    }
    else {
        $div.appendChild(getFlexOneSpan());
    }
    const $menuLink = document.createElement('a');
    $menuLink.innerText = '返回菜单';
    $menuLink.href = window.location.pathname;
    $menuLink.style.textAlign = 'center';
    $menuLink.style.flex = '1';
    $menuLink.addEventListener('click', event => {
        event.preventDefault();
        closeChapter();
        history_1.updateHistory(true);
    });
    $div.appendChild($menuLink);
    if (chapterIndex < chapterCtx.folder.chapters.length - 1 && canChapterShown(chapterCtx.folder.chapters[chapterIndex + 1])) {
        const nextChapter = chapterCtx.folder.chapters[chapterIndex + 1].htmlRelativePath;
        const $nextLink = document.createElement('a');
        $nextLink.innerText = '下一章';
        $nextLink.href = `${window.location.pathname}#${nextChapter}`;
        $nextLink.style.textAlign = 'right';
        $nextLink.style.flex = '1';
        $nextLink.addEventListener('click', event => {
            event.preventDefault();
            loadNextChapter();
        });
        $div.appendChild($nextLink);
    }
    else {
        $div.appendChild(getFlexOneSpan());
    }
    $content.appendChild($div);
    commentsControl_1.loadComments(chapterCtx.chapter.commentsUrl);
    // fix for stupid scrolling issues under iOS
    DOM_1.id('rect').style.overflow = 'hidden';
    setTimeout(() => {
        DOM_1.id('rect').style.overflow = '';
        if (selection === undefined) {
            DOM_1.id('rect').scrollTo(0, 0);
        }
    }, 1);
    // Re-focus the rect so it is arrow-scrollable
    setTimeout(() => {
        DOM_1.id('rect').focus();
    }, 1);
};
gestures_1.swipeEvent.on(direction => {
    if (!settings_1.gestureSwitchChapter.getValue()) {
        return;
    }
    if (direction === gestures_1.SwipeDirection.TO_RIGHT) {
        // 上一章
        loadPrevChapter();
    }
    else if (direction === gestures_1.SwipeDirection.TO_LEFT) {
        // 下一章
        loadNextChapter();
    }
});
keyboard_1.arrowKeyPressEvent.on(arrowKey => {
    if (arrowKey === keyboard_1.ArrowKey.LEFT) {
        loadPrevChapter();
    }
    else if (arrowKey === keyboard_1.ArrowKey.RIGHT) {
        loadNextChapter();
    }
});
var ErrorType;
(function (ErrorType) {
    ErrorType[ErrorType["COMPILE"] = 0] = "COMPILE";
    ErrorType[ErrorType["RUNTIME"] = 1] = "RUNTIME";
    ErrorType[ErrorType["INTERNAL"] = 2] = "INTERNAL";
})(ErrorType || (ErrorType = {}));
function createWTCDErrorMessage({ errorType, message, stack, }) {
    const $target = document.createElement('div');
    const $title = document.createElement('h1');
    const $desc = document.createElement('p');
    switch (errorType) {
        case ErrorType.COMPILE:
            $title.innerText = messages_1.WTCD_ERROR_COMPILE_TITLE;
            $desc.innerText = messages_1.WTCD_ERROR_COMPILE_TITLE;
            break;
        case ErrorType.RUNTIME:
            $title.innerText = messages_1.WTCD_ERROR_RUNTIME_TITLE;
            $desc.innerText = messages_1.WTCD_ERROR_RUNTIME_DESC;
            break;
        case ErrorType.INTERNAL:
            $title.innerText = messages_1.WTCD_ERROR_INTERNAL_TITLE;
            $desc.innerText = messages_1.WTCD_ERROR_INTERNAL_DESC;
            break;
    }
    $target.appendChild($title);
    $target.appendChild($desc);
    const $message = document.createElement('p');
    $message.innerText = messages_1.WTCD_ERROR_MESSAGE + message;
    $target.appendChild($message);
    if (stack !== undefined) {
        const $stackTitle = document.createElement('h2');
        $stackTitle.innerText = messages_1.WTCD_ERROR_INTERNAL_STACK_TITLE;
        $target.appendChild($stackTitle);
        const $stackDesc = document.createElement('p');
        $stackDesc.innerText = messages_1.WTCD_ERROR_INTERNAL_STACK_DESC;
        $target.appendChild($stackDesc);
        const $pre = document.createElement('pre');
        const $code = document.createElement('code');
        $code.innerText = stack;
        $pre.appendChild($code);
        $target.appendChild($pre);
    }
    return $target;
}
function insertContent($target, content, chapter) {
    switch (chapter.type) {
        case 'Markdown':
            $target.innerHTML = content;
            break;
        case 'WTCD': {
            $target.innerHTML = '';
            const wtcdParseResult = JSON.parse(content);
            if (wtcdParseResult.error === true) {
                $target.appendChild(createWTCDErrorMessage({
                    errorType: ErrorType.COMPILE,
                    message: wtcdParseResult.message,
                    stack: wtcdParseResult.internalStack,
                }));
                break;
            }
            const flowInterface = new FlowReader_1.FlowReader(chapter.htmlRelativePath, wtcdParseResult.wtcdRoot, error => createWTCDErrorMessage({
                errorType: (error instanceof WTCDError_1.WTCDError)
                    ? ErrorType.RUNTIME
                    : ErrorType.INTERNAL,
                message: error.message,
                stack: error.stack,
            }));
            const $wtcdContainer = document.createElement('div');
            flowInterface.renderTo($wtcdContainer);
            $content.appendChild($wtcdContainer);
            break;
        }
    }
}
function loadChapter(chapterHtmlRelativePath, selection) {
    debugLogger.log('Load chapter', chapterHtmlRelativePath, 'selection', selection);
    commentsControl_1.hideComments();
    exports.loadChapterEvent.emit(chapterHtmlRelativePath);
    window.localStorage.setItem('lastRead', chapterHtmlRelativePath);
    RectMode_1.setRectMode(RectMode_1.RectMode.MAIN);
    const chapterCtx = data_1.relativePathLookUpMap.get(chapterHtmlRelativePath);
    state_1.state.currentChapter = chapterCtx;
    if (chaptersCache.has(chapterHtmlRelativePath)) {
        if (chaptersCache.get(chapterHtmlRelativePath) === null) {
            $content.innerText = loadingText_1.loadingText;
        }
        else {
            insertContent($content, chaptersCache.get(chapterHtmlRelativePath), chapterCtx.chapter);
            finalizeChapterLoading(selection);
        }
    }
    else {
        $content.innerText = loadingText_1.loadingText;
        fetch(`./chapters/${chapterHtmlRelativePath}`)
            .then(response => response.text())
            .then(text => {
            chaptersCache.set(chapterHtmlRelativePath, text);
            if (chapterCtx === state_1.state.currentChapter) {
                insertContent($content, text, chapterCtx.chapter);
                finalizeChapterLoading(selection);
            }
        });
    }
    return true;
}
exports.loadChapter = loadChapter;

},{"../wtcd/FlowReader":33,"../wtcd/WTCDError":36,"./DOM":4,"./DebugLogger":5,"./Event":6,"./RectMode":9,"./commentsControl":17,"./data":18,"./gestures":21,"./history":22,"./keyboard":24,"./loadingText":25,"./messages":26,"./settings":27,"./state":29}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Event_1 = require("./Event");
const blockedUsers = new Set(JSON.parse(window.localStorage.getItem('blockedUsers') || '[]'));
exports.blockedUserUpdateEvent = new Event_1.Event();
function saveBlockedUsers() {
    window.localStorage.setItem('blockedUsers', JSON.stringify(Array.from(blockedUsers)));
    exports.blockedUserUpdateEvent.emit();
}
function blockUser(userName) {
    blockedUsers.add(userName);
    saveBlockedUsers();
}
exports.blockUser = blockUser;
function unblockUser(userName) {
    blockedUsers.delete(userName);
    saveBlockedUsers();
}
exports.unblockUser = unblockUser;
function isUserBlocked(userName) {
    return blockedUsers.has(userName);
}
exports.isUserBlocked = isUserBlocked;
function getBlockedUsers() {
    return Array.from(blockedUsers);
}
exports.getBlockedUsers = getBlockedUsers;

},{"./Event":6}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commentBlockControl_1 = require("./commentBlockControl");
const DOM_1 = require("./DOM");
const formatTime_1 = require("./formatTime");
const messages_1 = require("./messages");
const settings_1 = require("./settings");
const $comments = DOM_1.id('comments');
const $commentsStatus = DOM_1.id('comments-status');
const $createComment = DOM_1.id('create-comment');
const getApiUrlRegExp = /^https:\/\/github\.com\/([a-zA-Z0-9-_]+)\/([a-zA-Z0-9-_]+)\/issues\/([1-9][0-9]*)$/;
function getApiUrl(issueUrl) {
    // Input sample: https://github.com/SCLeoX/Wearable-Technology/issues/1
    // Output sample: https://api.github.com/repos/SCLeoX/Wearable-Technology/issues/1/comments
    const result = getApiUrlRegExp.exec(issueUrl);
    if (result === null) {
        throw new Error(`Bad issue url: ${issueUrl}.`);
    }
    return `https://api.github.com/repos/${result[1]}/${result[2]}/issues/${result[3]}/comments`;
}
let nextRequestId = 1;
let currentRequestId = 0;
let currentCreateCommentLinkUrl = '';
$createComment.addEventListener('click', () => {
    window.open(currentCreateCommentLinkUrl, '_blank');
});
function createCommentElement(userAvatarUrl, userName, userUrl, createTime, updateTime, content) {
    const $comment = document.createElement('div');
    $comment.classList.add('comment');
    const $avatar = document.createElement('img');
    $avatar.classList.add('avatar');
    $avatar.src = userAvatarUrl;
    $comment.appendChild($avatar);
    const $author = document.createElement('a');
    $author.classList.add('author');
    $author.innerText = userName;
    $author.target = '_blank';
    $author.href = userUrl;
    $comment.appendChild($author);
    const $time = document.createElement('div');
    $time.classList.add('time');
    $time.innerText = createTime === updateTime
        ? formatTime_1.formatTime(new Date(createTime))
        : `${formatTime_1.formatTime(new Date(createTime))}（最后修改于 ${formatTime_1.formatTime(new Date(updateTime))}）`;
    $comment.appendChild($time);
    const $blockUser = document.createElement('a');
    $blockUser.classList.add('block-user');
    $blockUser.innerText = '屏蔽此人';
    $blockUser.onclick = () => {
        commentBlockControl_1.blockUser(userName);
        $comment.remove();
    };
    $comment.appendChild($blockUser);
    content.split('\n\n').forEach(paragraph => {
        const $p = document.createElement('p');
        $p.innerText = paragraph;
        $comment.appendChild($p);
    });
    return $comment;
}
// 为了确保 comments 在离场动画中存在，hideComments 和 showComments 应该只在入场动画前使用。
function hideComments() {
    $comments.classList.toggle('display-none', true);
    currentRequestId = 0;
}
exports.hideComments = hideComments;
function loadComments(issueUrl) {
    if (settings_1.useComments.getValue() === false) {
        return;
    }
    Array.from($comments.getElementsByClassName('comment')).forEach($element => $element.remove());
    $comments.classList.toggle('display-none', false);
    $createComment.classList.toggle('display-none', true);
    if (issueUrl === null) {
        $commentsStatus.innerText = messages_1.COMMENTS_UNAVAILABLE;
        return;
    }
    currentCreateCommentLinkUrl = issueUrl;
    const requestId = currentRequestId = nextRequestId++;
    const apiUrl = getApiUrl(issueUrl);
    $commentsStatus.innerText = messages_1.COMMENTS_LOADING;
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
        if (requestId !== currentRequestId) {
            return;
        }
        $commentsStatus.innerText = messages_1.COMMENTS_LOADED;
        data.forEach((comment) => {
            if (commentBlockControl_1.isUserBlocked(comment.user.login)) {
                return;
            }
            $comments.appendChild(createCommentElement(comment.user.avatar_url, comment.user.login, comment.user.html_url, comment.created_at, comment.updated_at, comment.body));
        });
        $createComment.classList.toggle('display-none', false);
    });
}
exports.loadComments = loadComments;

},{"./DOM":4,"./commentBlockControl":16,"./formatTime":20,"./messages":26,"./settings":27}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = window.DATA;
exports.relativePathLookUpMap = new Map();
function iterateFolder(folder) {
    folder.subFolders.forEach(subFolder => {
        iterateFolder(subFolder);
    });
    folder.chapters.forEach((chapter, index) => {
        exports.relativePathLookUpMap.set(chapter.htmlRelativePath, {
            folder,
            chapter,
            inFolderIndex: index,
        });
    });
}
iterateFolder(exports.data.chapterTree);

},{}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chapterControl_1 = require("./chapterControl");
const data_1 = require("./data");
const history_1 = require("./history");
const state_1 = require("./state");
function followQuery() {
    const chapterHtmlRelativePath = decodeURIComponent(window.location.hash.substr(1)); // Ignore the # in the result
    const chapterCtx = data_1.relativePathLookUpMap.get(chapterHtmlRelativePath);
    if (chapterCtx === undefined) {
        if (state_1.state.currentChapter !== null) {
            chapterControl_1.closeChapter();
            document.title = history_1.getTitle();
        }
        return;
    }
    if (state_1.state.currentChapter !== chapterCtx) {
        if (typeof URLSearchParams !== 'function') {
            chapterControl_1.loadChapter(chapterHtmlRelativePath);
        }
        else {
            const query = new URLSearchParams(window.location.search);
            const selectionQuery = query.get('selection');
            const selection = selectionQuery !== null
                ? selectionQuery.split(',').map(str => +str)
                : [];
            if (selection.length !== 4 || !selection.every(num => (num >= 0) && (num % 1 === 0) && (!Number.isNaN(num)) && (Number.isFinite(num)))) {
                chapterControl_1.loadChapter(chapterHtmlRelativePath);
            }
            else {
                chapterControl_1.loadChapter(chapterHtmlRelativePath, selection);
            }
            document.title = history_1.getTitle();
        }
    }
}
exports.followQuery = followQuery;

},{"./chapterControl":15,"./data":18,"./history":22,"./state":29}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MAX_RELATIVE_TIME = 7 * DAY;
function formatTime(time) {
    const relativeTime = Date.now() - time.getTime();
    if (relativeTime > MAX_RELATIVE_TIME) {
        return `${time.getFullYear()}/${time.getMonth() + 1}/${time.getDate()}`;
    }
    if (relativeTime > DAY) {
        return `${Math.floor(relativeTime / DAY)} 天前`;
    }
    if (relativeTime > HOUR) {
        return `${Math.floor(relativeTime / HOUR)} 小时前`;
    }
    if (relativeTime > MINUTE) {
        return `${Math.floor(relativeTime / MINUTE)} 分钟前`;
    }
    return `${Math.floor(relativeTime / SECOND)} 秒前`;
}
exports.formatTime = formatTime;

},{}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DebugLogger_1 = require("./DebugLogger");
const DOM_1 = require("./DOM");
const Event_1 = require("./Event");
var SwipeDirection;
(function (SwipeDirection) {
    SwipeDirection[SwipeDirection["TO_TOP"] = 0] = "TO_TOP";
    SwipeDirection[SwipeDirection["TO_RIGHT"] = 1] = "TO_RIGHT";
    SwipeDirection[SwipeDirection["TO_BOTTOM"] = 2] = "TO_BOTTOM";
    SwipeDirection[SwipeDirection["TO_LEFT"] = 3] = "TO_LEFT";
})(SwipeDirection = exports.SwipeDirection || (exports.SwipeDirection = {}));
const gestureMinWidth = 900;
exports.swipeEvent = new Event_1.Event();
const horizontalMinXProportion = 0.17;
const horizontalMaxYProportion = 0.1;
const verticalMinYProportion = 0.1;
const verticalMaxProportion = 0.1;
const swipeTimeThreshold = 500;
let startX = 0;
let startY = 0;
let startTime = 0;
let startTarget = null;
window.addEventListener('touchstart', event => {
    // Only listen for first touch starts
    if (event.touches.length !== 1) {
        return;
    }
    startTarget = event.target;
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
    startTime = Date.now();
});
window.addEventListener('touchend', event => {
    // Only listen for last touch ends
    if (event.touches.length !== 0) {
        return;
    }
    // Ignore touches that lasted too long
    if (Date.now() - startTime > swipeTimeThreshold) {
        return;
    }
    if (window.innerWidth > gestureMinWidth) {
        return;
    }
    const deltaX = event.changedTouches[0].clientX - startX;
    const deltaY = event.changedTouches[0].clientY - startY;
    const xProportion = Math.abs(deltaX / window.innerWidth);
    const yProportion = Math.abs(deltaY / window.innerHeight);
    if (xProportion > horizontalMinXProportion && yProportion < horizontalMaxYProportion) {
        // Horizontal swipe detected
        // Check for scrollable element
        if (DOM_1.isAnyParent(startTarget, $element => ((window.getComputedStyle($element).getPropertyValue('overflow-x') !== 'hidden') &&
            ($element.scrollWidth > $element.clientWidth)))) {
            return;
        }
        if (deltaX > 0) {
            exports.swipeEvent.emit(SwipeDirection.TO_RIGHT);
        }
        else {
            exports.swipeEvent.emit(SwipeDirection.TO_LEFT);
        }
    }
    else if (yProportion > verticalMinYProportion && xProportion < verticalMaxProportion) {
        // Vertical swipe detected
        // Check for scrollable element
        if (DOM_1.isAnyParent(startTarget, $element => ((window.getComputedStyle($element).getPropertyValue('overflow-y') !== 'hidden') &&
            ($element.scrollHeight > $element.clientHeight)))) {
            return;
        }
        if (deltaY > 0) {
            exports.swipeEvent.emit(SwipeDirection.TO_BOTTOM);
        }
        else {
            exports.swipeEvent.emit(SwipeDirection.TO_TOP);
        }
    }
});
const swipeEventDebugLogger = new DebugLogger_1.DebugLogger('swipeEvent');
exports.swipeEvent.on(direction => {
    swipeEventDebugLogger.log(SwipeDirection[direction]);
});

},{"./DOM":4,"./DebugLogger":5,"./Event":6}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const state_1 = require("./state");
function getTitle() {
    let title = '可穿戴科技';
    if (state_1.state.currentChapter !== null) {
        title += ' - ' + state_1.state.currentChapter.chapter.displayName;
    }
    return title;
}
exports.getTitle = getTitle;
function updateHistory(push) {
    const method = push ? window.history.pushState : window.history.replaceState;
    let query = window.location.pathname;
    if (state_1.state.currentChapter !== null) {
        if (state_1.state.chapterSelection !== null) {
            query += `?selection=${state_1.state.chapterSelection.join(',')}`;
        }
        query += '#' + state_1.state.currentChapter.chapter.htmlRelativePath;
    }
    const title = getTitle();
    document.title = title;
    method.call(window.history, null, title, query);
}
exports.updateHistory = updateHistory;

},{"./state":29}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_1 = require("./data");
const DOM_1 = require("./DOM");
const followQuery_1 = require("./followQuery");
const MainMenu_1 = require("./MainMenu");
const settings_1 = require("./settings");
const updateSelection_1 = require("./updateSelection");
const $warning = DOM_1.id('warning');
if ($warning !== null) {
    $warning.addEventListener('click', () => {
        $warning.style.opacity = '0';
        if (settings_1.animation.getValue()) {
            $warning.addEventListener('transitionend', () => {
                $warning.remove();
            });
        }
        else {
            $warning.remove();
        }
    });
}
const $buildNumber = DOM_1.id('build-number');
$buildNumber.innerText = `Build ${data_1.data.buildNumber}`;
new MainMenu_1.MainMenu().setActive(true);
document.addEventListener('selectionchange', () => {
    updateSelection_1.updateSelection();
});
window.addEventListener('popstate', () => {
    followQuery_1.followQuery();
});
followQuery_1.followQuery();

},{"./DOM":4,"./MainMenu":7,"./data":18,"./followQuery":19,"./settings":27,"./updateSelection":32}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DebugLogger_1 = require("./DebugLogger");
const Event_1 = require("./Event");
var ArrowKey;
(function (ArrowKey) {
    ArrowKey[ArrowKey["LEFT"] = 0] = "LEFT";
    ArrowKey[ArrowKey["UP"] = 1] = "UP";
    ArrowKey[ArrowKey["RIGHT"] = 2] = "RIGHT";
    ArrowKey[ArrowKey["DOWN"] = 3] = "DOWN";
})(ArrowKey = exports.ArrowKey || (exports.ArrowKey = {}));
exports.arrowKeyPressEvent = new Event_1.Event();
document.addEventListener('keyup', event => {
    switch (event.keyCode) {
        case 37:
            exports.arrowKeyPressEvent.emit(ArrowKey.LEFT);
            break;
        case 38:
            exports.arrowKeyPressEvent.emit(ArrowKey.UP);
            break;
        case 39:
            exports.arrowKeyPressEvent.emit(ArrowKey.RIGHT);
            break;
        case 40:
            exports.arrowKeyPressEvent.emit(ArrowKey.DOWN);
            break;
    }
});
const arrowEventDebugLogger = new DebugLogger_1.DebugLogger('arrowKeyEvent');
exports.arrowKeyPressEvent.on(arrowKey => {
    arrowEventDebugLogger.log(ArrowKey[arrowKey]);
});

},{"./DebugLogger":5,"./Event":6}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadingText = '加载中...';

},{}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMMENTS_UNAVAILABLE = '本文评论不可用。';
exports.COMMENTS_LOADING = '评论加载中...';
exports.COMMENTS_LOADED = '以下为本章节的评论区。（您可以在设置中禁用评论）';
exports.NO_BLOCKED_USERS = '没有用户的评论被屏蔽';
exports.CLICK_TO_UNBLOCK = '(点击用户名以解除屏蔽)';
exports.WTCD_ERROR_COMPILE_TITLE = 'WTCD 编译失败';
exports.WTCD_ERROR_COMPILE_DESC = '该 WTCD 文档在编译时发生了错误。请检查是否有语法错误或是其他基本错误。';
exports.WTCD_ERROR_RUNTIME_TITLE = 'WTCD 运行时错误';
exports.WTCD_ERROR_RUNTIME_DESC = '该 WTCD 文档在运行时发生了错误。请检查是否有逻辑错误。';
exports.WTCD_ERROR_INTERNAL_TITLE = 'WTCD 内部错误';
exports.WTCD_ERROR_INTERNAL_DESC = 'WTCD 解释器在解释执行该 WTCD 文档时崩溃了。请务必告诉琳你做了什么好让她来修。';
exports.WTCD_ERROR_MESSAGE = '错误信息：';
exports.WTCD_ERROR_INTERNAL_STACK_TITLE = '内部调用栈';
exports.WTCD_ERROR_INTERNAL_STACK_DESC = '内部调用栈记录了出现该错误时编译器或是解释器的状态。请注意内部调用栈通常只在调试 WTCD 编译器或是解释器时有用。内部调用栈通常对调试 WTCD 文档没有作用。';

},{}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const noop = () => { };
class BooleanSetting {
    constructor(key, defaultValue, onUpdate = noop) {
        this.key = key;
        this.onUpdate = onUpdate;
        if (defaultValue) {
            this.value = window.localStorage.getItem(key) !== 'false';
        }
        else {
            this.value = window.localStorage.getItem(key) === 'true';
        }
        this.updateLocalStorage();
        this.onUpdate(this.value);
    }
    updateLocalStorage() {
        window.localStorage.setItem(this.key, String(this.value));
    }
    getValue() {
        return this.value;
    }
    setValue(newValue) {
        if (newValue !== this.value) {
            this.onUpdate(newValue);
        }
        this.value = newValue;
        this.updateLocalStorage();
    }
    toggle() {
        this.setValue(!this.value);
    }
}
exports.BooleanSetting = BooleanSetting;
class EnumSetting {
    constructor(key, options, defaultValue, onUpdate = noop) {
        this.key = key;
        this.options = options;
        this.defaultValue = defaultValue;
        this.onUpdate = onUpdate;
        if (!this.isCorrectValue(defaultValue)) {
            throw new Error(`Default value ${defaultValue} is not correct.`);
        }
        this.value = +(window.localStorage.getItem(key) || defaultValue);
        this.correctValue();
        this.onUpdate(this.value, this.options[this.value]);
    }
    isCorrectValue(value) {
        return !(Number.isNaN(value) || value % 1 !== 0 || value < 0 || value >= this.options.length);
    }
    correctValue() {
        if (!this.isCorrectValue(this.value)) {
            this.value = this.defaultValue;
        }
    }
    updateLocalStorage() {
        window.localStorage.setItem(this.key, String(this.value));
    }
    getValue() {
        return this.value;
    }
    getValueName() {
        return this.options[this.value];
    }
    setValue(newValue) {
        if (newValue !== this.value) {
            this.onUpdate(newValue, this.options[newValue]);
        }
        this.value = newValue;
        this.updateLocalStorage();
    }
}
exports.EnumSetting = EnumSetting;
exports.animation = new BooleanSetting('animation', true, value => {
    setTimeout(() => {
        document.body.classList.toggle('animation-enabled', value);
    }, 1);
});
exports.warning = new BooleanSetting('warning', false);
exports.earlyAccess = new BooleanSetting('earlyAccess', false, value => {
    document.body.classList.toggle('early-access-disabled', !value);
});
exports.useComments = new BooleanSetting('useComments', true);
exports.gestureSwitchChapter = new BooleanSetting('gestureSwitchChapter', true);
// https://github.com/zenozeng/fonts.css
const fontFamilyCssValues = [
    '-apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif',
    'Baskerville, Georgia, "Liberation Serif", "Kaiti SC", STKaiti, "AR PL UKai CN", "AR PL UKai HK", "AR PL UKai TW", "AR PL UKai TW MBE", "AR PL KaitiM GB", KaiTi, KaiTi_GB2312, DFKai-SB, "TW\-Kai", serif',
    'Georgia, "Nimbus Roman No9 L", "Songti SC", "Noto Serif CJK SC", "Source Han Serif SC", "Source Han Serif CN", STSong, "AR PL New Sung", "AR PL SungtiL GB", NSimSun, SimSun, "TW\-Sung", "WenQuanYi Bitmap Song", "AR PL UMing CN", "AR PL UMing HK", "AR PL UMing TW", "AR PL UMing TW MBE", PMingLiU, MingLiU, serif',
    'Baskerville, "Times New Roman", "Liberation Serif", STFangsong, FangSong, FangSong_GB2312, "CWTEX\-F", serif',
];
exports.fontFamily = new EnumSetting('fontFamily', ['黑体', '楷体', '宋体', '仿宋'], 0, (fontFamilyIndex) => {
    document.documentElement.style.setProperty('--font-family', fontFamilyCssValues[fontFamilyIndex]);
    document.documentElement.style.setProperty('--font-family-mono', '"Fira Code", ' + fontFamilyCssValues[fontFamilyIndex]);
});
exports.developerMode = new BooleanSetting('developerMode', false);
exports.charCount = new BooleanSetting('charCount', true, value => {
    document.body.classList.toggle('char-count-disabled', !value);
});

},{}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function shortNumber(input) {
    if (input < 1000) {
        return String(input);
    }
    if (input < 1000000) {
        return (input / 1000).toFixed(1) + 'k';
    }
    return (input / 1000000).toFixed(1) + 'M';
}
exports.shortNumber = shortNumber;

},{}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.state = {
    currentChapter: null,
    chapterSelection: null,
    chapterTextNodes: null,
};

},{}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stylePreviewArticle = `<h1>午饭</h1>
<p><em>作者：友人♪B</em></p>
<p>“午饭，午饭♪”</p>
<p>阳伞下的琳，很是期待今天的午饭。</p>
<p>或许是体质和别的血族不太一样，琳能够感知到食物的味道，似乎也保有着生物对食物的喜爱。</p>
<p>虽然她并不能从这些食物中获取能量就是。</p>
<p>学校食堂的夏季限定甜点今天也很是抢手，这点从队伍的长度就能看出来——队伍险些就要超出食堂的范围了。</p>
<p>“你说我要有钱多好——”</p>
<p>已经从隔壁窗口买下了普通，但是很便宜的营养餐的秋镜悬，看着队伍中兴致勃勃的琳。</p>
<p>其实她并不是缺钱，大约是吝啬。</p>
<p>这得怪她娘，穷养秋镜悬养习惯了，现在她光自己除灵退魔挣来的外快都够她奢侈上一把了，可却还保留着能不花钱绝对不花，必须花钱越少越好的吝啬习惯。</p>
<p>少顷，琳已经带着她的甜品建筑——每块砖头都是一块蛋糕，堆成一个诡异的火柴盒——来到了桌前。</p>
<p>“（吃不胖真好，有钱真好……”</p>
<p>血族的听觉自然是捕捉到了秋镜悬的嘀咕，琳放下盘子，悄咪咪地将牙贴上了秋镜悬的脖颈。</p>
<p>“嘻嘻♪”</p>
<p>“呜——”</p>
<p>盯——</p>
<p>秋镜悬看了看盘中剩下的一块毛血旺，似是联系到了什么，将目光转向了琳的牙。</p>
<p>正在享用蛋糕盛宴的琳以余光瞥见了她的视线，</p>
<p>“盯着本小姐是要做什么呢？”</p>
<p>“啊，没，没什么……”</p>
<p>秋镜悬支支吾吾的说着，</p>
<p>“就是好奇一个问题，血族为什么不吃毛血旺……”</p>
<p>“噢☆毛血旺就是那个煮熟的血块是吧？太没有美感了这种血！而且吃了也没法儿恢复能量，简直就是血液的绝佳浪费☆！”</p>
<p>琳发出了对这样美食的鄙视，不过这种鄙视大约只有血族和蚊子会出现吧……</p>
<p>“血族需要摄入血，是因为血所具有的生命能量，如果煮熟了的话，超过九成的能量都被转化成其他的东西了，对我们来说实在是没什么用处，还白白浪费了作为原料的血，这种东西本小姐才不吃咧✘！饿死，死外边，从这边跳下去也不吃✘！”</p>
<p>“欸，别这么说嘛，你能尝得到味道的吧，吃一块试试呗？”</p>
<p>“真……真香♪”</p>
<p>当晚，因为触发了真香定律而感到很火大的琳，把秋镜悬丢进了自己的高维空间里头放置了一晚上（高维时间三天）泄愤。</p>`;

},{}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.thanks = [
    { name: '神楽坂 立音' },
    { name: 'lgd_小翅膀' },
    { name: '青葉' },
    { name: 'kn' },
    { name: 'F74nk', link: 'https://t.me/F74nk_K' },
    { name: '杨佳文' },
    { name: '不知名的N姓人士就好' },
    { name: '某不愿透露姓名的N性？' },
    { name: '神楽坂 萌绫' },
    { name: 'Butby' },
    { name: '友人♪B' },
    { name: 'NekoCaffeine' },
    { name: 'RainSlide' },
    { name: 'czp', link: 'https://www.hiczp.com' },
    { name: 'kookxiang' },
    { name: '櫻川 紗良' },
    { name: 'Skimige' },
    { name: 'TExL', link: 'http://texas.penguin-logistics.cn' },
    { name: '路人乙' },
    { name: 'pokemonchw', link: 'https://github.com/pokemonchw' },
    { name: '帕蒂卡', link: 'https://github.com/Patika-ailemait' },
    { name: '零件', link: 'https://nekosc.com' },
    { name: '幻梦', link: 'https://t.me/HuanmengQwQ' },
    { name: 'acted咕咕喵', link: 'https://acted.gitlab.io' },
    { name: '重水时雨', link: 'https://t.me/boatmasteronD2O' },
    { name: '神楽坂 紫' },
    { name: 'Runian Lee', link: 'https://t.me/Runian' },
].sort(() => Math.random() - 0.5);

},{}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const history_1 = require("./history");
const state_1 = require("./state");
function updateSelection() {
    if (state_1.state.chapterTextNodes === null) {
        return;
    }
    const before = String(state_1.state.chapterSelection);
    const selection = document.getSelection();
    if (selection === null) {
        state_1.state.chapterSelection = null;
    }
    else {
        const anchor = ((selection.anchorNode instanceof HTMLElement)
            ? selection.anchorNode.firstChild
            : selection.anchorNode);
        const anchorNodeIndex = state_1.state.chapterTextNodes.indexOf(anchor);
        const focus = ((selection.focusNode instanceof HTMLElement)
            ? selection.focusNode.firstChild
            : selection.focusNode);
        const focusNodeIndex = state_1.state.chapterTextNodes.indexOf(focus);
        if ((anchorNodeIndex === -1) || (focusNodeIndex === -1) ||
            (anchorNodeIndex === focusNodeIndex && selection.anchorOffset === selection.focusOffset)) {
            state_1.state.chapterSelection = null;
        }
        else {
            if ((anchorNodeIndex < focusNodeIndex) ||
                (anchorNodeIndex === focusNodeIndex && selection.anchorOffset < selection.focusOffset)) {
                state_1.state.chapterSelection = [
                    anchorNodeIndex,
                    selection.anchorOffset,
                    focusNodeIndex,
                    selection.focusOffset,
                ];
            }
            else {
                state_1.state.chapterSelection = [
                    focusNodeIndex,
                    selection.focusOffset,
                    anchorNodeIndex,
                    selection.anchorOffset,
                ];
            }
        }
    }
    if (before !== String(state_1.state.chapterSelection)) {
        history_1.updateHistory(false);
    }
}
exports.updateSelection = updateSelection;

},{"./history":22,"./state":29}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Interpreter_1 = require("./Interpreter");
const Random_1 = require("./Random");
/**
 * This is one of the possible implementation of a WTCD reader.
 *
 * In this implementation, all new content and buttons are appended to a single
 * HTML element. The user is expected to continuously scroll down the page in
 * order to read more, thus the name "flow reader".
 *
 * This reader implementation persists data via memorizing all users' decisions.
 * When restoring a previous session, it replays all decisions.
 *
 * Since all decisions are recorded, this implementation allows the user to undo
 * decisions, in which case, it resets the interpreter and replay all decisions
 * until the decision that is being undone. This means, however, if the logic of
 * WTCD section is extremely complicated and takes a long time to compute, it
 * will potentially lag user's interface every time the user undoes a decision.
 */
class FlowReader {
    constructor(docIdentifier, wtcdRoot, errorMessageCreator) {
        this.wtcdRoot = wtcdRoot;
        this.errorMessageCreator = errorMessageCreator;
        /** Which decision the current buttons are for */
        this.currentDecisionIndex = 0;
        /** Buttons for each group of output */
        this.buttons = [];
        /** Content output after each decision */
        this.contents = [];
        this.started = false;
        this.storageKey = `wtcd.fr.${docIdentifier}`;
        this.data = this.parseData(window.localStorage.getItem(this.storageKey)) || {
            random: String(Math.random()),
            decisions: [],
        };
        this.resetInterpreter();
    }
    /**
     * Verify and parse data stored in localStorage.
     */
    parseData(data) {
        if (typeof data !== 'string') {
            return null;
        }
        let obj;
        try {
            obj = JSON.parse(data);
        }
        catch (error) {
            return null;
        }
        if (typeof obj.random !== 'string') {
            return null;
        }
        if (!Array.isArray(obj.decisions)) {
            return null;
        }
        if (obj.decisions.some((decision) => typeof decision !== 'number')) {
            return null;
        }
        return obj;
    }
    /** Fancy name for "save" */
    persist() {
        window.localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }
    /**
     * Calls this.interpreterIterator.next() and handles error.
     */
    next(decision) {
        try {
            return this.interpreterIterator.next(decision);
        }
        catch (error) {
            const $errorMessage = this.errorMessageCreator(error);
            this.target.appendChild($errorMessage);
            this.contents.push($errorMessage);
            return {
                done: true,
                value: {
                    choices: [],
                    content: [],
                },
            };
        }
    }
    /** Restart the interpreter and reset the interpreterIterator */
    resetInterpreter() {
        const interpreter = new Interpreter_1.Interpreter(this.wtcdRoot, new Random_1.Random(this.data.random));
        this.interpreterIterator = interpreter.start();
    }
    /**
     * Make a decision at currentDecisionIndex and update buttons accordingly
     *
     * @param decision the index of choice to be made
     * @param replay whether this is during a replay; If true, the decision will
     * not be added to data.
     */
    decide(decision, replay = false) {
        this.buttons[this.currentDecisionIndex].forEach(($button, choiceIndex) => {
            if ($button.classList.contains('disabled')) {
                return;
            }
            $button.classList.remove('candidate');
            if (choiceIndex === decision) {
                $button.classList.add('selected');
            }
            else {
                $button.classList.add('unselected');
            }
        });
        if (!replay) {
            this.data.decisions.push(decision);
        }
        // Advance current decision index
        this.currentDecisionIndex++;
        const yieldValue = this.next(decision);
        this.handleOutput(yieldValue.value);
        return yieldValue.done;
    }
    /**
     * Undo a decision made previously; It also removes every decision after the
     * specified decision.
     *
     * @param decisionIndex which decision to be undone
     */
    undecide(decisionIndex) {
        this.resetInterpreter();
        // Clear those no longer needed content
        this.data.decisions.splice(decisionIndex);
        this.buttons.splice(decisionIndex + 1);
        this.contents.splice(decisionIndex + 1)
            .forEach($deletedContent => $deletedContent.remove());
        // Replay
        this.next();
        for (const decision of this.data.decisions) {
            this.next(decision);
        }
        // Update current decision's buttons so they become available to click
        // again.
        this.buttons[decisionIndex].forEach($button => {
            if (!$button.classList.contains('disabled')) {
                $button.classList.remove('selected', 'unselected');
                $button.classList.add('candidate');
            }
        });
        this.currentDecisionIndex = decisionIndex;
    }
    /**
     * Handle an instance of output from the interpreter. This will add the
     * content output and buttons to target.
     *
     * @param output the content output to be added
     */
    handleOutput(output) {
        // Create a container for all elements involved so deletion will be easier.
        const $container = document.createElement('div');
        output.content.forEach($element => $container.appendChild($element));
        const decisionIndex = this.currentDecisionIndex;
        this.buttons.push(output.choices.map((choice, choiceIndex) => {
            const $button = document.createElement('div');
            $button.classList.add('wtcd-button');
            $button.innerText = choice.content;
            if (choice.disabled) {
                $button.classList.add('disabled');
            }
            else {
                $button.classList.add('candidate');
                $button.addEventListener('click', () => {
                    if (this.data.decisions[decisionIndex] === choiceIndex) {
                        this.undecide(decisionIndex);
                        this.persist();
                    }
                    else if (this.currentDecisionIndex === decisionIndex) {
                        this.decide(choiceIndex);
                        this.persist();
                    }
                });
            }
            $container.appendChild($button);
            return $button;
        }));
        this.contents.push($container);
        this.target.appendChild($container);
    }
    renderTo($target) {
        if (this.started) {
            throw new Error('Flow Interface already started.');
        }
        this.started = true;
        this.target = $target;
        const init = this.next();
        let done = init.done;
        this.handleOutput(init.value);
        for (const decision of this.data.decisions) {
            if (done) {
                return;
            }
            done = this.decide(decision, true);
        }
    }
}
exports.FlowReader = FlowReader;

},{"./Interpreter":34,"./Random":35}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constantsPool_1 = require("./constantsPool");
const operators_1 = require("./operators");
const WTCDError_1 = require("./WTCDError");
var BubbleSignalType;
(function (BubbleSignalType) {
    BubbleSignalType[BubbleSignalType["YIELD"] = 0] = "YIELD";
    BubbleSignalType[BubbleSignalType["RETURN"] = 1] = "RETURN";
})(BubbleSignalType || (BubbleSignalType = {}));
/**
 * Bubble signal is used for traversing upward the call stack. It is implemented
 * with JavaScript's Error. Such signal might be yield or return.
 */
class BubbleSignal extends Error {
    constructor(type) {
        super('Uncaught Bubble Signal.');
        this.type = type;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
/**
 * Create a string describing a runtime value including its type and value.
 */
function describe(rv) {
    switch (rv.type) {
        case 'number':
        case 'boolean':
            return `${rv.type} ${rv.value}`;
        case 'string':
            return `string "${rv.value}"`;
        case 'choice':
            return `a choice for action ${describe(rv.value.action)} with label "${rv.value.text}"`;
        case 'action':
            switch (rv.value.action) {
                case 'goto':
                    return `an action for goto to ${rv.value.target}`;
                case 'exit':
                    return `an action for exiting`;
            }
        case 'null':
            return 'null';
        case 'selection':
            return `a selection among the following choices: [${rv.value.choices.map(describe).join(', ')}]`;
    }
}
exports.describe = describe;
class RuntimeScope {
    constructor() {
        this.variables = new Map();
        this.registers = null;
    }
    /**
     * Attempt to resolve the given variable name within this scope. If variable
     * is not found, return null.
     *
     * @param variableName
     * @returns
     */
    resolveVariableReference(variableName) {
        return this.variables.get(variableName) || null;
    }
    addVariable(variableName, type, value) {
        this.variables.set(variableName, { type, value });
    }
    addRegister(registerName) {
        if (this.registers === null) {
            this.registers = new Map();
        }
        this.registers.set(registerName, constantsPool_1.getMaybePooled('null', null));
    }
    /**
     * If a register with given name exists on this scope, set the value of it and
     * return true. Otherwise, return false.
     *
     * @param registerName name of register
     * @param value value to set to
     * @returns whether the requested register is found
     */
    setRegisterIfExist(registerName, value) {
        if (this.registers === null) {
            return false;
        }
        if (!this.registers.has(registerName)) {
            return false;
        }
        this.registers.set(registerName, value);
        return true;
    }
    getRegister(registerName) {
        return this.registers && this.registers.get(registerName) || null;
    }
}
class InvalidChoiceError extends Error {
    constructor(choiceId) {
        super(`Invalid choice ${choiceId}.`);
        this.choiceId = choiceId;
    }
}
exports.InvalidChoiceError = InvalidChoiceError;
class Interpreter {
    constructor(wtcdRoot, random) {
        this.wtcdRoot = wtcdRoot;
        this.random = random;
        this.scopes = [new RuntimeScope()];
        this.sectionStack = [];
        this.resolveVariableReference = (variableName) => {
            for (let i = this.scopes.length - 1; i >= 0; i--) {
                const variable = this.scopes[i].resolveVariableReference(variableName);
                if (variable !== null) {
                    return variable;
                }
            }
            throw WTCDError_1.WTCDError.atUnknown(`Cannot resolve variable reference "${variableName}". ` +
                `This is most likely caused by WTCD compiler's error or the compiled output ` +
                `has been modified`);
        };
        this.evaluator = (expr) => {
            switch (expr.type) {
                case 'unaryExpression':
                    return operators_1.unaryOperators.get(expr.operator).fn(expr, this.evaluator);
                case 'binaryExpression':
                    return operators_1.binaryOperators.get(expr.operator).fn(expr, this.evaluator, this.resolveVariableReference);
                case 'booleanLiteral':
                    return constantsPool_1.getMaybePooled('boolean', expr.value);
                case 'numberLiteral':
                    return constantsPool_1.getMaybePooled('number', expr.value);
                case 'stringLiteral':
                    return constantsPool_1.getMaybePooled('string', expr.value);
                case 'nullLiteral':
                    return constantsPool_1.getMaybePooled('null', null);
                case 'choiceExpression':
                    return this.evaluateChoiceExpression(expr);
                case 'conditionalExpression':
                    return this.evaluateConditionalExpression(expr);
                case 'block':
                    return this.evaluateBlockExpression(expr);
                case 'gotoAction':
                    return {
                        type: 'action',
                        value: {
                            action: 'goto',
                            target: expr.sections,
                        },
                    };
                case 'exitAction':
                    return {
                        type: 'action',
                        value: {
                            action: 'exit',
                        },
                    };
                case 'selection':
                    return this.evaluateSelectionExpression(expr);
                case 'variableReference':
                    // RuntimeValues are immutable by nature so we don't need to worry about
                    // anything changing the values of our variables.
                    return this.resolveVariableReference(expr.variableName);
            }
        };
        this.started = false;
        this.sectionEnterTimes = new Map();
        this.currentlyBuilding = [];
        this.sectionStack.push(this.wtcdRoot.sections[0]);
    }
    /**
     * Iterate through the scopes and set the first register with registerName to
     * given value.
     *
     * @param registerName The name of register to look for
     * @param value The value to set to
     */
    setRegister(registerName, value) {
        for (let i = this.scopes.length - 1; i >= 0; i--) {
            if (this.scopes[i].setRegisterIfExist(registerName, value)) {
                return;
            }
        }
        throw WTCDError_1.WTCDError.atUnknown(`Cannot resolve register reference "${registerName}". ` +
            `This is mostly likely caused by WTCD compiler's error or the compiled output ` +
            `has been modified`);
    }
    getCurrentScope() {
        return this.scopes[this.scopes.length - 1];
    }
    pushScope() {
        const scope = new RuntimeScope();
        this.scopes.push(scope);
        return scope;
    }
    popScope() {
        this.scopes.pop();
    }
    evaluateChoiceExpression(expr) {
        const text = this.evaluator(expr.text);
        if (text.type !== 'string') {
            throw WTCDError_1.WTCDError.atLocation(expr, `First argument of choice is expected to be a string, ` +
                `received: ${describe(text)}`);
        }
        const action = this.evaluator(expr.action);
        if (action.type !== 'action' && action.type !== 'null') {
            throw WTCDError_1.WTCDError.atLocation(expr, `First argument of choice is expected to be an action ` +
                `or null, received: ${describe(text)}`);
        }
        return {
            type: 'choice',
            value: {
                text: text.value,
                action,
            },
        };
    }
    evaluateConditionalExpression(expr) {
        const condition = this.evaluator(expr.condition);
        if (condition.type !== 'boolean') {
            throw WTCDError_1.WTCDError.atLocation(expr, `First argument of a conditional expression is expected to ` +
                `be a boolean, received: ${describe(condition)}`);
        }
        // Only evaluate the necessary branch
        if (condition.value) {
            return this.evaluator(expr.then);
        }
        else {
            return this.evaluator(expr.otherwise);
        }
    }
    executeDeclarationStatement(expr) {
        for (const singleDeclaration of expr.declarations) {
            let value;
            if (singleDeclaration.initialValue !== null) {
                value = this.evaluator(singleDeclaration.initialValue);
            }
            else {
                switch (singleDeclaration.variableType) {
                    case 'boolean':
                        value = constantsPool_1.getMaybePooled('boolean', false);
                        break;
                    case 'number':
                        value = constantsPool_1.getMaybePooled('number', 0);
                        break;
                    case 'string':
                        value = constantsPool_1.getMaybePooled('string', '');
                        break;
                    default:
                        throw WTCDError_1.WTCDError.atLocation(expr, `Variable type ${singleDeclaration.variableType} ` +
                            `does not have a default initial value`);
                }
            }
            if (value.type !== singleDeclaration.variableType) {
                throw WTCDError_1.WTCDError.atLocation(expr, `The type of variable ${singleDeclaration.variableName} is ` +
                    `${singleDeclaration.variableType}, thus cannot hold ${describe(value)}`);
            }
            this.getCurrentScope().addVariable(singleDeclaration.variableName, singleDeclaration.variableType, value.value);
        }
    }
    evaluateBlockExpression(expr) {
        const scope = this.pushScope();
        scope.addRegister('yield');
        try {
            for (const statement of expr.statements) {
                this.executeStatement(statement);
            }
            return scope.getRegister('yield');
        }
        catch (error) {
            if ((error instanceof BubbleSignal) && (error.type === BubbleSignalType.YIELD)) {
                return scope.getRegister('yield');
            }
            throw error;
        }
        finally {
            this.popScope();
        }
    }
    evaluateSelectionExpression(expr) {
        const choices = expr.choices
            .map(choiceExpr => this.evaluator(choiceExpr))
            .filter(choice => choice.type !== 'null');
        for (let i = 0; i < choices.length; i++) {
            if (choices[i].type !== 'choice') {
                throw WTCDError_1.WTCDError.atLocation(expr.choices[i], `Choice at index ${i} is expected to be a choice, ` +
                    `received ${describe(choices[i])}`);
            }
        }
        return {
            type: 'selection',
            value: {
                choices: choices,
            },
        };
    }
    executeStatement(statement) {
        switch (statement.type) {
            case 'declaration':
                this.executeDeclarationStatement(statement);
                return;
            case 'expression':
                this.evaluator(statement.expression);
                return;
            case 'yield':
                this.setRegister('yield', this.evaluator(statement.value));
                throw new BubbleSignal(BubbleSignalType.YIELD); // Bubble up
            case 'setYield':
                this.setRegister('yield', this.evaluator(statement.value));
                return;
            default:
                throw WTCDError_1.WTCDError.atLocation(statement, 'Not implemented');
        }
    }
    addToSectionStack(sectionName) {
        for (const section of this.wtcdRoot.sections) {
            if (section.name === sectionName) {
                this.sectionStack.push(section);
                return;
            }
        }
        throw WTCDError_1.WTCDError.atUnknown(`Unknown section "${sectionName}"`);
    }
    executeAction(action) {
        switch (action.value.action) {
            case 'goto':
                for (let i = action.value.target.length - 1; i >= 0; i--) {
                    this.addToSectionStack(action.value.target[i]);
                }
                break;
            case 'exit':
                // Clears the section stack so the scripts end immediately
                this.sectionStack.length = 0;
        }
    }
    *start() {
        if (this.started) {
            throw new Error('Interpretation has already started.');
        }
        this.started = true;
        try {
            // Initialization
            for (const statement of this.wtcdRoot.initStatements) {
                this.executeStatement(statement);
            }
            const $host = document.createElement('div');
            while (this.sectionStack.length !== 0) {
                const currentSection = this.sectionStack.pop();
                // Evaluate the executes clause
                if (currentSection.executes !== null) {
                    this.evaluator(currentSection.executes);
                }
                /** Times this section has been entered including this time */
                const enterTime = this.sectionEnterTimes.has(currentSection.name)
                    ? this.sectionEnterTimes.get(currentSection.name) + 1
                    : 1;
                this.sectionEnterTimes.set(currentSection.name, enterTime);
                /** Content that fits within the bounds */
                const eligibleSectionContents = currentSection.content.filter(content => (content.lowerBound === undefined || content.lowerBound <= enterTime) &&
                    (content.upperBound === undefined || content.upperBound >= enterTime));
                if (eligibleSectionContents.length !== 0) {
                    const selectedContent = eligibleSectionContents[this.random.nextInt(0, eligibleSectionContents.length)];
                    $host.innerHTML = selectedContent.html;
                    // Parameterize
                    for (const variable of selectedContent.variables) {
                        $host.getElementsByClassName(variable.elementClass)[0]
                            .innerText = String(this.resolveVariableReference(variable.variableName).value);
                    }
                    let $current = $host.firstChild;
                    while ($current !== null) {
                        if ($current instanceof HTMLElement) {
                            this.currentlyBuilding.push($current);
                        }
                        $current = $current.nextSibling;
                    }
                }
                const then = this.evaluator(currentSection.then);
                // The part after then has to be a selection or an action
                if (then.type === 'selection') {
                    const choices = then.value.choices.map(choice => ({
                        content: choice.value.text,
                        disabled: choice.value.action.type === 'null',
                    }));
                    const yieldValue = {
                        content: this.currentlyBuilding,
                        choices,
                    };
                    this.currentlyBuilding = [];
                    // Hands over control so player can make a decision
                    const playerChoiceIndex = yield yieldValue;
                    const playerChoice = then.value.choices[playerChoiceIndex];
                    if (playerChoice === undefined || playerChoice.value.action.type === 'null') {
                        throw new InvalidChoiceError(playerChoiceIndex);
                    }
                    this.executeAction(playerChoice.value.action);
                }
                else if (then.type === 'action') {
                    this.executeAction(then);
                }
                else if (then.type !== 'null') {
                    throw WTCDError_1.WTCDError.atLocation(currentSection.then, `Expression after then is expected to return ` +
                        `selection, action, or null. Received: ${describe(then)}`);
                }
            }
        }
        catch (error) {
            if (error instanceof BubbleSignal) {
                throw WTCDError_1.WTCDError.atUnknown(`Uncaught BubbleSignal with type "${error.type}".`);
            }
            throw error;
        }
        return {
            content: this.currentlyBuilding,
            choices: [],
        };
    }
}
exports.Interpreter = Interpreter;

},{"./WTCDError":36,"./constantsPool":37,"./operators":38}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Convert a string to 32 bit hash
 * https://stackoverflow.com/a/47593316
 */
function xmur3(strSeed) {
    let h = 1779033703 ^ strSeed.length;
    for (let i = 0; i < strSeed.length; i++) {
        h = Math.imul(h ^ strSeed.charCodeAt(i), 3432918353),
            h = h << 13 | h >>> 19;
    }
    return () => {
        h = Math.imul(h ^ h >>> 16, 2246822507);
        h = Math.imul(h ^ h >>> 13, 3266489909);
        return (h ^= h >>> 16) >>> 0;
    };
}
/**
 * Create a seeded random number generator using the four passed in 32 bit
 * number as seeds.
 * https://stackoverflow.com/a/47593316
 *
 * @param a seed
 * @param b seed
 * @param c seed
 * @param d seed
 * @returns seeded random number generator
 */
function sfc32(a, b, c, d) {
    return () => {
        a >>>= 0;
        b >>>= 0;
        c >>>= 0;
        d >>>= 0;
        let t = (a + b) | 0;
        a = b ^ b >>> 9;
        b = c + (c << 3) | 0;
        c = (c << 21 | c >>> 11);
        d = d + 1 | 0;
        t = t + d | 0;
        c = c + t | 0;
        return (t >>> 0) / 4294967296;
    };
}
class Random {
    constructor(seed) {
        const seedFn = xmur3(seed);
        this.rng = sfc32(seedFn(), seedFn(), seedFn(), seedFn());
    }
    next(low = 0, high = 1) {
        return this.rng() * (high - low) + low;
    }
    nextBool() {
        return this.rng() < 0.5;
    }
    nextInt(low = 0, high = 1) {
        return Math.floor(this.next(low, high));
    }
}
exports.Random = Random;

},{}],36:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class WTCDError extends Error {
    constructor(message, line, column) {
        super(message);
        this.line = line;
        this.column = column;
        this.name = 'WTCDError';
    }
    static atUnknown(message) {
        return new WTCDError(message + ` at unknown location. (Location info `
            + `is not available for this type of error)`, null, null);
    }
    static atLineColumn(line, column, message) {
        return new WTCDError(message + ` at ${line}:${column}.`, line, column);
    }
    static atLocation(location, message) {
        if (location.line === undefined) {
            return new WTCDError(message + ' at unknown location. (Try recompile in '
                + 'debug mode to enable source map)', null, null);
        }
        else {
            return this.atLineColumn(location.line, location.column, message);
        }
    }
}
exports.WTCDError = WTCDError;

},{}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Your typical immature optimization
// Caches null values, boolean values, and small integers to somewhat reduce GC
exports.nullValue = { type: 'null', value: null };
exports.trueValue = { type: 'boolean', value: true };
exports.falseValue = { type: 'boolean', value: false };
exports.smallIntegers = [];
for (let i = 0; i <= 100; i++) {
    exports.smallIntegers.push({
        type: 'number',
        value: i,
    });
}
function booleanValue(value) {
    return value ? exports.trueValue : exports.falseValue;
}
exports.booleanValue = booleanValue;
function getMaybePooled(type, value) {
    if (type === 'null') {
        return exports.nullValue;
    }
    if (type === 'boolean') {
        return booleanValue(value);
    }
    if (type === 'number' && value >= 0 && value <= 100) {
        return exports.smallIntegers[value];
    }
    return {
        type,
        value,
    };
}
exports.getMaybePooled = getMaybePooled;

},{}],38:[function(require,module,exports){
"use strict";
// This file defines all infix and prefix operators in WTCD.
Object.defineProperty(exports, "__esModule", { value: true });
const constantsPool_1 = require("./constantsPool");
const Interpreter_1 = require("./Interpreter");
const WTCDError_1 = require("./WTCDError");
exports.unaryOperators = new Map([
    ['-', {
            precedence: 16,
            fn: (expr, evaluator) => {
                const arg = evaluator(expr.arg);
                if (arg.type !== 'number') {
                    throw WTCDError_1.WTCDError.atLocation(expr, `Unary operator "-" can only be applied ` +
                        `to a number. Received: ${Interpreter_1.describe(arg)}`);
                }
                return constantsPool_1.getMaybePooled('number', -arg.value);
            },
        }],
    ['!', {
            precedence: 16,
            fn: (expr, evaluator) => {
                const arg = evaluator(expr.arg);
                if (arg.type !== 'boolean') {
                    throw WTCDError_1.WTCDError.atLocation(expr, `Unary operator "!" can only be applied ` +
                        `to a boolean. Received: ${Interpreter_1.describe(arg)}`);
                }
                return constantsPool_1.getMaybePooled('boolean', !arg.value);
            },
        }],
]);
function autoEvaluated(fn) {
    return (expr, evaluator, resolveVariableReference) => {
        const arg0 = evaluator(expr.arg0);
        const arg1 = evaluator(expr.arg1);
        return fn(arg0, arg1, expr, evaluator, resolveVariableReference);
    };
}
function autoEvaluatedSameTypeArg(argType, returnType, fn) {
    return autoEvaluated((arg0, arg1, expr, evaluator, resolveVariableReference) => {
        if (arg0.type === argType && arg1.type === argType) {
            // TypeScript is not smart enough to do the conversion here
            return constantsPool_1.getMaybePooled(returnType, fn(arg0.value, arg1.value, expr, evaluator, resolveVariableReference));
        }
        else {
            throw WTCDError_1.WTCDError.atLocation(expr, `Binary operator "${expr.operator}" can only be ` +
                `applied to two ${argType}s. Received: ${Interpreter_1.describe(arg0)} (left) and ` +
                `${Interpreter_1.describe(arg1)} (right)`);
        }
    });
}
function opAssignment(arg0Type, // Type of the variable
arg1Type, fn) {
    return (expr, evaluator, resolveVariableReference) => {
        if (expr.arg0.type !== 'variableReference') {
            throw WTCDError_1.WTCDError.atLocation(expr, `Left side of binary operator "${expr.operator}" ` +
                `has to be a variable reference`);
        }
        const varRef = resolveVariableReference(expr.arg0.variableName);
        if (varRef.type !== arg0Type) {
            throw WTCDError_1.WTCDError.atLocation(expr, `Left side of binary operator "${expr.operator}" has to be a ` +
                `variable of type ${arg0Type}, actual type: ${varRef.type}`);
        }
        const arg1 = evaluator(expr.arg1);
        if (arg1.type !== arg1Type) {
            throw WTCDError_1.WTCDError.atLocation(expr, `Right side of binary operator "${expr.operator}" ` +
                ` has to be a ${arg1Type}. Received: ${Interpreter_1.describe(arg1)}`);
        }
        const newValue = fn(varRef.value, arg1.value, expr, evaluator, resolveVariableReference);
        varRef.value = newValue;
        return constantsPool_1.getMaybePooled(arg0Type, newValue);
    };
}
exports.binaryOperators = new Map([
    ['=', {
            precedence: 3,
            fn: (expr, evaluator, resolveVariableReference) => {
                if (expr.arg0.type !== 'variableReference') {
                    throw WTCDError_1.WTCDError.atLocation(expr, `Left side of binary operator "=" has to be a ` +
                        `variable reference`);
                }
                const varRef = resolveVariableReference(expr.arg0.variableName);
                const arg1 = evaluator(expr.arg1);
                if (arg1.type !== varRef.type) {
                    throw WTCDError_1.WTCDError.atLocation(expr, `Variable "${expr.arg0.variableName}" can only hold ` +
                        `values of type ${varRef.type}. Received ${Interpreter_1.describe(arg1)}`);
                }
                varRef.value = arg1.value;
                return arg1;
            },
        }],
    ['+=', {
            precedence: 3,
            fn: (expr, evaluator, resolveVariableReference) => {
                if (expr.arg0.type !== 'variableReference') {
                    throw WTCDError_1.WTCDError.atLocation(expr, `Left side of binary operator "+=" ` +
                        `has to be a variable reference`);
                }
                const varRef = resolveVariableReference(expr.arg0.variableName);
                if (varRef.type !== 'string' && varRef.type !== 'number') {
                    throw WTCDError_1.WTCDError.atLocation(expr, `Left side of binary operator "+=" has to be a ` +
                        `variable of type number or string, actual type: ${varRef.type}`);
                }
                const arg1 = evaluator(expr.arg1);
                if (arg1.type !== varRef.type) {
                    throw WTCDError_1.WTCDError.atLocation(expr, `Right side of binary operator "+=" has to ` +
                        ` be a ${varRef.type}. Received: ${Interpreter_1.describe(arg1)}`);
                }
                const newValue = varRef.value + arg1.value;
                varRef.value = newValue;
                return constantsPool_1.getMaybePooled(varRef.type, newValue);
            },
        }],
    ['-=', {
            precedence: 3,
            fn: opAssignment('number', 'number', (arg0Raw, arg1Raw) => arg0Raw - arg1Raw),
        }],
    ['*=', {
            precedence: 3,
            fn: opAssignment('number', 'number', (arg0Raw, arg1Raw) => arg0Raw * arg1Raw),
        }],
    ['/=', {
            precedence: 3,
            fn: opAssignment('number', 'number', (arg0Raw, arg1Raw) => arg0Raw / arg1Raw),
        }],
    ['~/=', {
            precedence: 3,
            fn: opAssignment('number', 'number', (arg0Raw, arg1Raw) => Math.trunc(arg0Raw / arg1Raw)),
        }],
    ['%=', {
            precedence: 3,
            fn: opAssignment('number', 'number', (arg0Raw, arg1Raw) => arg0Raw % arg1Raw),
        }],
    ['||', {
            precedence: 5,
            fn: (expr, evaluator) => {
                const arg0 = evaluator(expr.arg0);
                if (arg0.type !== 'boolean') {
                    throw WTCDError_1.WTCDError.atLocation(expr, `Left side of binary operator "||" has to be a boolean. ` +
                        `Received ${Interpreter_1.describe(arg0)}`);
                }
                if (arg0.value === true) {
                    return constantsPool_1.getMaybePooled('boolean', true);
                }
                const arg1 = evaluator(expr.arg1); // Short-circuit evaluation
                if (arg1.type !== 'boolean') {
                    throw WTCDError_1.WTCDError.atLocation(expr, `Right side of binary operator "||" has to be a boolean. ` +
                        `Received ${Interpreter_1.describe(arg1)}`);
                }
                return constantsPool_1.getMaybePooled('boolean', arg1.value);
            },
        }],
    ['&&', {
            precedence: 6,
            fn: (expr, evaluator) => {
                const arg0 = evaluator(expr.arg0);
                if (arg0.type !== 'boolean') {
                    throw WTCDError_1.WTCDError.atLocation(expr, `Left side of binary operator "&&" has to be a boolean. ` +
                        `Received ${Interpreter_1.describe(arg0)}`);
                }
                if (arg0.value === false) {
                    return constantsPool_1.getMaybePooled('boolean', false);
                }
                const arg1 = evaluator(expr.arg1); // Short-circuit evaluation
                if (arg1.type !== 'boolean') {
                    throw WTCDError_1.WTCDError.atLocation(expr, `Right side of binary operator "&&" has to be a boolean. ` +
                        `Received ${Interpreter_1.describe(arg1)}`);
                }
                return constantsPool_1.getMaybePooled('boolean', arg1.value);
            },
        }],
    ['==', {
            precedence: 10,
            fn: autoEvaluated((arg0, arg1) => (constantsPool_1.getMaybePooled('boolean', (arg0.type === arg1.type) && (arg0.value === arg1.value)))),
        }],
    ['!=', {
            precedence: 10,
            fn: autoEvaluated((arg0, arg1) => (constantsPool_1.getMaybePooled('boolean', (arg0.type !== arg1.type) || (arg0.value !== arg1.value)))),
        }],
    ['<', {
            precedence: 11,
            fn: autoEvaluatedSameTypeArg('number', 'boolean', (arg0Raw, arg1Raw) => arg0Raw < arg1Raw),
        }],
    ['<=', {
            precedence: 11,
            fn: autoEvaluatedSameTypeArg('number', 'boolean', (arg0Raw, arg1Raw) => arg0Raw <= arg1Raw),
        }],
    ['>', {
            precedence: 11,
            fn: autoEvaluatedSameTypeArg('number', 'boolean', (arg0Raw, arg1Raw) => arg0Raw > arg1Raw),
        }],
    ['>=', {
            precedence: 11,
            fn: autoEvaluatedSameTypeArg('number', 'boolean', (arg0Raw, arg1Raw) => arg0Raw >= arg1Raw),
        }],
    ['+', {
            precedence: 13,
            fn: autoEvaluated((arg0, arg1, expr) => {
                if (arg0.type === 'number' && arg1.type === 'number') {
                    return constantsPool_1.getMaybePooled('number', arg0.value + arg1.value);
                }
                else if (arg0.type === 'string' && arg1.type === 'string') {
                    return constantsPool_1.getMaybePooled('string', arg0.value + arg1.value);
                }
                else {
                    throw WTCDError_1.WTCDError.atLocation(expr, `Binary operator "+" can only be applied to two ` +
                        `strings or two numbers. Received: ${Interpreter_1.describe(arg0)} (left) and ` +
                        `${Interpreter_1.describe(arg1)} (right)`);
                }
            }),
        }],
    ['-', {
            precedence: 13,
            fn: autoEvaluatedSameTypeArg('number', 'number', (arg0Raw, arg1Raw) => arg0Raw + arg1Raw),
        }],
    ['*', {
            precedence: 14,
            fn: autoEvaluatedSameTypeArg('number', 'number', (arg0Raw, arg1Raw) => arg0Raw * arg1Raw),
        }],
    ['/', {
            precedence: 14,
            fn: autoEvaluatedSameTypeArg('number', 'number', (arg0Raw, arg1Raw) => arg0Raw / arg1Raw),
        }],
    ['~/', {
            precedence: 14,
            fn: autoEvaluatedSameTypeArg('number', 'number', (arg0Raw, arg1Raw) => Math.trunc(arg0Raw / arg1Raw)),
        }],
    ['%', {
            precedence: 14,
            fn: autoEvaluatedSameTypeArg('number', 'number', (arg0Raw, arg1Raw) => arg0Raw % arg1Raw),
        }],
]);
exports.conditionalOperatorPrecedence = 4;
exports.operators = new Set([...exports.unaryOperators.keys(), ...exports.binaryOperators.keys(), '?', ':']);

},{"./Interpreter":34,"./WTCDError":36,"./constantsPool":37}]},{},[23]);
