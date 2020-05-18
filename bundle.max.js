(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
/*!
 * Cross-Browser Split 1.1.1
 * Copyright 2007-2012 Steven Levithan <stevenlevithan.com>
 * Available under the MIT License
 * ECMAScript compliant, uniform cross-browser split method
 */

/**
 * Splits a string into an array of strings using a regex or string separator. Matches of the
 * separator are not included in the result array. However, if `separator` is a regex that contains
 * capturing groups, backreferences are spliced into the result each time `separator` is matched.
 * Fixes browser bugs compared to the native `String.prototype.split` and can be used reliably
 * cross-browser.
 * @param {String} str String to split.
 * @param {RegExp|String} separator Regex or string to use for separating the string.
 * @param {Number} [limit] Maximum number of items to include in the result array.
 * @returns {Array} Array of substrings.
 * @example
 *
 * // Basic use
 * split('a b c d', ' ');
 * // -> ['a', 'b', 'c', 'd']
 *
 * // With limit
 * split('a b c d', ' ', 2);
 * // -> ['a', 'b']
 *
 * // Backreferences in result array
 * split('..word1 word2..', /([a-z]+)(\d+)/i);
 * // -> ['..', 'word', '1', ' ', 'word', '2', '..']
 */
module.exports = (function split(undef) {

  var nativeSplit = String.prototype.split,
    compliantExecNpcg = /()??/.exec("")[1] === undef,
    // NPCG: nonparticipating capturing group
    self;

  self = function(str, separator, limit) {
    // If `separator` is not a regex, use `nativeSplit`
    if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
      return nativeSplit.call(str, separator, limit);
    }
    var output = [],
      flags = (separator.ignoreCase ? "i" : "") + (separator.multiline ? "m" : "") + (separator.extended ? "x" : "") + // Proposed for ES6
      (separator.sticky ? "y" : ""),
      // Firefox 3+
      lastLastIndex = 0,
      // Make `global` and avoid `lastIndex` issues by working with a copy
      separator = new RegExp(separator.source, flags + "g"),
      separator2, match, lastIndex, lastLength;
    str += ""; // Type-convert
    if (!compliantExecNpcg) {
      // Doesn't need flags gy, but they don't hurt
      separator2 = new RegExp("^" + separator.source + "$(?!\\s)", flags);
    }
    /* Values for `limit`, per the spec:
     * If undefined: 4294967295 // Math.pow(2, 32) - 1
     * If 0, Infinity, or NaN: 0
     * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
     * If negative number: 4294967296 - Math.floor(Math.abs(limit))
     * If other: Type-convert, then use the above rules
     */
    limit = limit === undef ? -1 >>> 0 : // Math.pow(2, 32) - 1
    limit >>> 0; // ToUint32(limit)
    while (match = separator.exec(str)) {
      // `separator.lastIndex` is not reliable cross-browser
      lastIndex = match.index + match[0].length;
      if (lastIndex > lastLastIndex) {
        output.push(str.slice(lastLastIndex, match.index));
        // Fix browsers whose `exec` methods don't consistently return `undefined` for
        // nonparticipating capturing groups
        if (!compliantExecNpcg && match.length > 1) {
          match[0].replace(separator2, function() {
            for (var i = 1; i < arguments.length - 2; i++) {
              if (arguments[i] === undef) {
                match[i] = undef;
              }
            }
          });
        }
        if (match.length > 1 && match.index < str.length) {
          Array.prototype.push.apply(output, match.slice(1));
        }
        lastLength = match[0].length;
        lastLastIndex = lastIndex;
        if (output.length >= limit) {
          break;
        }
      }
      if (separator.lastIndex === match.index) {
        separator.lastIndex++; // Avoid an infinite loop
      }
    }
    if (lastLastIndex === str.length) {
      if (lastLength || !separator.test("")) {
        output.push("");
      }
    } else {
      output.push(str.slice(lastLastIndex));
    }
    return output.length > limit ? output.slice(0, limit) : output;
  };

  return self;
})();

},{}],3:[function(require,module,exports){
// contains, add, remove, toggle
var indexof = require('indexof')

module.exports = ClassList

function ClassList(elem) {
    var cl = elem.classList

    if (cl) {
        return cl
    }

    var classList = {
        add: add
        , remove: remove
        , contains: contains
        , toggle: toggle
        , toString: $toString
        , length: 0
        , item: item
    }

    return classList

    function add(token) {
        var list = getTokens()
        if (indexof(list, token) > -1) {
            return
        }
        list.push(token)
        setTokens(list)
    }

    function remove(token) {
        var list = getTokens()
            , index = indexof(list, token)

        if (index === -1) {
            return
        }

        list.splice(index, 1)
        setTokens(list)
    }

    function contains(token) {
        return indexof(getTokens(), token) > -1
    }

    function toggle(token) {
        if (contains(token)) {
            remove(token)
            return false
        } else {
            add(token)
            return true
        }
    }

    function $toString() {
        return elem.className
    }

    function item(index) {
        var tokens = getTokens()
        return tokens[index] || null
    }

    function getTokens() {
        var className = elem.className

        return filter(className.split(" "), isTruthy)
    }

    function setTokens(list) {
        var length = list.length

        elem.className = list.join(" ")
        classList.length = length

        for (var i = 0; i < list.length; i++) {
            classList[i] = list[i]
        }

        delete list[length]
    }
}

function filter (arr, fn) {
    var ret = []
    for (var i = 0; i < arr.length; i++) {
        if (fn(arr[i])) ret.push(arr[i])
    }
    return ret
}

function isTruthy(value) {
    return !!value
}

},{"indexof":5}],4:[function(require,module,exports){
var split = require('browser-split')
var ClassList = require('class-list')

var w = typeof window === 'undefined' ? require('html-element') : window
var document = w.document
var Text = w.Text

function context () {

  var cleanupFuncs = []

  function h() {
    var args = [].slice.call(arguments), e = null
    function item (l) {
      var r
      function parseClass (string) {
        // Our minimal parser doesn’t understand escaping CSS special
        // characters like `#`. Don’t use them. More reading:
        // https://mathiasbynens.be/notes/css-escapes .

        var m = split(string, /([\.#]?[^\s#.]+)/)
        if(/^\.|#/.test(m[1]))
          e = document.createElement('div')
        forEach(m, function (v) {
          var s = v.substring(1,v.length)
          if(!v) return
          if(!e)
            e = document.createElement(v)
          else if (v[0] === '.')
            ClassList(e).add(s)
          else if (v[0] === '#')
            e.setAttribute('id', s)
        })
      }

      if(l == null)
        ;
      else if('string' === typeof l) {
        if(!e)
          parseClass(l)
        else
          e.appendChild(r = document.createTextNode(l))
      }
      else if('number' === typeof l
        || 'boolean' === typeof l
        || l instanceof Date
        || l instanceof RegExp ) {
          e.appendChild(r = document.createTextNode(l.toString()))
      }
      //there might be a better way to handle this...
      else if (isArray(l))
        forEach(l, item)
      else if(isNode(l))
        e.appendChild(r = l)
      else if(l instanceof Text)
        e.appendChild(r = l)
      else if ('object' === typeof l) {
        for (var k in l) {
          if('function' === typeof l[k]) {
            if(/^on\w+/.test(k)) {
              (function (k, l) { // capture k, l in the closure
                if (e.addEventListener){
                  e.addEventListener(k.substring(2), l[k], false)
                  cleanupFuncs.push(function(){
                    e.removeEventListener(k.substring(2), l[k], false)
                  })
                }else{
                  e.attachEvent(k, l[k])
                  cleanupFuncs.push(function(){
                    e.detachEvent(k, l[k])
                  })
                }
              })(k, l)
            } else {
              // observable
              e[k] = l[k]()
              cleanupFuncs.push(l[k](function (v) {
                e[k] = v
              }))
            }
          }
          else if(k === 'style') {
            if('string' === typeof l[k]) {
              e.style.cssText = l[k]
            }else{
              for (var s in l[k]) (function(s, v) {
                if('function' === typeof v) {
                  // observable
                  e.style.setProperty(s, v())
                  cleanupFuncs.push(v(function (val) {
                    e.style.setProperty(s, val)
                  }))
                } else
                  var match = l[k][s].match(/(.*)\W+!important\W*$/);
                  if (match) {
                    e.style.setProperty(s, match[1], 'important')
                  } else {
                    e.style.setProperty(s, l[k][s])
                  }
              })(s, l[k][s])
            }
          } else if(k === 'attrs') {
            for (var v in l[k]) {
              e.setAttribute(v, l[k][v])
            }
          }
          else if (k.substr(0, 5) === "data-") {
            e.setAttribute(k, l[k])
          } else {
            e[k] = l[k]
          }
        }
      } else if ('function' === typeof l) {
        //assume it's an observable!
        var v = l()
        e.appendChild(r = isNode(v) ? v : document.createTextNode(v))

        cleanupFuncs.push(l(function (v) {
          if(isNode(v) && r.parentElement)
            r.parentElement.replaceChild(v, r), r = v
          else
            r.textContent = v
        }))
      }

      return r
    }
    while(args.length)
      item(args.shift())

    return e
  }

  h.cleanup = function () {
    for (var i = 0; i < cleanupFuncs.length; i++){
      cleanupFuncs[i]()
    }
    cleanupFuncs.length = 0
  }

  return h
}

var h = module.exports = context()
h.context = context

function isNode (el) {
  return el && el.nodeName && el.nodeType
}

function forEach (arr, fn) {
  if (arr.forEach) return arr.forEach(fn)
  for (var i = 0; i < arr.length; i++) fn(arr[i], i)
}

function isArray (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]'
}



},{"browser-split":2,"class-list":3,"html-element":1}],5:[function(require,module,exports){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const materialDarkColors_1 = require("./constant/materialDarkColors");
const settings_1 = require("./data/settings");
const stringHash_1 = require("./util/stringHash");
class DebugLogger {
    constructor(name) {
        this.prefix = '%c' + name;
        this.css = `background-color: #` +
            materialDarkColors_1.materialDarkColors[Math.abs(stringHash_1.stringHash(name)) % materialDarkColors_1.materialDarkColors.length] +
            '; border-radius: 0.3em; padding: 0 0.3em; color: white';
    }
    log(...stuff) {
        if (!settings_1.developerMode.getValue()) {
            return;
        }
        console.info(this.prefix, this.css, ...stuff);
    }
    warn(...stuff) {
        console.warn(this.prefix, this.css, ...stuff);
    }
    error(...stuff) {
        console.error(this.prefix, this.css, ...stuff);
    }
}
exports.DebugLogger = DebugLogger;

},{"./constant/materialDarkColors":10,"./data/settings":34,"./util/stringHash":56}],7:[function(require,module,exports){
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
        this.queue.forEach(task => task());
        this.queue.length = 0;
    }
}
exports.Event = Event;

},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const layoutControl_1 = require("./control/layoutControl");
const DebugLogger_1 = require("./DebugLogger");
const Event_1 = require("./Event");
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
    constructor(name, parent, layout = layoutControl_1.Layout.OFF) {
        this.name = name;
        this.parent = parent;
        this.layout = layout;
        this.active = false;
        this.clearableElements = [];
        this.activateEvent = new Event_1.Event();
        this.debugLogger = new DebugLogger_1.DebugLogger(`Menu (${name})`);
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
        layoutControl_1.layoutChangeEvent.on(({ newLayout }) => {
            // 如果自己是当前激活的菜单并且显示模式正在变化为全屏阅读器
            if (this.active && newLayout === layoutControl_1.Layout.MAIN) {
                // 设置自己为非激活模式
                this.setActive(false);
                // 等待显示模式再次变化时
                layoutControl_1.layoutChangeEvent.expect().then(() => {
                    // 设置自己为激活模式
                    this.setActive(true);
                });
            }
        });
    }
    navigateTo(targetMenu) {
        this.setActive(false);
        targetMenu.setActive(true);
        layoutControl_1.setLayout(targetMenu.layout);
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
            $element.rel = 'noopener noreferrer';
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

},{"./DebugLogger":6,"./Event":7,"./control/layoutControl":27}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadingText = '加载中...';

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// https://material.io/resources/color/
exports.materialDarkColors = [
    'b71c1c',
    '880e4f',
    '4a148c',
    '311b92',
    '1a237e',
    '0d47a1',
    '01579b',
    '006064',
    '004d40',
    '1b5e20',
    '33691e',
    '827717',
    'bf360c',
    '3e2723',
    '795548',
    '5d4037',
    '1976d2',
    '303f9f',
    '3f51b5',
    '673ab7',
    '9c27b0',
    'c2185b',
    'd32f2f',
    '263238',
    '455a64',
    '616161',
    '212121',
];

},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EARLY_ACCESS_TITLE = '编写中章节';
exports.EARLY_ACCESS_DESC = '请注意，本文正在编写中，因此可能会含有未完成的句子或是尚未更新的信息。';
exports.PREVIOUS_CHAPTER = '上一章';
exports.GO_TO_MENU = '返回';
exports.NEXT_CHAPTER = '下一章';
exports.CHAPTER_LOADING = '章节加载中...';
exports.CHAPTER_FAILED = '章节加载失败，请检查网络连接。';
exports.COMMENTS_SECTION = '评论区';
exports.COMMENTS_LOADING = '评论加载中...';
exports.COMMENTS_UNAVAILABLE = '本文评论不可用。';
exports.COMMENTS_CREATE = '+ 添加评论';
exports.COMMENTS_LOADED = '以下为本章节的评论区。';
exports.COMMENTS_FAILED = '评论加载失败，请检查网络连接。';
exports.NO_BLOCKED_USERS = '没有用户的评论被屏蔽';
exports.CLICK_TO_UNBLOCK = '(点击用户名以解除屏蔽)';
exports.WTCD_GAME_RESTART = '重置游戏';
exports.WTCD_GAME_RESTART_TITLE = '是否重置游戏种子';
exports.WTCD_GAME_RESTART_DESC = '游戏种子会决定游戏的随机因素。';
exports.WTCD_GAME_RESTART_ALL_DESC = '若选择【重置游戏种子与进度】，那么新游戏中的所有随机因素和本游戏不一致。';
exports.WTCD_GAME_RESTART_DECISION_ONLY_DESC = '若选择【仅重置进度】，那么新游戏中的随机因素将与本游戏完全一致。';
exports.WTCD_GAME_RESTART_ALL = '重置游戏种子与进度';
exports.WTCD_GAME_RESTART_DECISION_ONLY = '仅重置进度';
exports.WTCD_GAME_RESTART_CANCEL = '不重置任何内容';
exports.WTCD_GAME_RESTART_OK = '游戏重置成功';
exports.WTCD_GAME_SAVE = '存储';
exports.WTCD_GAME_SAVE_TITLE = '请选择要存储的位置';
exports.WTCD_GAME_SAVE_CANCEL = '取消';
exports.WTCD_GAME_SAVE_NEW = '- 新存档 -';
exports.WTCD_GAME_SAVE_OVERWRITE_TITLE = '是否覆盖？';
exports.WTCD_GAME_SAVE_OVERWRITE_CONFIRM = '确认覆盖';
exports.WTCD_GAME_SAVE_OVERWRITE_CANCEL = '取消';
exports.WTCD_GAME_SAVE_OK = '存储成功';
exports.WTCD_GAME_LOAD = '读取';
exports.WTCD_GAME_LOAD_TITLE = '请选择要读取的存档';
exports.WTCD_GAME_LOAD_CANCEL = '取消';
exports.WTCD_GAME_LOAD_QUICK = '快';
exports.WTCD_GAME_LOAD_OK = '读取成功';
exports.WTCD_GAME_QUICK_SAVE = '快速存储';
exports.WTCD_GAME_QUICK_SAVE_OK = '快速存储成功';
exports.WTCD_GAME_QUICK_LOAD = '快速读取';
exports.WTCD_GAME_QUICK_LOAD_OK = '快速读取成功';
exports.WTCD_GAME_QUICK_LOAD_NOT_EXIST = '没有可用的快速存档，请先使用【快速存储】来创建快速存档。';
exports.WTCD_GAME_QUICK_LOAD_CONFIRM_TITLE = '是否快速读取？';
exports.WTCD_GAME_QUICK_LOAD_CONFIRM_DESC = '这会丢失当前未保存的数据。（可在【设置】中禁用此确认）';
exports.WTCD_GAME_QUICK_LOAD_CONFIRM_CONFIRM = '确认读取';
exports.WTCD_GAME_QUICK_LOAD_CONFIRM_CANCEL = '取消';
exports.WTCD_GAME_NO_DESC = '无描述文本';
exports.WTCD_ERROR_COMPILE_TITLE = 'WTCD 编译失败';
exports.WTCD_ERROR_COMPILE_DESC = '该 WTCD 文档在编译时发生了错误。请检查是否有语法错误或是其他基本错误。';
exports.WTCD_ERROR_RUNTIME_TITLE = 'WTCD 运行时错误';
exports.WTCD_ERROR_RUNTIME_DESC = '该 WTCD 文档在运行时发生了错误。请检查是否有逻辑错误。';
exports.WTCD_ERROR_INTERNAL_TITLE = 'WTCD 内部错误';
exports.WTCD_ERROR_INTERNAL_DESC = 'WTCD 解释器在解释执行该 WTCD 文档时崩溃了。请务必告诉琳你做了什么好让她来修。';
exports.WTCD_ERROR_MESSAGE = '错误信息：';
exports.WTCD_ERROR_WTCD_STACK_TITLE = 'WTCD 调用栈';
exports.WTCD_ERROR_WTCD_STACK_DESC = 'WTCD 调用栈记录了在错误发生时 WTCD 的解释器状态。这可以帮助理解错误发生的上下文。';
exports.WTCD_ERROR_INTERNAL_STACK_TITLE = '内部调用栈';
exports.WTCD_ERROR_INTERNAL_STACK_DESC = '内部调用栈记录了出现该错误时编译器或是解释器的状态。请注意内部调用栈通常只在调试 WTCD 编译器或是解释器时有用。内部调用栈通常对调试 WTCD 文档没有作用。';
exports.MAKAI_ERROR_INTERNET = '和 Makai 主机通讯时出现错误 OxO, 或许是你的网络环境出现了问题？';
exports.MAKAI_ERROR_SUBMIT_COMMENT_INVALID_TOKEN = 'Oops！评论失败啦，或许是你的令牌过期啦？';
exports.MAKAI_ERROR_DELETE_COMMENT_INVALID_TOKEN = 'Oops！删除失败啦，或许是你的令牌过期啦？';
exports.MAKAI_ERROR_EMPTY_TOKEN = '嘿！请先把令牌输进来啦！';
exports.MAKAI_ERROR_INVALID_TOKEN = 'Oops！你的令牌并没有被 Makai 记录在案！';
exports.MAKAI_ERROR_INVALID_EMAIL = '你输入的邮箱格式有问题啦！';
exports.MAKAI_ERROR_USER_EXIST = '这个名字已经被使用过了！如果之前使用的人是你的话，把用过的令牌找来吧！';
exports.MAKAI_ERROR_UNKNOWN = 'Oops！发生了一些不该发生的问题！快去把友人♪B或者琳喊来！';
exports.MAKAI_INFO_SET_TOKKEN_SUCCESS = '你的 Makai 令牌已经设置完毕啦！';
exports.MAKAI_INFO_CONFIRM_TOKEN = '正在确认你的 Makai 令牌……';
exports.MAKAI_INFO_OBTAIN_TOKEN = '正在获取 Makai 令牌……';
exports.MAKAI_GENERIC_AS = '以 ';
exports.MAKAI_GENERIC_SUBMIT = ' 的身份评论';
exports.MAKAI_GENERIC_SUBMITED_AT = ' 的身份发表于 ';
exports.MAKAI_GENERIC_LAST_MODIFIED = '（最后修改于 ';
exports.MAKAI_GENERIC_LAST_MODIFIED_SUFFIX = ' ）';
exports.MAKAI_BUTTON_BLOCK = '屏蔽此人';
exports.MAKAI_BUTTON_DELETE = '删除评论';
exports.MAKAI_MODAL_TITLE_WARNING = '警告！';
exports.MAKAI_MODAL_TITLE_INFO = '提示';
exports.MAKAI_MODAL_TITLE_WAITING = '请等一下';
exports.MAKAI_MODAL_TITLE_TOKEN = 'Makai 令牌';
exports.MAKAI_MODAL_TITLE_COMMENT = 'Makai - 添加评论';
exports.MAKAI_MODAL_OK = '好的';
exports.MAKAI_MODAL_CONFIRM = '是的';
exports.MAKAI_MODAL_CANCEL = '算了';
exports.MAKAI_MODAL_SAVE = '保存';
exports.MAKAI_MODAL_SUBMIT = '发表';
exports.MAKAI_MODAL_CONTENT_COMMENT_HINT = '想说些什么？直接写下来吧！';
exports.MAKAI_MODAL_CONTENT_NAME_INPUT_PREFIX = '署名（必填）';
exports.MAKAI_MODAL_CONTENT_EMAIL_INPUT_PREFIX = '邮箱（可选）：';
exports.MAKAI_MODAL_CONTENT_TOKEN_INPUT_PREFIX = '令牌：';
exports.MAKAI_MODAL_CONTENT_DELETION_CONFIRMATION = '你确定要删除这条评论吗？';
exports.MAKAI_MODAL_CONTENT_THIS_IS_YOUR_MAKAI_TOKEN = '这是你的 Makai 令牌！';
exports.MAKAI_MODAL_CONTENT_MAKAI_TOKEN_IS_USED_TO_SUBMIT_COMMENTS = '使用 Makai 令牌可以非常方便的在这里发表评论！';
exports.MAKAI_MODAL_CONTENT_YOU_WILL_GET_MAKAI_TOKEN_ONCE_YOU_SUBMIT_FIRST_COMMENT = '当你发表第一个评论的时候，就会获得你的 Makai 令牌哟！';
exports.MAKAI_MODAL_CONTENT_DEVELOPMENT_HINT = 'WTCD 存档同步正在开发中！ —— 来自魔法☆少女的玩具 友人♪B';

},{}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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
    { name: '琥珀' },
    { name: '为霜' },
    { name: '冰蓮音' },
    { name: 'Testingdoll01' }
].sort(() => Math.random() - 0.5);

},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MakaiControl {
    static tokenToUsername(token) {
        const res = fetch(MakaiControl.url + '/username/' + token);
        return null;
    }
    static validToken(token) {
        return !(MakaiControl.tokenToUsername(token) == null);
    }
    static saveToken(token) {
        window.localStorage.setItem('token', token);
    }
    static saveUsername(username) {
        window.localStorage.setItem('username', username);
    }
    static getToken() {
        return window.localStorage.getItem('token');
    }
    static getUsername() {
        return window.localStorage.getItem('username');
    }
    static hasToken() {
        return window.localStorage.getItem('token') != null;
    }
}
exports.MakaiControl = MakaiControl;
MakaiControl.url = 'https://c.makai.city';

},{}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function sign(x) {
    return x > 0 ? 1 : x < 0 ? -1 : 0;
}
function solveQuad(a, b, c) {
    const D = (b ** 2) - 4 * a * c;
    return (-b + sign(a) * (D ** 0.5)) / (2 * a);
}
class MonoDimensionTransitionControl {
    constructor(
    /** Initial value */
    lastValue, accelerationPerSecSq) {
        this.lastValue = lastValue;
        /** Start time of the current transition */
        this.initialTime = 0;
        /** Time when the acceleration is reversed of the current transition */
        this.reverseTime = 0;
        /** Value when the acceleration is reversed of the current transition */
        this.reverseValue = 0;
        /** Velocity when the acceleration is reversed of the current transition */
        this.reverseVelocity = 0;
        /** Start velocity of the current transition */
        this.lastStartingVelocity = 0;
        /** Time when the current transition is finished */
        this.finalTime = 0;
        /** Target value of the current transition */
        this.finalValue = 0;
        /** Acceleration in unit per ms */
        this.acceleration = 0;
        this.finalValue = lastValue;
        this.acceleration = accelerationPerSecSq / 1000 / 1000;
    }
    setTarget(targetValue) {
        this.lastValue = this.getValue();
        const x = targetValue - this.lastValue;
        if (x === 0) {
            return;
        }
        const now = Date.now();
        const v = this.getVelocity(now);
        // Find a solution for reverse time
        let t = solveQuad(this.acceleration, 2 * v, 0.5 * (v ** 2) / this.acceleration - x);
        if (Number.isNaN(t) || t < 0) {
            // If a reverse time cannot be found with current sign of acceleration, try again with the opposite of acceleration
            this.acceleration = -this.acceleration;
            t = solveQuad(this.acceleration, 2 * v, 0.5 * (v ** 2) / this.acceleration - x);
        }
        const a = this.acceleration;
        this.initialTime = now;
        this.reverseTime = this.initialTime + t;
        this.reverseValue = this.lastValue + 0.5 * a * (t ** 2) + v * t;
        this.reverseVelocity = v + a * t;
        this.finalTime = this.reverseTime + t + v / a;
        this.lastStartingVelocity = v;
        this.finalValue = targetValue;
    }
    getVelocity(now = Date.now()) {
        return now < this.reverseTime
            ? this.lastStartingVelocity + (now - this.initialTime) * this.acceleration
            : now < this.finalTime
                ? this.lastStartingVelocity + (2 * this.reverseTime - this.initialTime - now) * this.acceleration
                : 0;
    }
    getValue(now = Date.now()) {
        if (now < this.reverseTime) {
            const t = now - this.initialTime;
            return this.lastValue + 0.5 * this.acceleration * (t ** 2) + this.lastStartingVelocity * t;
        }
        else if (now < this.finalTime) {
            const t = now - this.reverseTime;
            return this.reverseValue - 0.5 * this.acceleration * (t ** 2) + this.reverseVelocity * t;
        }
        else {
            return this.finalValue;
        }
    }
    isFinished(now = Date.now()) {
        return now >= this.finalTime;
    }
}
exports.MonoDimensionTransitionControl = MonoDimensionTransitionControl;

},{}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FeatureProvider_1 = require("../../wtcd/FeatureProvider");
const resolvePath_1 = require("../util/resolvePath");
const DebugLogger_1 = require("../DebugLogger");
const AutoCache_1 = require("../data/AutoCache");
const loadGooleFonts_1 = require("../util/loadGooleFonts");
const debugLogger = new DebugLogger_1.DebugLogger('WTCD Feature Provider');
const imageCache = new AutoCache_1.AutoCache(url => {
    return new Promise((resolve, reject) => {
        const image = document.createElement('img');
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`Failed to load ${url}.`));
        image.src = url;
    });
}, new DebugLogger_1.DebugLogger('WTCD Image Cache'));
const fontsCache = new AutoCache_1.AutoCache(identifier => {
    // Identifier should look like: "googleFonts:ZCOOL KuaiLe"
    const modeSeparatorIndex = identifier.indexOf(':');
    if (modeSeparatorIndex === -1) {
        return Promise.reject(new Error('Cannot find mode separator ":".'));
    }
    const mode = identifier.substr(0, modeSeparatorIndex);
    if (mode !== 'googleFonts') {
        return Promise.reject(new Error(`Unknown mode: "${mode}".`));
    }
    return loadGooleFonts_1.loadGoogleFonts(identifier.substr(modeSeparatorIndex + 1));
}, new DebugLogger_1.DebugLogger('WTCD Font Cache'));
class WTCDFeatureProvider extends FeatureProvider_1.FeatureProvider {
    constructor(chapter) {
        super();
        this.chapter = chapter;
    }
    loadImage(path) {
        if (!path.startsWith('./')) {
            return Promise.reject(new Error('Path has to be relative and start ' +
                `with "./". Received: "${path}"`));
        }
        let resolved = resolvePath_1.resolvePath('chapters', this.chapter.htmlRelativePath, '..', path.substr(2));
        if (resolved === null) {
            return Promise.reject(new Error(`Failed to resolve path: "${path}".`));
        }
        resolved = '/' + resolved;
        debugLogger.log('Resolved from:', path, 'to:', resolved);
        return imageCache.get(resolved);
    }
    loadFont(identifier) {
        return fontsCache.get(identifier);
    }
}
exports.WTCDFeatureProvider = WTCDFeatureProvider;

},{"../../wtcd/FeatureProvider":58,"../DebugLogger":6,"../data/AutoCache":32,"../util/loadGooleFonts":52,"../util/resolvePath":54}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GameReader_1 = require("../../wtcd/GameReader");
const messages_1 = require("../constant/messages");
const settings_1 = require("../data/settings");
const DebugLogger_1 = require("../DebugLogger");
const hs_1 = require("../hs");
const formatTime_1 = require("../util/formatTime");
const createWTCDErrorMessageFromError_1 = require("./createWTCDErrorMessageFromError");
const hintControl_1 = require("./hintControl");
const modalControl_1 = require("./modalControl");
const FeatureProvider_1 = require("../../wtcd/FeatureProvider");
const debugLogger = new DebugLogger_1.DebugLogger('WTCD Game Reader UI');
class WTCDGameReaderUI {
    constructor(content, docIdentifier, wtcdRoot, featureProvider = FeatureProvider_1.defaultFeatureProvider) {
        this.content = content;
        this.mainBlock = null;
        this.started = false;
        this.onClickRestart = () => {
            const modal = new modalControl_1.Modal(hs_1.h('div', [
                hs_1.h('h1', messages_1.WTCD_GAME_RESTART_TITLE),
                hs_1.h('p', messages_1.WTCD_GAME_RESTART_DESC),
                hs_1.h('ul', [
                    hs_1.h('li', messages_1.WTCD_GAME_RESTART_ALL_DESC),
                    hs_1.h('li', messages_1.WTCD_GAME_RESTART_DECISION_ONLY_DESC),
                ]),
                hs_1.h('.button-container', [
                    hs_1.h('div', { onclick: () => {
                            this.reader.reset(true);
                            hintControl_1.createHint(messages_1.WTCD_GAME_RESTART_OK, 1000);
                            modal.close();
                        } }, messages_1.WTCD_GAME_RESTART_ALL),
                    hs_1.h('div', { onclick: () => {
                            this.reader.reset(false);
                            hintControl_1.createHint(messages_1.WTCD_GAME_RESTART_OK, 1000);
                            modal.close();
                        } }, messages_1.WTCD_GAME_RESTART_DECISION_ONLY),
                    hs_1.h('div', { onclick: () => modal.close() }, messages_1.WTCD_GAME_RESTART_CANCEL),
                ]),
            ]));
            modal.setDismissible();
            modal.open();
        };
        this.onClickSave = () => {
            const modal = new modalControl_1.Modal(hs_1.h('div', [
                hs_1.h('h1', messages_1.WTCD_GAME_SAVE_TITLE),
                hs_1.h('.wtcd-save-button-list', this.reader.getSaves().map((save, saveIndex) => {
                    if (saveIndex === 0) {
                        return null; // quick save
                    }
                    if (save === null) {
                        return hs_1.h('.new', {
                            onclick: () => {
                                this.reader.save(saveIndex);
                                hintControl_1.createHint(messages_1.WTCD_GAME_SAVE_OK, 1000);
                                modal.close();
                            },
                        }, messages_1.WTCD_GAME_SAVE_NEW);
                    }
                    else {
                        return hs_1.h('.save', {
                            onclick: () => {
                                modalControl_1.confirm(messages_1.WTCD_GAME_SAVE_OVERWRITE_TITLE, '', messages_1.WTCD_GAME_SAVE_OVERWRITE_CONFIRM, messages_1.WTCD_GAME_SAVE_OVERWRITE_CANCEL).then(result => {
                                    if (result) {
                                        this.reader.save(saveIndex);
                                        hintControl_1.createHint(messages_1.WTCD_GAME_SAVE_OK, 1000);
                                        modal.close();
                                    }
                                });
                            },
                        }, [
                            hs_1.h('.id', String(saveIndex)),
                            hs_1.h('.info', [
                                hs_1.h('.state-desc', save.desc === ''
                                    ? messages_1.WTCD_GAME_NO_DESC
                                    : save.desc),
                                hs_1.h('.date', formatTime_1.formatTimeSimple(save.date)),
                            ]),
                        ]);
                    }
                })),
                hs_1.h('.button-container', { style: { 'margin-top': '1.2vh' } }, [
                    hs_1.h('div', { onclick: () => modal.close() }, messages_1.WTCD_GAME_SAVE_CANCEL),
                ]),
            ]));
            modal.setDismissible();
            modal.open();
        };
        this.onClickLoad = () => {
            const modal = new modalControl_1.Modal(hs_1.h('div', [
                hs_1.h('h1', messages_1.WTCD_GAME_LOAD_TITLE),
                hs_1.h('.wtcd-save-button-list', this.reader.getSaves().map((save, saveIndex) => {
                    if (save === null) {
                        return null;
                    }
                    return hs_1.h('.save', {
                        onclick: () => {
                            this.reader.load(saveIndex);
                            hintControl_1.createHint(messages_1.WTCD_GAME_LOAD_OK, 1000);
                            modal.close();
                        },
                    }, [
                        saveIndex !== 0
                            ? hs_1.h('.id', String(saveIndex))
                            : hs_1.h('.small.id', messages_1.WTCD_GAME_LOAD_QUICK),
                        hs_1.h('.info', [
                            hs_1.h('.state-desc', save.desc === ''
                                ? messages_1.WTCD_GAME_NO_DESC
                                : save.desc),
                            hs_1.h('.date', formatTime_1.formatTimeSimple(save.date)),
                        ]),
                    ]);
                })),
                hs_1.h('.button-container', { style: { 'margin-top': '1.2vh' } }, [
                    hs_1.h('div', { onclick: () => modal.close() }, messages_1.WTCD_GAME_LOAD_CANCEL),
                ]),
            ]));
            modal.setDismissible();
            modal.open();
        };
        this.onClickQuickSave = () => {
            this.reader.save(0);
            hintControl_1.createHint(messages_1.WTCD_GAME_QUICK_SAVE_OK, 1000);
        };
        this.onClickQuickLoad = () => {
            if (this.reader.getSaves()[0] === null) {
                hintControl_1.createHint(messages_1.WTCD_GAME_QUICK_LOAD_NOT_EXIST, 3000);
                return;
            }
            if (settings_1.wtcdGameQuickLoadConfirm.getValue()) {
                modalControl_1.confirm(messages_1.WTCD_GAME_QUICK_LOAD_CONFIRM_TITLE, messages_1.WTCD_GAME_QUICK_LOAD_CONFIRM_DESC, messages_1.WTCD_GAME_QUICK_LOAD_CONFIRM_CONFIRM, messages_1.WTCD_GAME_QUICK_LOAD_CONFIRM_CANCEL).then(result => {
                    if (result) {
                        this.reader.load(0);
                        hintControl_1.createHint(messages_1.WTCD_GAME_QUICK_LOAD_OK, 1000);
                    }
                });
            }
            else {
                this.reader.load(0);
                hintControl_1.createHint(messages_1.WTCD_GAME_QUICK_LOAD_OK, 1000);
            }
        };
        this.onOutput = (content) => {
            if (this.mainBlock === null) {
                debugLogger.log('Initialize main block.');
                this.mainBlock = this.content.addBlock({
                    initElement: content,
                    slidable: true,
                });
            }
            else {
                debugLogger.log('Updating main block.');
                this.content.scrollTo(this.controlsBlock.element.offsetTop);
                this.mainBlock.slideReplace(content);
            }
        };
        this.onError = (error) => {
            debugLogger.warn('Game reader reported error.');
            this.content.addBlock({
                initElement: createWTCDErrorMessageFromError_1.createWTCDErrorMessageFromError(error),
            });
        };
        this.reader = new GameReader_1.GameReader(docIdentifier, wtcdRoot, this.onOutput, this.onError, featureProvider);
    }
    start() {
        if (this.started) {
            throw new Error('Already started.');
        }
        this.started = true;
        this.controlsBlock = this.content.addBlock({
            initElement: hs_1.h('div.wtcd-game-control', hs_1.h('.button-container', [
                hs_1.h('div', { onclick: this.onClickRestart }, messages_1.WTCD_GAME_RESTART),
                hs_1.h('div', { onclick: this.onClickSave }, messages_1.WTCD_GAME_SAVE),
                hs_1.h('div', { onclick: this.onClickLoad }, messages_1.WTCD_GAME_LOAD),
                hs_1.h('div', { onclick: this.onClickQuickSave }, messages_1.WTCD_GAME_QUICK_SAVE),
                hs_1.h('div', { onclick: this.onClickQuickLoad }, messages_1.WTCD_GAME_QUICK_LOAD),
            ])),
        });
        const startTime = Date.now();
        this.reader.start();
        debugLogger.log(`Game loaded in ${Date.now() - startTime}ms.`);
    }
}
exports.WTCDGameReaderUI = WTCDGameReaderUI;

},{"../../wtcd/FeatureProvider":58,"../../wtcd/GameReader":60,"../DebugLogger":6,"../constant/messages":11,"../data/settings":34,"../hs":36,"../util/formatTime":51,"./createWTCDErrorMessageFromError":23,"./hintControl":25,"./modalControl":28}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FlowReader_1 = require("../../wtcd/FlowReader");
const loadingText_1 = require("../constant/loadingText");
const messages_1 = require("../constant/messages");
const AutoCache_1 = require("../data/AutoCache");
const data_1 = require("../data/data");
const settings_1 = require("../data/settings");
const state_1 = require("../data/state");
const DebugLogger_1 = require("../DebugLogger");
const Event_1 = require("../Event");
const hs_1 = require("../hs");
const gestures_1 = require("../input/gestures");
const keyboard_1 = require("../input/keyboard");
const DOM_1 = require("../util/DOM");
const commentsControl_1 = require("./commentsControl");
const contentControl_1 = require("./contentControl");
const createWTCDErrorMessage_1 = require("./createWTCDErrorMessage");
const createWTCDErrorMessageFromError_1 = require("./createWTCDErrorMessageFromError");
const history_1 = require("./history");
const layoutControl_1 = require("./layoutControl");
const modalControl_1 = require("./modalControl");
const processElements_1 = require("./processElements");
const WTCDFeatureProvider_1 = require("./WTCDFeatureProvider");
const WTCDGameReaderUI_1 = require("./WTCDGameReaderUI");
const debugLogger = new DebugLogger_1.DebugLogger('Chapter Control');
exports.loadChapterEvent = new Event_1.Event();
function closeChapter() {
    layoutControl_1.setLayout(layoutControl_1.Layout.OFF);
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
const canChapterShown = (chapter) => (settings_1.earlyAccess.getValue() || !chapter.isEarlyAccess) && (!chapter.hidden);
function findNextChapter(chapterCtx) {
    const index = chapterCtx.inFolderIndex;
    const folderChapters = chapterCtx.folder.chapters;
    for (let i = index + 1; i < folderChapters.length; i++) {
        const chapter = folderChapters[i];
        if (canChapterShown(chapter)) {
            return chapter;
        }
    }
    return null;
}
function findPreviousChapter(chapterCtx) {
    const index = chapterCtx.inFolderIndex;
    const folderChapters = chapterCtx.folder.chapters;
    for (let i = index - 1; i >= 0; i--) {
        const chapter = folderChapters[i];
        if (canChapterShown(chapter)) {
            return chapter;
        }
    }
    return null;
}
function loadPrevChapter() {
    const chapterCtx = state_1.state.currentChapter;
    if (chapterCtx === null) {
        return;
    }
    const previousChapter = findPreviousChapter(chapterCtx);
    if (previousChapter !== null) {
        loadChapter(previousChapter.htmlRelativePath, undefined, contentControl_1.Side.LEFT);
        history_1.updateHistory(true);
    }
}
exports.loadPrevChapter = loadPrevChapter;
function loadNextChapter() {
    const chapterCtx = state_1.state.currentChapter;
    if (chapterCtx === null) {
        return;
    }
    const nextChapter = findNextChapter(chapterCtx);
    if (nextChapter !== null) {
        loadChapter(nextChapter.htmlRelativePath, undefined, contentControl_1.Side.RIGHT);
        history_1.updateHistory(true);
    }
}
exports.loadNextChapter = loadNextChapter;
const chaptersCache = new AutoCache_1.AutoCache(chapterHtmlRelativePath => {
    const url = `./chapters/${chapterHtmlRelativePath}`;
    debugLogger.log(`Loading chapter from ${url}.`);
    return fetch(url).then(response => response.text());
}, new DebugLogger_1.DebugLogger('Chapters Cache'));
function loadChapter(chapterHtmlRelativePath, selection, side = contentControl_1.Side.LEFT) {
    debugLogger.log('Load chapter', chapterHtmlRelativePath, 'with selection', selection);
    exports.loadChapterEvent.emit(chapterHtmlRelativePath);
    window.localStorage.setItem('lastRead', chapterHtmlRelativePath);
    const chapterCtx = data_1.relativePathLookUpMap.get(chapterHtmlRelativePath);
    state_1.state.currentChapter = chapterCtx;
    const content = contentControl_1.newContent(side);
    if (chapterCtx.chapter.isEarlyAccess) {
        content.addBlock({
            initElement: (hs_1.h('div', [
                hs_1.h('h1', messages_1.EARLY_ACCESS_TITLE),
                hs_1.h('p', messages_1.EARLY_ACCESS_DESC),
            ])),
            style: contentControl_1.ContentBlockStyle.WARNING,
        });
    }
    const loadingBlock = content.addBlock({
        initElement: hs_1.h('.content'),
    });
    layoutControl_1.setLayout(layoutControl_1.Layout.MAIN);
    loadingBlock.element.innerText = loadingText_1.loadingText;
    chaptersCache.get(chapterHtmlRelativePath).then(text => {
        if (content.isDestroyed) {
            debugLogger.log('Chapter loaded, but abandoned since the original ' +
                'content page is already destroyed.');
            return;
        }
        debugLogger.log('Chapter loaded.');
        loadingBlock.directRemove();
        const mainBlock = insertContent(content, text, chapterCtx.chapter) || content.addBlock();
        state_1.state.chapterTextNodes = DOM_1.getTextNodes(mainBlock.element);
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
        const prevChapter = findPreviousChapter(chapterCtx);
        const nextChapter = findNextChapter(chapterCtx);
        mainBlock.element.appendChild(hs_1.h('div.page-switcher', [
            // 上一章
            (prevChapter !== null)
                ? hs_1.h('a.to-prev', {
                    href: window.location.pathname + '#' + prevChapter.htmlRelativePath,
                    onclick: (event) => {
                        event.preventDefault();
                        loadPrevChapter();
                    },
                }, messages_1.PREVIOUS_CHAPTER)
                : null,
            // 返回菜单
            hs_1.h('a.to-menu', {
                href: window.location.pathname,
                onclick: (event) => {
                    event.preventDefault();
                    closeChapter();
                    history_1.updateHistory(true);
                },
            }, messages_1.GO_TO_MENU),
            // 下一章
            (nextChapter !== null)
                ? hs_1.h('a.to-next', {
                    href: window.location.pathname + '#' + nextChapter.htmlRelativePath,
                    onclick: (event) => {
                        event.preventDefault();
                        loadNextChapter();
                    },
                }, messages_1.NEXT_CHAPTER)
                : null,
        ]));
        // Re-focus the rect so it is arrow-scrollable
        setTimeout(() => {
            contentControl_1.focus();
        }, 1);
        commentsControl_1.loadComments(content);
    })
        .catch(error => {
        debugLogger.error(`Failed to load chapter.`, error);
        loadingBlock.element.innerText = messages_1.CHAPTER_FAILED;
    });
}
exports.loadChapter = loadChapter;
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
    if (modalControl_1.isAnyModalOpened()) {
        return;
    }
    if (arrowKey === keyboard_1.ArrowKey.LEFT) {
        loadPrevChapter();
    }
    else if (arrowKey === keyboard_1.ArrowKey.RIGHT) {
        loadNextChapter();
    }
});
keyboard_1.escapeKeyPressEvent.on(() => {
    if (modalControl_1.isAnyModalOpened()) {
        return;
    }
    closeChapter();
    history_1.updateHistory(true);
});
var ErrorType;
(function (ErrorType) {
    ErrorType[ErrorType["COMPILE"] = 0] = "COMPILE";
    ErrorType[ErrorType["RUNTIME"] = 1] = "RUNTIME";
    ErrorType[ErrorType["INTERNAL"] = 2] = "INTERNAL";
})(ErrorType = exports.ErrorType || (exports.ErrorType = {}));
function insertContent(content, text, chapter) {
    switch (chapter.type) {
        case 'Markdown':
            const block = content.addBlock();
            block.element.innerHTML = text;
            processElements_1.processElements(block.element);
            return block;
        case 'WTCD': {
            const wtcdParseResult = JSON.parse(text);
            if (wtcdParseResult.error === true) {
                content.addBlock({
                    initElement: createWTCDErrorMessage_1.createWTCDErrorMessage({
                        errorType: ErrorType.COMPILE,
                        message: wtcdParseResult.message,
                        internalStack: wtcdParseResult.internalStack,
                    }),
                });
                break;
            }
            const featureProvider = new WTCDFeatureProvider_1.WTCDFeatureProvider(chapter);
            switch (chapter.preferredReader) {
                case 'flow': {
                    const flowReader = new FlowReader_1.FlowReader(chapter.htmlRelativePath, wtcdParseResult.wtcdRoot, createWTCDErrorMessageFromError_1.createWTCDErrorMessageFromError, processElements_1.processElements, featureProvider);
                    const $wtcdContainer = content.addBlock().element;
                    flowReader.renderTo($wtcdContainer);
                    break;
                }
                case 'game': {
                    new WTCDGameReaderUI_1.WTCDGameReaderUI(content, chapter.htmlRelativePath, wtcdParseResult.wtcdRoot, featureProvider).start();
                    break;
                }
            }
        }
    }
}

},{"../../wtcd/FlowReader":59,"../DebugLogger":6,"../Event":7,"../constant/loadingText":9,"../constant/messages":11,"../data/AutoCache":32,"../data/data":33,"../data/settings":34,"../data/state":35,"../hs":36,"../input/gestures":38,"../input/keyboard":39,"../util/DOM":50,"./WTCDFeatureProvider":16,"./WTCDGameReaderUI":17,"./commentsControl":20,"./contentControl":21,"./createWTCDErrorMessage":22,"./createWTCDErrorMessageFromError":23,"./history":26,"./layoutControl":27,"./modalControl":28,"./processElements":29}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Event_1 = require("../Event");
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

},{"../Event":7}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const messages_1 = require("../constant/messages");
const AutoCache_1 = require("../data/AutoCache");
const settings_1 = require("../data/settings");
const DebugLogger_1 = require("../DebugLogger");
const hs_1 = require("../hs");
const formatTime_1 = require("../util/formatTime");
const commentBlockControl_1 = require("./commentBlockControl");
const contentControl_1 = require("./contentControl");
const userControl_1 = require("./userControl");
const state_1 = require("../data/state");
const MakaiControl_1 = require("./MakaiControl");
const modalControl_1 = require("./modalControl");
const debugLogger = new DebugLogger_1.DebugLogger('Comments Control');
// const getApiUrlRegExp = /^https:\/\/github\.com\/([a-zA-Z0-9-_]+)\/([a-zA-Z0-9-_]+)\/issues\/([1-9][0-9]*)$/;
// Input sample: https://github.com/SCLeoX/Wearable-Technology/issues/1
// Output sample: https://api.github.com/repos/SCLeoX/Wearable-Technology/issues/1/comments
function getApiUrl() {
    var _a;
    return MakaiControl_1.MakaiControl.url + '/comment/github/' + ((_a = state_1.state.currentChapter) === null || _a === void 0 ? void 0 : _a.chapter.htmlRelativePath.replace(/\//g, '.')) + '/';
}
exports.getApiUrl = getApiUrl;
function createCommentElement(userAvatarUrl, userName, userUrl, createTime, updateTime, content, id, block, display) {
    var _a;
    const deleteButton = userName === ((_a = MakaiControl_1.MakaiControl.getUsername()) === null || _a === void 0 ? void 0 : _a.toLowerCase()) ? hs_1.h('a.block-user', {
        onclick: () => {
            modalControl_1.confirm(messages_1.MAKAI_MODAL_TITLE_WARNING, messages_1.MAKAI_MODAL_CONTENT_DELETION_CONFIRMATION, messages_1.MAKAI_MODAL_CONFIRM, messages_1.MAKAI_MODAL_CANCEL).then((result) => {
                if (result) {
                    const m = userControl_1.UserControl.showLoading(messages_1.MAKAI_INFO_CONFIRM_TOKEN);
                    fetch(MakaiControl_1.MakaiControl.url + `/comment/` + id + `/` + MakaiControl_1.MakaiControl.getToken(), {
                        cache: 'no-cache',
                        credentials: 'same-origin',
                        headers: new Headers({
                            'Content-Type': 'application/json'
                        }),
                        method: 'DELETE',
                        mode: 'cors',
                        redirect: 'follow',
                        referrer: 'no-referrer',
                    }).then((response) => {
                        return response.json();
                    })
                        .then((json) => {
                        m.close();
                        if (!json.success) {
                            userControl_1.UserControl.showMessage(messages_1.MAKAI_ERROR_DELETE_COMMENT_INVALID_TOKEN);
                        }
                        else {
                            $comment.remove();
                        }
                    }).catch((err) => {
                        m.close();
                        userControl_1.UserControl.showMessage(messages_1.MAKAI_ERROR_INTERNET);
                    });
                }
            });
        },
    }, messages_1.MAKAI_BUTTON_DELETE) : null;
    const $comment = hs_1.h('.comment', [
        hs_1.h('img.avatar', { src: userAvatarUrl }),
        hs_1.h('a.author', {
            target: '_blank',
            href: userUrl,
            rel: 'noopener noreferrer',
        }, display),
        hs_1.h('.time', messages_1.MAKAI_GENERIC_AS + userName + messages_1.MAKAI_GENERIC_SUBMITED_AT + ((createTime === updateTime)
            ? formatTime_1.formatTimeRelative(new Date(createTime))
            : `${formatTime_1.formatTimeRelative(new Date(createTime))}` +
                messages_1.MAKAI_GENERIC_LAST_MODIFIED + `${formatTime_1.formatTimeRelative(new Date(updateTime))}` + messages_1.MAKAI_GENERIC_LAST_MODIFIED_SUFFIX)), deleteButton === null ?
            hs_1.h('a.block-user', {
                onclick: () => {
                    commentBlockControl_1.blockUser(userName);
                    block.directRemove();
                    loadComments(contentControl_1.getCurrentContent());
                },
            }, messages_1.MAKAI_BUTTON_BLOCK) : deleteButton,
        ...content.split('\n\n').map(paragraph => hs_1.h('p', paragraph)),
    ]);
    return $comment;
}
exports.commentsCache = new AutoCache_1.AutoCache(apiUrl => {
    debugLogger.log(`Loading comments from ${apiUrl}.`);
    return fetch(apiUrl).then(response => response.json());
}, new DebugLogger_1.DebugLogger('Comments Cache'));
function loadComments(content) {
    if (settings_1.useComments.getValue() === false) {
        return;
    }
    const $commentsStatus = hs_1.h('p', messages_1.COMMENTS_LOADING);
    const $comments = hs_1.h('.comments', [
        hs_1.h('h1', messages_1.COMMENTS_SECTION),
        $commentsStatus,
    ]);
    const block = content.addBlock({
        initElement: $comments,
    });
    block.onEnteringView(() => {
        const apiUrl = getApiUrl();
        exports.commentsCache.get(apiUrl).then(data => {
            if (content.isDestroyed) {
                debugLogger.log('Comments loaded, but abandoned since the original ' +
                    'content page is already destroyed.');
                return;
            }
            debugLogger.log('Comments loaded.');
            $commentsStatus.innerText = messages_1.COMMENTS_LOADED;
            data.forEach((comment) => {
                if (commentBlockControl_1.isUserBlocked(comment.user.login)) {
                    return;
                }
                $comments.appendChild(createCommentElement(comment.user.avatar_url, comment.user.login, comment.user.html_url, comment.created_at, comment.updated_at, comment.body, comment.id, block, comment.user.display));
            });
            $comments.appendChild(hs_1.h('.create-comment', {
                onclick: () => {
                    userControl_1.UserControl.showComment(block);
                },
            }, messages_1.COMMENTS_CREATE));
        })
            .catch(() => {
            $commentsStatus.innerText = messages_1.COMMENTS_FAILED;
        });
    });
}
exports.loadComments = loadComments;

},{"../DebugLogger":6,"../constant/messages":11,"../data/AutoCache":32,"../data/settings":34,"../data/state":35,"../hs":36,"../util/formatTime":51,"./MakaiControl":14,"./commentBlockControl":19,"./contentControl":21,"./modalControl":28,"./userControl":31}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const settings_1 = require("../data/settings");
const DebugLogger_1 = require("../DebugLogger");
const hs_1 = require("../hs");
const keyboard_1 = require("../input/keyboard");
const DOM_1 = require("../util/DOM");
const layoutControl_1 = require("./layoutControl");
const MonoDimensionTransitionControl_1 = require("./MonoDimensionTransitionControl");
const $contentContainer = DOM_1.id('content-container');
const debugLogger = new DebugLogger_1.DebugLogger('Content Control');
var Side;
(function (Side) {
    Side[Side["LEFT"] = 0] = "LEFT";
    Side[Side["RIGHT"] = 1] = "RIGHT";
})(Side = exports.Side || (exports.Side = {}));
function setSide($element, side) {
    if (side === Side.LEFT) {
        $element.classList.add('left');
        $element.classList.remove('right');
    }
    else {
        $element.classList.add('right');
        $element.classList.remove('left');
    }
}
function otherSide(side) {
    return side === Side.LEFT ? Side.RIGHT : Side.LEFT;
}
let currentContent = null;
function getCurrentContent() {
    return currentContent;
}
exports.getCurrentContent = getCurrentContent;
function focus() {
    if (currentContent !== null) {
        currentContent.element.focus({
            // Why:
            // https://stackoverflow.com/questions/26782998/why-does-calling-focus-break-my-css-transition
            preventScroll: true,
        });
    }
}
exports.focus = focus;
/**
 * 创建一个新的 Content 并替换之前的 Content。
 *
 * @param side 如果有动画，那么入场位置。
 * @returns 创建的 Content 对象
 */
function newContent(side) {
    const newContent = new Content();
    if (layoutControl_1.getCurrentLayout() === layoutControl_1.Layout.OFF) {
        if (currentContent !== null) {
            currentContent.destroy();
        }
    }
    else {
        if (settings_1.animation.getValue()) {
            // Animation is enabled
            if (currentContent !== null) {
                setSide(currentContent.element, otherSide(side));
                // Remove the content after a timeout instead of listening for
                // transition event
                const oldContent = currentContent;
                setTimeout(() => {
                    oldContent.destroy();
                }, 2500);
            }
            setSide(newContent.element, side);
            // Force reflow, so transition starts now
            // tslint:disable-next-line:no-unused-expression
            newContent.element.offsetWidth;
            newContent.element.classList.remove('left', 'right');
        }
        else {
            if (currentContent !== null) {
                currentContent.destroy();
            }
        }
    }
    currentContent = newContent;
    return newContent;
}
exports.newContent = newContent;
var ContentBlockStyle;
(function (ContentBlockStyle) {
    ContentBlockStyle[ContentBlockStyle["REGULAR"] = 0] = "REGULAR";
    ContentBlockStyle[ContentBlockStyle["WARNING"] = 1] = "WARNING";
})(ContentBlockStyle = exports.ContentBlockStyle || (exports.ContentBlockStyle = {}));
class Content {
    constructor() {
        this.isDestroyed = false;
        this.blocks = [];
        this.scrollTransition = null;
        this.onKeyPress = (key) => {
            if (key === keyboard_1.ArrowKey.UP || key === keyboard_1.ArrowKey.DOWN) {
                this.interruptScrolling();
            }
        };
        this.interruptScrolling = () => {
            if (this.scrollTransition !== null) {
                this.scrollTransition = null;
                debugLogger.log('Transition interrupted.');
            }
        };
        this.scrollAnimation = () => {
            if (this.scrollTransition === null) {
                return;
            }
            const now = Date.now();
            this.element.scrollTop = this.scrollTransition.getValue(now);
            if (this.scrollTransition.isFinished(now)) {
                debugLogger.log('Transition finished.');
                this.scrollTransition = null;
            }
            else {
                requestAnimationFrame(this.scrollAnimation);
            }
        };
        const $content = hs_1.h('div.content', { tabIndex: -1 });
        $contentContainer.appendChild($content);
        this.element = $content;
        window.addEventListener('wheel', this.interruptScrolling);
        keyboard_1.arrowKeyPressEvent.on(this.onKeyPress);
    }
    addBlock(opts = {}) {
        const block = new ContentBlock(this, opts);
        this.blocks.push(block);
        return block;
    }
    destroy() {
        this.isDestroyed = true;
        this.element.remove();
        window.removeEventListener('wheel', this.interruptScrolling);
        keyboard_1.arrowKeyPressEvent.off(this.onKeyPress);
    }
    scrollTo(target) {
        if (!settings_1.animation.getValue() || layoutControl_1.getCurrentLayout() === layoutControl_1.Layout.OFF) {
            debugLogger.log(`Scroll to ${target}, no animation.`);
            this.element.scrollTop = target;
            return;
        }
        if (this.scrollTransition === null) {
            debugLogger.log(`Scrolling to ${target}, new transition stared.`);
            this.scrollTransition = new MonoDimensionTransitionControl_1.MonoDimensionTransitionControl(this.element.scrollTop, 20000);
            this.scrollTransition.setTarget(target);
            requestAnimationFrame(this.scrollAnimation);
        }
        else {
            debugLogger.log(`Scrolling to ${target}, existing transition updated.`);
            this.scrollTransition.setTarget(target);
        }
    }
}
exports.Content = Content;
class ContentBlock {
    constructor(content, { initElement = hs_1.h('div'), style = ContentBlockStyle.REGULAR, slidable = false, }) {
        this.slideContainer = null;
        this.heightHolder = null;
        this.sliding = 0;
        this.element = initElement;
        initElement.classList.add('content-block');
        switch (style) {
            case ContentBlockStyle.WARNING:
                initElement.classList.add('warning');
                break;
        }
        if (slidable) {
            this.slideContainer = hs_1.h('.slide-container', initElement);
            content.element.appendChild(this.slideContainer);
        }
        else {
            content.element.appendChild(initElement);
        }
    }
    onEnteringView(callback) {
        const observer = new IntersectionObserver(entries => {
            const entry = entries[0];
            if (entry.isIntersecting) {
                observer.disconnect();
                callback();
            }
        }, {
            root: $contentContainer,
            threshold: 0,
        });
        observer.observe(this.element);
    }
    directRemove() {
        if (this.slideContainer !== null) {
            this.slideContainer.remove();
        }
        else {
            this.element.remove();
        }
    }
    directReplace($newElement = hs_1.h('div')) {
        $newElement.classList.add('content-block');
        this.element.parentElement.replaceChild($newElement, this.element);
        this.element = $newElement;
    }
    slideReplace($newElement = hs_1.h('div')) {
        if (!settings_1.animation.getValue()) {
            this.directReplace($newElement);
            return;
        }
        const $container = this.slideContainer;
        if ($container === null) {
            throw new Error('Content block is not slidable.');
        }
        this.sliding++;
        $container.classList.add('in-transition');
        $newElement.classList.add('content-block');
        const $oldElement = this.element;
        $newElement.classList.add('right');
        // $newElement.style.top = `${$contentContainer.scrollTop - $container.offsetTop + 30}px`;
        $container.prepend($newElement);
        const newHeight = $newElement.offsetHeight; // This also forces reflow
        $newElement.classList.remove('right');
        // $newElement.style.top = null;
        if (this.heightHolder === null) {
            this.heightHolder = hs_1.h('.height-holder');
            this.heightHolder.style.height = `${$oldElement.offsetHeight}px`;
            $container.appendChild(this.heightHolder);
            // tslint:disable-next-line:no-unused-expression
            this.heightHolder.offsetWidth; // Forces reflow
        }
        this.heightHolder.style.height = `${newHeight}px`;
        $oldElement.classList.add('left');
        this.element = $newElement;
        setTimeout(() => {
            $oldElement.remove();
            this.sliding--;
            if (this.sliding === 0) {
                $container.classList.remove('in-transition');
                if (this.heightHolder !== null) {
                    this.heightHolder.remove();
                    this.heightHolder = null;
                }
            }
        }, 2500);
    }
}
exports.ContentBlock = ContentBlock;

},{"../DebugLogger":6,"../data/settings":34,"../hs":36,"../input/keyboard":39,"../util/DOM":50,"./MonoDimensionTransitionControl":15,"./layoutControl":27}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const messages_1 = require("../constant/messages");
const chapterControl_1 = require("./chapterControl");
function createWTCDErrorMessage({ errorType, message, internalStack, wtcdStack, }) {
    const $target = document.createElement('div');
    const $title = document.createElement('h1');
    const $desc = document.createElement('p');
    switch (errorType) {
        case chapterControl_1.ErrorType.COMPILE:
            $title.innerText = messages_1.WTCD_ERROR_COMPILE_TITLE;
            $desc.innerText = messages_1.WTCD_ERROR_COMPILE_TITLE;
            break;
        case chapterControl_1.ErrorType.RUNTIME:
            $title.innerText = messages_1.WTCD_ERROR_RUNTIME_TITLE;
            $desc.innerText = messages_1.WTCD_ERROR_RUNTIME_DESC;
            break;
        case chapterControl_1.ErrorType.INTERNAL:
            $title.innerText = messages_1.WTCD_ERROR_INTERNAL_TITLE;
            $desc.innerText = messages_1.WTCD_ERROR_INTERNAL_DESC;
            break;
    }
    $target.appendChild($title);
    $target.appendChild($desc);
    const $message = document.createElement('p');
    $message.innerText = messages_1.WTCD_ERROR_MESSAGE + message;
    $target.appendChild($message);
    if (wtcdStack !== undefined) {
        const $stackTitle = document.createElement('h2');
        $stackTitle.innerText = messages_1.WTCD_ERROR_WTCD_STACK_TITLE;
        $target.appendChild($stackTitle);
        const $stackDesc = document.createElement('p');
        $stackDesc.innerText = messages_1.WTCD_ERROR_WTCD_STACK_DESC;
        $target.appendChild($stackDesc);
        const $pre = document.createElement('pre');
        const $code = document.createElement('code');
        $code.innerText = wtcdStack;
        $pre.appendChild($code);
        $target.appendChild($pre);
    }
    if (internalStack !== undefined) {
        const $stackTitle = document.createElement('h2');
        $stackTitle.innerText = messages_1.WTCD_ERROR_INTERNAL_STACK_TITLE;
        $target.appendChild($stackTitle);
        const $stackDesc = document.createElement('p');
        $stackDesc.innerText = messages_1.WTCD_ERROR_INTERNAL_STACK_DESC;
        $target.appendChild($stackDesc);
        const $pre = document.createElement('pre');
        const $code = document.createElement('code');
        $code.innerText = internalStack;
        $pre.appendChild($code);
        $target.appendChild($pre);
    }
    return $target;
}
exports.createWTCDErrorMessage = createWTCDErrorMessage;

},{"../constant/messages":11,"./chapterControl":18}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WTCDError_1 = require("../../wtcd/WTCDError");
const chapterControl_1 = require("./chapterControl");
const createWTCDErrorMessage_1 = require("./createWTCDErrorMessage");
function createWTCDErrorMessageFromError(error) {
    return createWTCDErrorMessage_1.createWTCDErrorMessage({
        errorType: (error instanceof WTCDError_1.WTCDError)
            ? chapterControl_1.ErrorType.RUNTIME
            : chapterControl_1.ErrorType.INTERNAL,
        message: error.message,
        internalStack: error.stack,
        wtcdStack: (error instanceof WTCDError_1.WTCDError)
            ? error.wtcdStack
            : undefined,
    });
}
exports.createWTCDErrorMessageFromError = createWTCDErrorMessageFromError;

},{"../../wtcd/WTCDError":63,"./chapterControl":18,"./createWTCDErrorMessage":22}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_1 = require("../data/data");
const state_1 = require("../data/state");
const chapterControl_1 = require("./chapterControl");
const contentControl_1 = require("./contentControl");
const history_1 = require("./history");
function followQuery() {
    const chapterHtmlRelativePath = decodeURIComponent(window.location.hash.substr(1)); // Ignore the # in the result
    const chapterCtx = data_1.relativePathLookUpMap.get(chapterHtmlRelativePath);
    if (chapterCtx === undefined) {
        if (state_1.state.currentChapter !== null) {
            chapterControl_1.closeChapter();
            document.title = history_1.getTitle();
        }
    }
    else if (state_1.state.currentChapter !== chapterCtx) {
        const side = (state_1.state.currentChapter !== null &&
            chapterCtx.inFolderIndex > state_1.state.currentChapter.inFolderIndex) ? contentControl_1.Side.RIGHT : contentControl_1.Side.LEFT;
        if (typeof URLSearchParams !== 'function') {
            chapterControl_1.loadChapter(chapterHtmlRelativePath, undefined, side);
        }
        else {
            const query = new URLSearchParams(window.location.search);
            const selectionQuery = query.get('selection');
            const selection = selectionQuery !== null
                ? selectionQuery.split(',').map(str => +str)
                : [];
            if (selection.length !== 4 || !selection.every(num => (num >= 0) && (num % 1 === 0) && (!Number.isNaN(num)) && (Number.isFinite(num)))) {
                chapterControl_1.loadChapter(chapterHtmlRelativePath, undefined, side);
            }
            else {
                chapterControl_1.loadChapter(chapterHtmlRelativePath, selection, side);
            }
            document.title = history_1.getTitle();
        }
    }
    history_1.updateHistory(false);
}
exports.followQuery = followQuery;

},{"../data/data":33,"../data/state":35,"./chapterControl":18,"./contentControl":21,"./history":26}],25:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const hs_1 = require("../hs");
// Promise queue
let current = Promise.resolve();
function createHint(text, timeMs = 2000) {
    current = current.then(() => __awaiter(this, void 0, void 0, function* () {
        const $hint = hs_1.h('.hint', text);
        document.body.appendChild($hint);
        $hint.style.opacity = '0';
        // tslint:disable-next-line:no-unused-expression
        $hint.offsetWidth;
        $hint.style.removeProperty('opacity');
        yield new Promise(resolve => setTimeout(resolve, timeMs));
        $hint.style.opacity = '0';
        yield new Promise(resolve => setTimeout(resolve, 500));
        $hint.remove();
    }));
}
exports.createHint = createHint;

},{"../hs":36}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const state_1 = require("../data/state");
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

},{"../data/state":35}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DebugLogger_1 = require("../DebugLogger");
const Event_1 = require("../Event");
var Layout;
(function (Layout) {
    Layout[Layout["SIDE"] = 0] = "SIDE";
    Layout[Layout["MAIN"] = 1] = "MAIN";
    Layout[Layout["OFF"] = 2] = "OFF";
})(Layout = exports.Layout || (exports.Layout = {}));
const $body = document.body;
const debugLogger = new DebugLogger_1.DebugLogger('Layout');
exports.layoutChangeEvent = new Event_1.Event();
exports.layoutChangeEvent.on(({ newLayout }) => {
    $body.classList.remove('layout-side', 'layout-main', 'layout-off');
    switch (newLayout) {
        case Layout.SIDE:
            $body.classList.add('layout-side');
            break;
        case Layout.MAIN:
            $body.classList.add('layout-main');
            break;
        case Layout.OFF:
            $body.classList.add('layout-off');
            break;
    }
});
let layout = Layout.OFF;
function getCurrentLayout() {
    return layout;
}
exports.getCurrentLayout = getCurrentLayout;
function setLayout(newLayout) {
    debugLogger.log(`${Layout[layout]} -> ${Layout[newLayout]}`);
    if (layout === newLayout) {
        return;
    }
    // if (newLayout === Layout.OFF) {
    //   $rect.classList.remove('reading');
    // } else {
    //   if (layout === Layout.MAIN) {
    //     $rect.classList.remove('main');
    //   } else if (layout === Layout.SIDE) {
    //     $rect.classList.remove('side');
    //   } else {
    //     $rect.classList.remove('main', 'side');
    //     $rect.classList.add('reading');
    //   }
    //   if (newLayout === Layout.MAIN) {
    //     $rect.classList.add('main');
    //   } else {
    //     $rect.classList.add('side');
    //   }
    // }
    exports.layoutChangeEvent.emit({
        previousLayout: layout,
        newLayout,
    });
    layout = newLayout;
}
exports.setLayout = setLayout;

},{"../DebugLogger":6,"../Event":7}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const settings_1 = require("../data/settings");
const hs_1 = require("../hs");
const keyboard_1 = require("../input/keyboard");
const DOM_1 = require("../util/DOM");
const $modalHolder = DOM_1.id('modal-holder');
class Modal {
    constructor($initElement = hs_1.h('div')) {
        this.dismissSet = false;
        this.escKeyListener = null;
        $initElement.classList.add('modal');
        this.modal = $initElement;
        this.modalContainer = hs_1.h('.modal-container.closed', $initElement);
        $modalHolder.appendChild(this.modalContainer);
    }
    open() {
        // tslint:disable-next-line:no-unused-expression
        this.modalContainer.offsetWidth; // Force reflow
        this.modalContainer.classList.remove('closed');
    }
    close() {
        if (settings_1.animation.getValue()) {
            this.modalContainer.classList.add('closed');
            setTimeout(() => {
                this.modalContainer.remove();
            }, 400);
        }
        else {
            this.modalContainer.remove();
        }
        if (this.escKeyListener !== null) {
            keyboard_1.escapeKeyPressEvent.off(this.escKeyListener);
        }
    }
    setDismissible(onDismiss = () => {
        this.close();
    }) {
        if (this.dismissSet) {
            throw new Error('Dismissible already set.');
        }
        this.dismissSet = true;
        keyboard_1.escapeKeyPressEvent.on(onDismiss);
        this.modalContainer.addEventListener('click', event => {
            if (event.target === this.modalContainer) {
                onDismiss();
            }
        });
    }
}
exports.Modal = Modal;
function confirm(title, desc, yes, no) {
    let resolved = false;
    return new Promise(resolve => {
        const modal = new Modal(hs_1.h('div', [
            hs_1.h('h1', title),
            desc === '' ? null : hs_1.h('p', desc),
            hs_1.h('.button-container', [
                hs_1.h('div', {
                    onclick: () => {
                        if (resolved) {
                            return;
                        }
                        resolved = true;
                        modal.close();
                        resolve(true);
                    },
                }, yes),
                hs_1.h('div', {
                    onclick: () => {
                        if (resolved) {
                            return;
                        }
                        resolved = true;
                        modal.close();
                        resolve(false);
                    },
                }, no),
            ]),
        ]));
        modal.open();
    });
}
exports.confirm = confirm;
function isAnyModalOpened() {
    return $modalHolder.childElementCount > 0;
}
exports.isAnyModalOpened = isAnyModalOpened;

},{"../data/settings":34,"../hs":36,"../input/keyboard":39,"../util/DOM":50}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DOM_1 = require("../util/DOM");
function processElements($parent) {
    Array.from($parent.getElementsByTagName('a')).forEach(($anchor) => {
        $anchor.target = '_blank';
        $anchor.rel = 'noopener noreferrer';
        $anchor.className = 'regular';
    });
    Array.from($parent.getElementsByTagName('code')).forEach($code => $code.addEventListener('dblclick', () => {
        if (!($code.parentNode instanceof HTMLPreElement)) {
            DOM_1.selectNode($code);
        }
    }));
    Array.from($parent.getElementsByTagName('img')).forEach($image => {
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
}
exports.processElements = processElements;

},{"../util/DOM":50}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const state_1 = require("../data/state");
const history_1 = require("./history");
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

},{"../data/state":35,"./history":26}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hs_1 = require("../hs");
const contentControl_1 = require("./contentControl");
const modalControl_1 = require("./modalControl");
const MakaiControl_1 = require("./MakaiControl");
const state_1 = require("../data/state");
const commentsControl_1 = require("./commentsControl");
const messages_1 = require("../constant/messages");
class UserControl {
    static showMessage(message) {
        const modal = new modalControl_1.Modal(hs_1.h('div', [
            hs_1.h('h1', messages_1.MAKAI_MODAL_TITLE_INFO),
            hs_1.h('p', message),
            hs_1.h('.button-container', [
                hs_1.h('div', {
                    onclick: () => {
                        modal.close();
                    }
                }, messages_1.MAKAI_MODAL_OK),
            ]),
        ]));
        modal.setDismissible();
        modal.open();
    }
    static showLoading(message) {
        const m = new modalControl_1.Modal(hs_1.h('div', [
            hs_1.h('h1', messages_1.MAKAI_MODAL_TITLE_WAITING),
            hs_1.h('p', message),
        ]));
        m.open();
        return m;
    }
    static showLogin() {
        let token;
        const modal = new modalControl_1.Modal(hs_1.h('div', [
            hs_1.h('h1', messages_1.MAKAI_MODAL_TITLE_TOKEN),
            hs_1.h('p', messages_1.MAKAI_MODAL_CONTENT_THIS_IS_YOUR_MAKAI_TOKEN),
            hs_1.h('p', messages_1.MAKAI_MODAL_CONTENT_MAKAI_TOKEN_IS_USED_TO_SUBMIT_COMMENTS),
            hs_1.h('p', messages_1.MAKAI_MODAL_CONTENT_YOU_WILL_GET_MAKAI_TOKEN_ONCE_YOU_SUBMIT_FIRST_COMMENT),
            hs_1.h('i', messages_1.MAKAI_MODAL_CONTENT_DEVELOPMENT_HINT),
            hs_1.h('ul', [
                messages_1.MAKAI_MODAL_CONTENT_TOKEN_INPUT_PREFIX,
                token = hs_1.h('input.makai-token', { value: MakaiControl_1.MakaiControl.getToken() === undefined ? '' : MakaiControl_1.MakaiControl.getToken() }),
            ]),
            hs_1.h('.button-container', [
                hs_1.h('div', {
                    onclick: () => {
                        modal.close();
                    }
                }, messages_1.MAKAI_MODAL_CANCEL),
                hs_1.h('div', {
                    onclick: () => {
                        if (token.value === '') {
                            UserControl.showMessage(messages_1.MAKAI_ERROR_EMPTY_TOKEN);
                            return;
                        }
                        const m = UserControl.showLoading(messages_1.MAKAI_INFO_CONFIRM_TOKEN);
                        fetch(MakaiControl_1.MakaiControl.url + '/username/' + token.value).then((response) => {
                            return response.json();
                        })
                            .then((json) => {
                            m.close();
                            if (json.username == null) {
                                UserControl.showMessage(messages_1.MAKAI_ERROR_INVALID_TOKEN);
                            }
                            else {
                                MakaiControl_1.MakaiControl.saveToken(token.value);
                                MakaiControl_1.MakaiControl.saveUsername(json.username);
                                modal.close();
                                UserControl.showMessage(messages_1.MAKAI_INFO_SET_TOKKEN_SUCCESS);
                            }
                        }).catch((err) => {
                            m.close();
                            UserControl.showMessage(messages_1.MAKAI_ERROR_INTERNET);
                        });
                    }
                }, messages_1.MAKAI_MODAL_SAVE),
            ]),
        ]));
        modal.setDismissible();
        modal.open();
    }
    static sendComment(textarea, block, modal) {
        var _a;
        if (!MakaiControl_1.MakaiControl.hasToken()) {
            UserControl.showMessage(messages_1.MAKAI_ERROR_INVALID_TOKEN);
            return;
        }
        const m = UserControl.showLoading(messages_1.MAKAI_INFO_CONFIRM_TOKEN);
        fetch(MakaiControl_1.MakaiControl.url + '/comment/' + MakaiControl_1.MakaiControl.getToken(), {
            body: JSON.stringify({ pageName: (_a = state_1.state.currentChapter) === null || _a === void 0 ? void 0 : _a.chapter.htmlRelativePath.replace(/\//g, '.'), content: textarea }),
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            method: 'POST',
            mode: 'cors',
            redirect: 'follow',
            referrer: 'no-referrer',
        }).then((response) => {
            return response.json();
        })
            .then((json) => {
            m.close();
            if (!json.success) {
                UserControl.showMessage(messages_1.MAKAI_ERROR_SUBMIT_COMMENT_INVALID_TOKEN);
            }
            else {
                block.directRemove();
                commentsControl_1.commentsCache.delete(commentsControl_1.getApiUrl());
                commentsControl_1.loadComments(contentControl_1.getCurrentContent());
                modal.close();
            }
        }).catch((err) => {
            m.close();
            UserControl.showMessage(messages_1.MAKAI_ERROR_INTERNET);
        });
    }
    static showComment(block) {
        const nameInput = hs_1.h('input.makai-input');
        const emailInput = hs_1.h('input.makai-input');
        const name = MakaiControl_1.MakaiControl.hasToken()
            ? hs_1.h('ul', [messages_1.MAKAI_GENERIC_AS + MakaiControl_1.MakaiControl.getUsername() + messages_1.MAKAI_GENERIC_SUBMIT]) : hs_1.h('ul', [
            messages_1.MAKAI_MODAL_CONTENT_NAME_INPUT_PREFIX,
            nameInput,
            hs_1.h('br'),
            messages_1.MAKAI_MODAL_CONTENT_EMAIL_INPUT_PREFIX,
            emailInput,
        ]);
        const textarea = hs_1.h('textarea.makai-comment');
        const modal = new modalControl_1.Modal(hs_1.h('div', [
            hs_1.h('h1', messages_1.MAKAI_MODAL_TITLE_COMMENT),
            hs_1.h('p', messages_1.MAKAI_MODAL_CONTENT_COMMENT_HINT),
            textarea,
            name,
            hs_1.h('.button-container', [
                hs_1.h('div', {
                    onclick: () => {
                        modal.close();
                    }
                }, messages_1.MAKAI_MODAL_CANCEL),
                hs_1.h('div', {
                    onclick: () => {
                        if (!MakaiControl_1.MakaiControl.hasToken()) {
                            const m = UserControl.showLoading(messages_1.MAKAI_INFO_OBTAIN_TOKEN);
                            const alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                            fetch(MakaiControl_1.MakaiControl.url + '/register/', {
                                body: JSON.stringify({ username: nameInput.value, email: emailInput.value, encodedPassword: new Array(20).fill(undefined).map(() => alpha[Math.floor(Math.random() * alpha.length)]).join('') }),
                                cache: 'no-cache',
                                headers: new Headers({
                                    'Content-Type': 'application/json'
                                }),
                                credentials: 'same-origin',
                                method: 'POST',
                                mode: 'cors',
                                redirect: 'follow',
                                referrer: 'no-referrer',
                            }).then((response) => {
                                return response.json();
                            })
                                .then((json) => {
                                m.close();
                                if (!json.success) {
                                    switch (json.errorMessage) {
                                        case 'Illegal email format.':
                                            UserControl.showMessage(messages_1.MAKAI_ERROR_INVALID_EMAIL);
                                            break;
                                        case 'User exist.':
                                            UserControl.showMessage(messages_1.MAKAI_ERROR_USER_EXIST);
                                            break;
                                        default:
                                            UserControl.showMessage(messages_1.MAKAI_ERROR_UNKNOWN);
                                            break;
                                    }
                                }
                                else if (json.accessToken == null) {
                                    UserControl.showMessage(messages_1.MAKAI_ERROR_UNKNOWN);
                                }
                                else {
                                    MakaiControl_1.MakaiControl.saveToken(json.accessToken);
                                    MakaiControl_1.MakaiControl.saveUsername(nameInput.value);
                                    UserControl.sendComment(textarea.value, block, modal);
                                }
                            }).catch((err) => {
                                m.close();
                                UserControl.showMessage(messages_1.MAKAI_ERROR_INTERNET);
                            });
                        }
                        else {
                            this.sendComment(textarea.value, block, modal);
                        }
                    }
                }, messages_1.MAKAI_MODAL_SUBMIT),
            ]),
        ]));
        modal.setDismissible();
        modal.open();
    }
}
exports.UserControl = UserControl;

},{"../constant/messages":11,"../data/state":35,"../hs":36,"./MakaiControl":14,"./commentsControl":20,"./contentControl":21,"./modalControl":28}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AutoCache {
    constructor(loader, logger) {
        this.loader = loader;
        this.logger = logger;
        this.map = new Map();
    }
    delete(key) {
        this.map.delete(key);
    }
    get(key) {
        let value = this.map.get(key);
        if (value === undefined) {
            this.logger.log(`Start loading for key=${key}.`);
            value = this.loader(key);
            this.map.set(key, value);
            value.catch(error => {
                this.map.delete(key);
                this.logger.warn(`Loader failed for key=${key}. Cache removed.`, error);
            });
        }
        else {
            this.logger.log(`Cached value used for key=${key}.`);
        }
        return value;
    }
}
exports.AutoCache = AutoCache;

},{}],33:[function(require,module,exports){
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

},{}],34:[function(require,module,exports){
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
exports.wtcdGameQuickLoadConfirm = new BooleanSetting('wtcdGameQuickLoadConfirm', true);

},{}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.state = {
    currentChapter: null,
    chapterSelection: null,
    chapterTextNodes: null,
};

},{}],36:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hs = require("hyperscript");
exports.h = hs;

},{"hyperscript":4}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const followQuery_1 = require("./control/followQuery");
const updateSelection_1 = require("./control/updateSelection");
const data_1 = require("./data/data");
const settings_1 = require("./data/settings");
const MainMenu_1 = require("./menu/MainMenu");
const DOM_1 = require("./util/DOM");
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

},{"./control/followQuery":24,"./control/updateSelection":30,"./data/data":33,"./data/settings":34,"./menu/MainMenu":43,"./util/DOM":50}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DebugLogger_1 = require("../DebugLogger");
const Event_1 = require("../Event");
const DOM_1 = require("../util/DOM");
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
const swipeEventDebugLogger = new DebugLogger_1.DebugLogger('Swipe Event');
exports.swipeEvent.on(direction => {
    swipeEventDebugLogger.log(SwipeDirection[direction]);
});

},{"../DebugLogger":6,"../Event":7,"../util/DOM":50}],39:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DebugLogger_1 = require("../DebugLogger");
const Event_1 = require("../Event");
var ArrowKey;
(function (ArrowKey) {
    ArrowKey[ArrowKey["LEFT"] = 0] = "LEFT";
    ArrowKey[ArrowKey["UP"] = 1] = "UP";
    ArrowKey[ArrowKey["RIGHT"] = 2] = "RIGHT";
    ArrowKey[ArrowKey["DOWN"] = 3] = "DOWN";
})(ArrowKey = exports.ArrowKey || (exports.ArrowKey = {}));
exports.arrowKeyPressEvent = new Event_1.Event();
exports.escapeKeyPressEvent = new Event_1.Event();
document.addEventListener('keydown', event => {
    if (event.repeat) {
        return;
    }
    switch (event.keyCode) {
        case 27:
            exports.escapeKeyPressEvent.emit();
            break;
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
const arrowEventDebugLogger = new DebugLogger_1.DebugLogger('Arrow Key Event');
exports.arrowKeyPressEvent.on(arrowKey => {
    arrowEventDebugLogger.log(ArrowKey[arrowKey]);
});

},{"../DebugLogger":6,"../Event":7}],40:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const messages_1 = require("../constant/messages");
const commentBlockControl_1 = require("../control/commentBlockControl");
const Menu_1 = require("../Menu");
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

},{"../Menu":8,"../constant/messages":11,"../control/commentBlockControl":19}],41:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chapterControl_1 = require("../control/chapterControl");
const history_1 = require("../control/history");
const data_1 = require("../data/data");
const Menu_1 = require("../Menu");
const shortNumber_1 = require("../util/shortNumber");
const chapterSelectionButtonsMap = new Map();
let currentLastReadLabelAt = null;
function attachLastReadLabelTo(button) {
    if (button === undefined) {
        return;
    }
    currentLastReadLabelAt = button.append('[上次阅读]');
}
chapterControl_1.loadChapterEvent.on(newChapterHtmlRelativePath => {
    if (currentLastReadLabelAt !== null) {
        currentLastReadLabelAt.remove();
    }
    attachLastReadLabelTo(chapterSelectionButtonsMap.get(newChapterHtmlRelativePath));
});
function getDecorationForChapterType(chapterType) {
    switch (chapterType) {
        case 'Markdown': return Menu_1.ItemDecoration.ICON_FILE;
        case 'WTCD': return Menu_1.ItemDecoration.ICON_GAME;
    }
}
function isEmptyFolder(folder) {
    if (folder.chapters.length !== 0) {
        return false;
    }
    return folder.subFolders.every(isEmptyFolder);
}
exports.isEmptyFolder = isEmptyFolder;
class ChaptersMenu extends Menu_1.Menu {
    constructor(parent, folder) {
        if (folder === undefined) {
            folder = data_1.data.chapterTree;
        }
        super(folder.isRoot ? '章节选择' : folder.displayName, parent);
        for (const subfolder of folder.subFolders) {
            if (isEmptyFolder(subfolder)) {
                continue;
            }
            const handle = this.addLink(new ChaptersMenu(this, subfolder), true, Menu_1.ItemDecoration.ICON_FOLDER);
            handle.append(`[${shortNumber_1.shortNumber(subfolder.folderCharCount)}]`, 'char-count');
        }
        for (const chapter of folder.chapters) {
            if (chapter.hidden) {
                continue;
            }
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
                attachLastReadLabelTo(handle);
            }
            chapterSelectionButtonsMap.set(chapter.htmlRelativePath, handle);
        }
    }
}
exports.ChaptersMenu = ChaptersMenu;

},{"../Menu":8,"../control/chapterControl":18,"../control/history":26,"../data/data":33,"../util/shortNumber":55}],42:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Menu_1 = require("../Menu");
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

},{"../Menu":8}],43:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Menu_1 = require("../Menu");
const ChaptersMenu_1 = require("./ChaptersMenu");
const ContactMenu_1 = require("./ContactMenu");
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

},{"../Menu":8,"./ChaptersMenu":41,"./ContactMenu":42,"./SettingsMenu":45,"./StatsMenu":47,"./StyleMenu":48,"./ThanksMenu":49}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Menu_1 = require("../Menu");
const userControl_1 = require("../control/userControl");
const SettingsMenu_1 = require("./SettingsMenu");
class MakaiMenu extends Menu_1.Menu {
    constructor(parent) {
        super('Makai 评论系统管理', parent);
        this.addItem('Makai 令牌', {
            small: true,
            button: true,
        }).onClick(() => {
            userControl_1.UserControl.showLogin();
        });
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
        const enumSettingMenu = new SettingsMenu_1.EnumSettingMenu(this, label, setting, usePreview === true);
        handle.linkTo(enumSettingMenu).onClick(() => {
            this.activateEvent.once(() => {
                handle.setInnerText(getText());
            });
        });
    }
}
exports.MakaiMenu = MakaiMenu;

},{"../Menu":8,"../control/userControl":31,"./SettingsMenu":45}],45:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stylePreviewArticle_1 = require("../constant/stylePreviewArticle");
const contentControl_1 = require("../control/contentControl");
const layoutControl_1 = require("../control/layoutControl");
const settings_1 = require("../data/settings");
const Menu_1 = require("../Menu");
const BlockMenu_1 = require("./BlockMenu");
const MakaiMenu_1 = require("./MakaiMenu");
class EnumSettingMenu extends Menu_1.Menu {
    constructor(parent, label, setting, usePreview) {
        super(`${label}设置`, parent, usePreview ? layoutControl_1.Layout.SIDE : layoutControl_1.Layout.MAIN);
        let currentHandle;
        if (usePreview) {
            this.activateEvent.on(() => {
                const block = contentControl_1.newContent(contentControl_1.Side.RIGHT).addBlock();
                block.element.innerHTML = stylePreviewArticle_1.stylePreviewArticle;
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
        this.addLink(new MakaiMenu_1.MakaiMenu(this), true);
        this.addBooleanSetting('NSFW 警告', settings_1.warning);
        this.addBooleanSetting('使用动画', settings_1.animation);
        this.addBooleanSetting('显示编写中章节', settings_1.earlyAccess);
        this.addBooleanSetting('显示评论', settings_1.useComments);
        this.addBooleanSetting('手势切换章节（仅限手机）', settings_1.gestureSwitchChapter);
        this.addEnumSetting('字体', settings_1.fontFamily, true);
        this.addBooleanSetting('显示每个章节的字数', settings_1.charCount);
        this.addBooleanSetting('WTCD 游戏快速读取前确认', settings_1.wtcdGameQuickLoadConfirm);
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

},{"../Menu":8,"../constant/stylePreviewArticle":12,"../control/contentControl":21,"../control/layoutControl":27,"../data/settings":34,"./BlockMenu":40,"./MakaiMenu":44}],46:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_1 = require("../data/data");
const Menu_1 = require("../Menu");
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

},{"../Menu":8,"../data/data":33}],47:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_1 = require("../data/data");
const Menu_1 = require("../Menu");
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

},{"../Menu":8,"../data/data":33,"./StatsKeywordsCountMenu":46}],48:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stylePreviewArticle_1 = require("../constant/stylePreviewArticle");
const contentControl_1 = require("../control/contentControl");
const layoutControl_1 = require("../control/layoutControl");
const DebugLogger_1 = require("../DebugLogger");
const hs_1 = require("../hs");
const Menu_1 = require("../Menu");
class Style {
    constructor(name, def) {
        this.name = name;
        this.def = def;
        this.styleSheet = null;
        this.debugLogger = new DebugLogger_1.DebugLogger(`Style (${name})`);
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
        // attemptInsertRule(`.rect { background-color: ${this.def.rectBgColor}; }`);
        // attemptInsertRule(`.rect.reading>div { background-color: ${this.def.paperBgColor}; }`);
        // attemptInsertRule(`.rect.reading>div { color: ${key}; }`);
        // attemptInsertRule(`.rect.reading>.content a { color: ${this.def.linkColor}; }`);
        // attemptInsertRule(`.rect.reading>.content a:hover { color: ${this.def.linkHoverColor}; }`);
        // attemptInsertRule(`.rect.reading>.content a:active { color: ${this.def.linkActiveColor}; }`);
        // attemptInsertRule(`.rect.reading .early-access.content-block { background-color: ${this.def.contentBlockEarlyAccessColor}; }`);
        // attemptInsertRule(`.rect>.comments>div { background-color: ${this.def.commentColor}; }`);
        // attemptInsertRule(`@media (min-width: 901px) { ::-webkit-scrollbar-thumb { background-color: ${this.def.paperBgColor}; } }`);
        // attemptInsertRule(`.rect>.comments>.create-comment::before { background-color: ${key}; }`);
        attemptInsertRule(`:root { --comment-color:${this.def.commentColor}; }`);
        attemptInsertRule(`:root { --content-block-warning-color:${this.def.contentBlockWarningColor}; }`);
        attemptInsertRule(`:root { --rect-bg-color: ${this.def.rectBgColor}; }`);
        attemptInsertRule(`:root { --paper-bg-color: ${this.def.paperBgColor}; }`);
        attemptInsertRule(`:root { --link-color: ${this.def.linkColor}; }`);
        attemptInsertRule(`:root { --link-hover-color: ${this.def.linkHoverColor}; }`);
        attemptInsertRule(`:root { --link-active-color: ${this.def.linkActiveColor}; }`);
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
        if (Style.themeColorMetaTag === null) {
            Style.themeColorMetaTag = hs_1.h('meta', {
                name: 'theme-color',
                content: this.def.paperBgColor,
            });
            document.head.appendChild(Style.themeColorMetaTag);
        }
        else {
            Style.themeColorMetaTag.content = this.def.paperBgColor;
        }
        Style.currentlyEnabled = this;
    }
}
Style.currentlyEnabled = null;
Style.themeColorMetaTag = null;
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
    new Style('可穿戴科技（默认）', Object.assign(Object.assign({ rectBgColor: '#444', paperBgColor: '#333', keyColor: [221, 221, 221] }, lightKeyLinkColors), { contentBlockWarningColor: '#E65100', commentColor: '#444', keyIsDark: false })),
    new Style('白纸', Object.assign(Object.assign({ rectBgColor: '#EFEFED', paperBgColor: '#FFF', keyColor: [0, 0, 0] }, darkKeyLinkColors), { contentBlockWarningColor: '#FFE082', commentColor: '#F5F5F5', keyIsDark: true })),
    new Style('夜间', Object.assign(Object.assign({ rectBgColor: '#272B36', paperBgColor: '#38404D', keyColor: [221, 221, 221] }, lightKeyLinkColors), { contentBlockWarningColor: '#E65100', commentColor: '#272B36', keyIsDark: false })),
    new Style('羊皮纸', Object.assign(Object.assign({ rectBgColor: '#D8D4C9', paperBgColor: '#F8F4E9', keyColor: [85, 40, 48] }, darkKeyLinkColors), { contentBlockWarningColor: '#FFE082', commentColor: '#F9EFD7', keyIsDark: true })),
    new Style('巧克力', Object.assign(Object.assign({ rectBgColor: '#2E1C11', paperBgColor: '#3A2519', keyColor: [221, 175, 153] }, lightKeyLinkColors), { contentBlockWarningColor: '#E65100', commentColor: '#2C1C11', keyIsDark: false })),
];
class StyleMenu extends Menu_1.Menu {
    constructor(parent) {
        super('阅读器样式', parent, layoutControl_1.Layout.SIDE);
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
            const content = contentControl_1.newContent(contentControl_1.Side.RIGHT);
            const $div = content.addBlock().element;
            $div.innerHTML = stylePreviewArticle_1.stylePreviewArticle;
        });
    }
}
exports.StyleMenu = StyleMenu;

},{"../DebugLogger":6,"../Menu":8,"../constant/stylePreviewArticle":12,"../control/contentControl":21,"../control/layoutControl":27,"../hs":36}],49:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const thanks_1 = require("../constant/thanks");
const Menu_1 = require("../Menu");
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

},{"../Menu":8,"../constant/thanks":13}],50:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DebugLogger_1 = require("../DebugLogger");
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
const selectNodeDebugLogger = new DebugLogger_1.DebugLogger('Select Node');
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
function insertAfter($newElement, $referencingElement) {
    $referencingElement.parentElement.insertBefore($newElement, $referencingElement.nextSibling);
}
exports.insertAfter = insertAfter;

},{"../DebugLogger":6}],51:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MAX_RELATIVE_TIME = 7 * DAY;
function formatTimeRelative(time) {
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
exports.formatTimeRelative = formatTimeRelative;
function formatTimeSimple(time) {
    return `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()} ` +
        `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;
}
exports.formatTimeSimple = formatTimeSimple;

},{}],52:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const DebugLogger_1 = require("../DebugLogger");
const matchAll_1 = require("./matchAll");
const debugLogger = new DebugLogger_1.DebugLogger('Load Google Fonts');
const parseRegex = /@font-face {[^}]*?font-family:\s*['"]?([^;'"]+?)['"]?;[^}]*?font-style:\s*([^;]+);[^}]*?font-weight:\s*([^;]+);[^}]*?src:\s*([^;]+);[^}]*?(?:unicode-range:\s*([^;]+))?;/g;
function loadGoogleFonts(fontName) {
    return __awaiter(this, void 0, void 0, function* () {
        const cssLink = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}`;
        debugLogger.log(`Loading font: "${fontName}" from "${cssLink}".`);
        const response = yield fetch(cssLink);
        const text = yield response.text();
        const matches = matchAll_1.matchAll(text, parseRegex);
        return Promise.all(matches.map(match => new FontFace(match[1], match[4], {
            style: match[2],
            weight: match[3],
            unicodeRange: match[5],
        }).load()))
            .then(fontFaces => fontFaces.map(fontFace => document.fonts.add(fontFace)))
            .then(() => fontName);
    });
}
exports.loadGoogleFonts = loadGoogleFonts;

},{"../DebugLogger":6,"./matchAll":53}],53:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function matchAll(str, regex) {
    if (regex.global !== true) {
        throw new Error('Global flag is required.');
    }
    const results = [];
    let array;
    while ((array = regex.exec(str)) !== null) {
        results.push(array);
    }
    return results;
}
exports.matchAll = matchAll;

},{}],54:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Input: ['a/b', '..', 'c/../e', 'f']
 * Output: 'a/e/f'
 */
function resolvePath(...paths) {
    const pathStack = [];
    for (const path of paths) {
        const segments = path.split('/');
        for (const segment of segments) {
            switch (segment) {
                case '':
                case '.':
                    return null;
                case '..':
                    if (pathStack.length === 0) {
                        return null;
                    }
                    else {
                        pathStack.pop();
                    }
                    break;
                default:
                    pathStack.push(segment);
            }
        }
    }
    return pathStack.join('/');
}
exports.resolvePath = resolvePath;

},{}],55:[function(require,module,exports){
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

},{}],56:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// https://stackoverflow.com/a/7616484
function stringHash(str) {
    let hash = 0;
    if (str.length === 0) {
        return hash;
    }
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return hash;
}
exports.stringHash = stringHash;

},{}],57:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ChainedCanvas {
    constructor(width, height) {
        this.promise = Promise.resolve();
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d');
    }
    updatePromise(updater) {
        this.promise = this.promise.then(updater);
    }
    onResolve(callback) {
        this.promise.then(callback);
    }
    getWidth() {
        return this.canvas.width;
    }
    getHeight() {
        return this.canvas.height;
    }
}
exports.ChainedCanvas = ChainedCanvas;

},{}],58:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Implement methods to provide additional feature support.
 */
class FeatureProvider {
    /**
     * When using the canvas functionality of WTCD, user may choose to put an
     * external image to the canvas. Whenever that happens, this method is called.
     */
    loadImage(path) {
        return Promise.reject('Loading images is not allowed.');
    }
    /**
     * When using the canvas functionality of WTCD, user may choose to use a
     * custom font in the canvas. Whenever that happens, this method is called.
     *
     * Please make sure the font is loaded in DOM via document.fonts#add
     *
     * Returns the name of the font
     */
    loadFont(identifier) {
        return Promise.reject('Loading fonts is not allowed.');
    }
}
exports.FeatureProvider = FeatureProvider;
exports.defaultFeatureProvider = new FeatureProvider();

},{}],59:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Interpreter_1 = require("./Interpreter");
const Random_1 = require("./Random");
const FeatureProvider_1 = require("./FeatureProvider");
/**
 * This is one of the possible implementations of a WTCD reader.
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
    constructor(docIdentifier, wtcdRoot, errorMessageCreator, elementPreprocessor, featureProvider = FeatureProvider_1.defaultFeatureProvider) {
        this.wtcdRoot = wtcdRoot;
        this.errorMessageCreator = errorMessageCreator;
        this.elementPreprocessor = elementPreprocessor;
        this.featureProvider = featureProvider;
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
        this.interpreter = new Interpreter_1.Interpreter(this.wtcdRoot, new Random_1.Random(this.data.random), this.featureProvider);
        this.interpreterIterator = this.interpreter.start();
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
        $container.classList.add('wtcd-group-container');
        output.content.forEach($element => $container.appendChild($element));
        this.interpreter.getPinned().forEach($element => $container.appendChild($element));
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
        this.elementPreprocessor($container);
    }
    renderTo($target) {
        if (this.started) {
            throw new Error('Flow reader already started.');
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

},{"./FeatureProvider":58,"./Interpreter":61,"./Random":62}],60:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Interpreter_1 = require("./Interpreter");
const Random_1 = require("./Random");
const FeatureProvider_1 = require("./FeatureProvider");
function isGameData(data) {
    if (typeof data !== 'object' || data === null) {
        return false;
    }
    if (typeof data.random !== 'string') {
        return false;
    }
    if (!Array.isArray(data.decisions)) {
        return false;
    }
    if (data.decisions.some((decision) => typeof decision !== 'number')) {
        return false;
    }
    return true;
}
function isSaveData(data) {
    if (!isGameData(data)) {
        return false;
    }
    if (typeof data.date !== 'number') {
        return false;
    }
    if (typeof data.desc !== 'string') {
        return false;
    }
    return true;
}
function isData(data) {
    if (typeof data !== 'object' || data === null) {
        return false;
    }
    if (!isGameData(data.current)) {
        return false;
    }
    if (!Array.isArray(data.saves)) {
        return false;
    }
    if (!data.saves.every((save) => save === null || isSaveData(save))) {
        return false;
    }
    return true;
}
/**
 * This is one of the possible implementations of a WTCD reader.
 *
 * This is a reader specialized for games. This reader only display one section
 * at a time. This reader also does not allow undo.
 *
 * However, this reader does support save/load. It persists data via memorizing
 * all decisions too.
 */
class GameReader {
    constructor(docIdentifier, wtcdRoot, onOutput, onError, featureProvider = FeatureProvider_1.defaultFeatureProvider) {
        this.wtcdRoot = wtcdRoot;
        this.onOutput = onOutput;
        this.onError = onError;
        this.featureProvider = featureProvider;
        this.started = false;
        this.storageKey = `wtcd.gr.${docIdentifier}`;
        this.data = this.parseData(window.localStorage.getItem(this.storageKey)) || {
            saves: [null, null, null],
            current: {
                random: String(Math.random()),
                decisions: [],
            },
        };
    }
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
        if (!isData(obj)) {
            return null;
        }
        return obj;
    }
    persist() {
        window.localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }
    getSaves() {
        return this.data.saves.map(save => save === null
            ? null
            : {
                desc: save.desc,
                date: new Date(save.date),
            });
    }
    reset(reseed) {
        this.data.current.decisions = [];
        if (reseed) {
            this.data.current.random = String(Math.random());
        }
        this.restoreGameState();
        this.persist();
    }
    save(saveIndex) {
        const save = this.data.saves[saveIndex];
        if (save === undefined) {
            throw new Error(`Illegal save index: ${saveIndex}`);
        }
        this.data.saves[saveIndex] = {
            date: Date.now(),
            desc: this.interpreter.getStateDesc() || '',
            random: this.data.current.random,
            decisions: this.data.current.decisions.slice(),
        };
        if (this.data.saves[this.data.saves.length - 1] !== null) {
            this.data.saves.push(null);
        }
        this.persist();
    }
    load(saveIndex) {
        const save = this.data.saves[saveIndex];
        if (save === undefined || save === null) {
            throw new Error(`Illegal save index: ${saveIndex}.`);
        }
        this.data.current.random = save.random;
        this.data.current.decisions = save.decisions.slice();
        this.restoreGameState();
        this.persist();
    }
    /** Calls this.interpreterIterator.next() and handles error. */
    next(decision) {
        try {
            return this.interpreterIterator.next(decision);
        }
        catch (error) {
            this.onError(error);
            return {
                done: true,
                value: {
                    choices: [],
                    content: [],
                },
            };
        }
    }
    restoreGameState() {
        this.interpreter = new Interpreter_1.Interpreter(this.wtcdRoot, new Random_1.Random(this.data.current.random), this.featureProvider);
        this.interpreterIterator = this.interpreter.start();
        let lastOutput = this.next();
        this.data.current.decisions.forEach(decision => lastOutput = this.next(decision));
        this.handleOutput(lastOutput.value);
    }
    handleOutput(output) {
        const $output = document.createElement('div');
        output.content.forEach($element => $output.appendChild($element));
        this.interpreter.getPinned()
            .forEach($element => $output.appendChild($element));
        const decisionIndex = this.data.current.decisions.length;
        const buttons = output.choices.map((choice, choiceIndex) => {
            const $button = document.createElement('div');
            $button.classList.add('wtcd-button');
            $button.innerText = choice.content;
            if (choice.disabled) {
                $button.classList.add('disabled');
            }
            else {
                $button.classList.add('candidate');
                $button.addEventListener('click', () => {
                    if (decisionIndex !== this.data.current.decisions.length) {
                        return;
                    }
                    this.data.current.decisions.push(choiceIndex);
                    buttons.forEach($eachButton => {
                        if ($eachButton === $button) {
                            $eachButton.classList.add('selected');
                        }
                        else {
                            $eachButton.classList.add('unselected');
                        }
                    });
                    this.handleOutput(this.next(choiceIndex).value);
                    this.persist();
                });
            }
            $output.appendChild($button);
            return $button;
        });
        this.onOutput($output);
    }
    start() {
        if (this.started) {
            throw new Error('Game reader already started.');
        }
        this.started = true;
        this.restoreGameState();
    }
}
exports.GameReader = GameReader;

},{"./FeatureProvider":58,"./Interpreter":61,"./Random":62}],61:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constantsPool_1 = require("./constantsPool");
const invokeFunction_1 = require("./invokeFunction");
const operators_1 = require("./operators");
const std_1 = require("./std");
const utils_1 = require("./utils");
const WTCDError_1 = require("./WTCDError");
/**
 * Determine whether two runtime values are equal. Uses deep value equality
 * instead of reference equality.
 */
function isEqual(v0, v1) {
    // TypeScript's generic currently does not support type narrowing.
    // Until that is fixed, this function has to have so many any, unfortunately
    if (v0.type !== v1.type) {
        return false;
    }
    switch (v0.type) {
        case 'null':
            return true;
        case 'number':
        case 'boolean':
        case 'string':
            return v0.value === v1.value;
        case 'action':
            if (v0.value.action !== v1.value.action) {
                return false;
            }
            switch (v0.value.action) {
                case 'exit':
                    return true;
                case 'goto':
                    return utils_1.arrayEquals(v0.value.target, v1.value.target);
                case 'selection':
                    return (v0.value.choices.length
                        === v1.value.choices.length) &&
                        (v0.value.choices.every((choice, index) => isEqual(choice, v1.value.choices[index])));
            }
            throw new Error('Shouldn\'t fall through.');
        case 'choice':
            return ((v0.value.text === v1.value.text) &&
                (isEqual(v0.value.action, v1.value.action)));
        case 'function':
            if (v0.value.fnType !== v1.value.fnType) {
                return false;
            }
            if (v0.value.fnType === 'native') {
                return (v0.value.nativeFn === v1.value.nativeFn);
            }
            else if (v0.value.fnType === 'wtcd') {
                return (
                // They refer to same expression
                (v0.value.expr === v1.value.expr) &&
                    (v0.value.captured.every((v0Cap, index) => {
                        const v1Cap = v1.value.captured[index];
                        return ((v0Cap.name === v1Cap.name) &&
                            // Reference equality to make sure they captured the same
                            // variable
                            (v0Cap.value === v1Cap.value));
                    })));
            }
            else {
                return ((v0.value.isLeft === v1.value.isLeft) &&
                    (isEqual(v0.value.targetFn, v1.value.targetFn)) &&
                    (utils_1.arrayEquals(v0.value.applied, v1.value.applied, isEqual)));
            }
        case 'list':
            return ((v0.value.length === v1.value.length) &&
                (v0.value.every((element, index) => isEqual(element, v1.value[index]))));
    }
}
exports.isEqual = isEqual;
/**
 * Type of a thrown bubble signal.
 */
var BubbleSignalType;
(function (BubbleSignalType) {
    BubbleSignalType[BubbleSignalType["YIELD"] = 0] = "YIELD";
    BubbleSignalType[BubbleSignalType["RETURN"] = 1] = "RETURN";
    BubbleSignalType[BubbleSignalType["BREAK"] = 2] = "BREAK";
    BubbleSignalType[BubbleSignalType["CONTINUE"] = 3] = "CONTINUE";
})(BubbleSignalType = exports.BubbleSignalType || (exports.BubbleSignalType = {}));
/**
 * Bubble signal is used for traversing upward the call stack. It is implemented
 * with JavaScript's Error. Such signal might be yield, return, break, or
 * continue.
 */
class BubbleSignal extends Error {
    constructor(type) {
        super('Uncaught Bubble Signal.');
        this.type = type;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.BubbleSignal = BubbleSignal;
/**
 * Create a string describing a runtime value including its type and value.
 */
function describe(rv) {
    switch (rv.type) {
        case 'number':
        case 'boolean':
            return `${rv.type} (value = ${rv.value})`;
        case 'string':
            return `string (value = "${rv.value}")`;
        case 'choice':
            return `choice (action = ${describe(rv.value.action)}, label = ` +
                `"${rv.value.text}")`;
        case 'action':
            switch (rv.value.action) {
                case 'goto':
                    return `action (type = goto, target = ${rv.value.target})`;
                case 'exit':
                    return `action (type = exit)`;
                case 'selection':
                    return `action (type = selection, choices = [${rv.value.choices
                        .map(describe).join(', ')}])`;
            }
        case 'null':
            return 'null';
        case 'list':
            return `list (elements = [${rv.value.map(describe).join(', ')}])`;
        case 'function':
            if (rv.value.fnType === 'native') {
                return `function (native ${rv.value.nativeFn.name})`;
            }
            else if (rv.value.fnType === 'wtcd') {
                return `function (arguments = [${rv.value.expr.arguments
                    .map(arg => arg.name)
                    .join(', ')}])`;
            }
            else {
                return `function (partial ${rv.value.isLeft ? 'left' : 'right'}, ` +
                    `applied = [${rv.value.applied.map(describe).join(', ')}], ` +
                    `targetFn = ${describe(rv.value.targetFn)})`;
            }
    }
}
exports.describe = describe;
/**
 * Determine whether a given value is assignable to a given type declaration.
 *
 * @param type given value's type
 * @param types type declaration that is to be compared to
 * @returns whether a value with type type is assignable to a variable with type
 * declaration types
 */
function isTypeAssignableTo(type, types) {
    return types === null || types.includes(type);
}
exports.isTypeAssignableTo = isTypeAssignableTo;
function assignValueToVariable(variable, value, location, // For error message
variableName) {
    if (!isTypeAssignableTo(value.type, variable.types)) {
        throw WTCDError_1.WTCDError.atLocation(location, `Cannot assign value (` +
            `${describe(value)}) to variable "${variableName}". "${variableName}" ` +
            `can only store these types: ${variable.types.join(', ')}`);
    }
    variable.value = value;
}
exports.assignValueToVariable = assignValueToVariable;
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
    addVariable(variableName, value) {
        this.variables.set(variableName, value);
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
    constructor(wtcdRoot, random, featureProvider) {
        this.wtcdRoot = wtcdRoot;
        this.random = random;
        this.featureProvider = featureProvider;
        this.timers = new Map();
        this.interpreterHandle = {
            evaluator: this.evaluator.bind(this),
            pushScope: this.pushScope.bind(this),
            popScope: this.popScope.bind(this),
            resolveVariableReference: this.resolveVariableReference.bind(this),
            getRandom: () => this.random,
            pushContent: this.pushContent.bind(this),
            timers: this.timers,
            setPinnedFunction: this.setPinnedFunction.bind(this),
            setStateDesc: this.setStateDesc.bind(this),
            featureProvider: this.featureProvider,
            canvases: new Map(),
        };
        this.pinnedFunction = null;
        this.pinned = [];
        this.stateDesc = null;
        this.scopes = [];
        this.sectionStack = [];
        this.started = false;
        this.sectionEnterTimes = new Map();
        this.currentlyBuilding = [];
        this.sectionStack.push(this.wtcdRoot.sections[0]);
    }
    setPinnedFunction(pinnedFunction) {
        this.pinnedFunction = pinnedFunction;
    }
    setStateDesc(stateDesc) {
        this.stateDesc = stateDesc;
    }
    resolveVariableReference(variableName) {
        for (let i = this.scopes.length - 1; i >= 0; i--) {
            const variable = this.scopes[i].resolveVariableReference(variableName);
            if (variable !== null) {
                return variable;
            }
        }
        throw WTCDError_1.WTCDError.atUnknown(`Cannot resolve variable reference ` +
            `"${variableName}". This is most likely caused by WTCD compiler's ` +
            `error or the compiled output ` +
            `has been modified`);
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
        return this.scopes.pop();
    }
    evaluateChoiceExpression(expr) {
        const text = this.evaluator(expr.text);
        if (text.type !== 'string') {
            throw WTCDError_1.WTCDError.atLocation(expr, `First argument of choice is expected to be a string, ` +
                `received: ${describe(text)}`);
        }
        let action = this.evaluator(expr.action);
        if (action.type !== 'action' && action.type !== 'function' && action.type !== 'null') {
            throw WTCDError_1.WTCDError.atLocation(expr, `Second argument of choice is expected to be an action, a function, ` +
                `or null, received: ${describe(text)}`);
        }
        if (action.type === 'function') {
            action = {
                type: 'action',
                value: {
                    action: 'function',
                    fn: action,
                    creator: expr,
                },
            };
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
                if (singleDeclaration.variableType === null) {
                    value = constantsPool_1.getMaybePooled('null', null);
                }
                else if (singleDeclaration.variableType.length === 1) {
                    switch (singleDeclaration.variableType[0]) {
                        case 'boolean':
                            value = constantsPool_1.getMaybePooled('boolean', false);
                            break;
                        case 'number':
                            value = constantsPool_1.getMaybePooled('number', 0);
                            break;
                        case 'string':
                            value = constantsPool_1.getMaybePooled('string', '');
                            break;
                        case 'list':
                            value = { type: 'list', value: [] };
                            break;
                        default:
                            throw WTCDError_1.WTCDError.atLocation(expr, `Variable type ` +
                                `"${singleDeclaration.variableType[0]}" ` +
                                `does not have a default initial value`);
                    }
                }
                else if (singleDeclaration.variableType.includes('null')) {
                    // Use null if null is allowed
                    value = constantsPool_1.getMaybePooled('null', null);
                }
                else {
                    throw WTCDError_1.WTCDError.atLocation(expr, `Variable type ` +
                        `"${singleDeclaration.variableType.join(' ')}" does not have a ` +
                        `default initial value`);
                }
            }
            if (!isTypeAssignableTo(value.type, singleDeclaration.variableType)) {
                throw WTCDError_1.WTCDError.atLocation(expr, `The type of variable ` +
                    `${singleDeclaration.variableName} is ` +
                    `${singleDeclaration.variableType}, thus cannot hold ` +
                    `${describe(value)}`);
            }
            this.getCurrentScope().addVariable(singleDeclaration.variableName, {
                types: singleDeclaration.variableType,
                value,
            });
        }
    }
    evaluateBlockExpression(expr) {
        const scope = this.pushScope();
        try {
            scope.addRegister('yield');
            for (const statement of expr.statements) {
                this.executeStatement(statement);
            }
            return scope.getRegister('yield');
        }
        catch (error) {
            if ((error instanceof BubbleSignal) &&
                (error.type === BubbleSignalType.YIELD)) {
                return scope.getRegister('yield');
            }
            throw error;
        }
        finally {
            this.popScope();
        }
    }
    evaluateSelectionExpression(expr) {
        const choicesList = this.evaluator(expr.choices);
        if (choicesList.type !== 'list') {
            throw WTCDError_1.WTCDError.atLocation(expr, `Expression after selection is ` +
                `expected to be a list of choices, received: ` +
                `${describe(choicesList)}`);
        }
        const choices = choicesList.value
            .filter(choice => choice.type !== 'null');
        for (let i = 0; i < choices.length; i++) {
            if (choices[i].type !== 'choice') {
                throw WTCDError_1.WTCDError.atLocation(expr, `Choice at index ${i} is expected ` +
                    `to be a choice, received: ${describe(choices[i])}`);
            }
        }
        return {
            type: 'action',
            value: {
                action: 'selection',
                choices: choices,
            },
        };
    }
    evaluateListExpression(expr) {
        return {
            type: 'list',
            value: utils_1.flat(expr.elements.map(expr => {
                if (expr.type !== 'spread') {
                    return this.evaluator(expr);
                }
                const list = this.evaluator(expr.expression);
                if (list.type !== 'list') {
                    throw WTCDError_1.WTCDError.atLocation(expr, `Spread operator "..." can only ` +
                        `be used before a list, received: ${describe(list)}`);
                }
                return list.value;
            })),
        };
    }
    evaluateFunctionExpression(expr) {
        return {
            type: 'function',
            value: {
                fnType: 'wtcd',
                expr,
                captured: expr.captures.map(variableName => ({
                    name: variableName,
                    value: this.resolveVariableReference(variableName),
                })),
            },
        };
    }
    evaluateSwitchExpression(expr) {
        const switchValue = this.evaluator(expr.expression);
        for (const switchCase of expr.cases) {
            const matches = this.evaluator(switchCase.matches);
            if (matches.type !== 'list') {
                throw WTCDError_1.WTCDError.atLocation(switchCase.matches, `Value to match for ` +
                    `each case is expected to be a list, received: ` +
                    `${describe(matches)}`);
            }
            if (matches.value.some(oneMatch => isEqual(oneMatch, switchValue))) {
                // Matched
                return this.evaluator(switchCase.returns);
            }
        }
        // Default
        if (expr.defaultCase === null) {
            throw WTCDError_1.WTCDError.atLocation(expr, `None of the cases matched and no ` +
                `default case is provided`);
        }
        else {
            return this.evaluator(expr.defaultCase);
        }
    }
    evaluateWhileExpression(expr) {
        const scope = this.pushScope();
        scope.addRegister('break');
        let continueFlag = false;
        try { // Break
            while (true) {
                if (!continueFlag && expr.preExpr !== null) {
                    try { // Continue
                        this.evaluator(expr.preExpr);
                    }
                    catch (error) {
                        if (!((error instanceof BubbleSignal) &&
                            (error.type === BubbleSignalType.CONTINUE))) {
                            throw error;
                        }
                    }
                }
                continueFlag = false;
                const whileCondition = this.evaluator(expr.condition);
                if (whileCondition.type !== 'boolean') {
                    throw WTCDError_1.WTCDError.atLocation(expr, `Condition expression of a while ` +
                        `loop is expected to return a boolean. Received: ` +
                        `${describe(whileCondition)}`);
                }
                if (whileCondition.value === false) {
                    break;
                }
                if (expr.postExpr !== null) {
                    try { // Continue
                        this.evaluator(expr.postExpr);
                    }
                    catch (error) {
                        if (!((error instanceof BubbleSignal) &&
                            (error.type === BubbleSignalType.CONTINUE))) {
                            throw error;
                        }
                        continueFlag = true;
                    }
                }
            }
        }
        catch (error) {
            if ((error instanceof BubbleSignal) &&
                (error.type === BubbleSignalType.BREAK)) {
                return scope.getRegister('break');
            }
            throw error;
        }
        finally {
            this.popScope();
        }
        return scope.getRegister('break');
    }
    evaluateIfExpression(expr) {
        const condition = this.evaluator(expr.condition);
        if (condition.type !== 'boolean') {
            throw WTCDError_1.WTCDError.atLocation(expr, `The condition of an if expression is ` +
                `expected to be a boolean. Received: ${describe(condition)}`);
        }
        if (condition.value) {
            return this.evaluator(expr.then);
        }
        else if (expr.otherwise !== null) {
            return this.evaluator(expr.otherwise);
        }
        else {
            return constantsPool_1.getMaybePooled('null', null);
        }
    }
    evaluator(expr) {
        switch (expr.type) {
            case 'unaryExpression':
                return operators_1.unaryOperators.get(expr.operator).fn(expr, this.interpreterHandle);
            case 'binaryExpression':
                return operators_1.binaryOperators.get(expr.operator).fn(expr, this.interpreterHandle);
            case 'booleanLiteral':
                return constantsPool_1.getMaybePooled('boolean', expr.value);
            case 'numberLiteral':
                return constantsPool_1.getMaybePooled('number', expr.value);
            case 'stringLiteral':
                return constantsPool_1.getMaybePooled('string', expr.value);
            case 'nullLiteral':
                return constantsPool_1.getMaybePooled('null', null);
            case 'list':
                return this.evaluateListExpression(expr);
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
                return this.resolveVariableReference(expr.variableName).value;
            case 'function':
                return this.evaluateFunctionExpression(expr);
            case 'switch':
                return this.evaluateSwitchExpression(expr);
            case 'while':
                return this.evaluateWhileExpression(expr);
            case 'if':
                return this.evaluateIfExpression(expr);
            case 'tag':
                return {
                    type: 'list',
                    value: [constantsPool_1.getMaybePooled('string', expr.name)],
                };
        }
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
            case 'return':
                this.setRegister('return', this.evaluator(statement.value));
                throw new BubbleSignal(BubbleSignalType.RETURN);
            case 'setReturn':
                this.setRegister('return', this.evaluator(statement.value));
                return;
            case 'break':
                this.setRegister('break', this.evaluator(statement.value));
                throw new BubbleSignal(BubbleSignalType.BREAK);
            case 'setBreak':
                this.setRegister('break', this.evaluator(statement.value));
                return;
            case 'continue':
                throw new BubbleSignal(BubbleSignalType.CONTINUE);
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
    updatePinned() {
        if (this.pinnedFunction !== null) {
            try {
                invokeFunction_1.invokeFunctionRaw(this.pinnedFunction.value, [], this.interpreterHandle);
            }
            catch (error) {
                if (error instanceof invokeFunction_1.FunctionInvocationError) {
                    throw WTCDError_1.WTCDError.atUnknown(`Failed to invoke the pinned ` +
                        `function (${describe(this.pinnedFunction)}): ` +
                        error.message);
                }
                else if (error instanceof WTCDError_1.WTCDError) {
                    error.pushWTCDStack(`Pinned function (` +
                        `${describe(this.pinnedFunction)})`);
                }
                throw error;
            }
            this.pinned = this.currentlyBuilding;
            this.currentlyBuilding = [];
        }
        else if (this.pinned.length !== 0) {
            this.pinned = [];
        }
    }
    *executeAction(action) {
        switch (action.value.action) {
            case 'goto':
                for (let i = action.value.target.length - 1; i >= 0; i--) {
                    this.addToSectionStack(action.value.target[i]);
                }
                break;
            case 'exit':
                // Clears the section stack so the scripts end immediately
                this.sectionStack.length = 0;
                break;
            case 'selection': {
                const choicesRaw = action.value.choices;
                const choices = choicesRaw.map(choice => ({
                    content: choice.value.text,
                    disabled: choice.value.action.type === 'null',
                }));
                const yieldValue = {
                    content: this.currentlyBuilding,
                    choices,
                };
                this.currentlyBuilding = [];
                this.updatePinned();
                // Hands over control so player can make a decision
                const playerChoiceIndex = yield yieldValue;
                const playerChoice = choicesRaw[playerChoiceIndex];
                if (playerChoice === undefined || playerChoice.value.action.type === 'null') {
                    throw new InvalidChoiceError(playerChoiceIndex);
                }
                yield* this.executeAction(playerChoice.value.action);
                break;
            }
            case 'function': {
                let newAction;
                try {
                    newAction = invokeFunction_1.invokeFunctionRaw(action.value.fn.value, [], this.interpreterHandle);
                }
                catch (error) {
                    if (error instanceof invokeFunction_1.FunctionInvocationError) {
                        throw WTCDError_1.WTCDError.atLocation(action.value.creator, `Failed to evaluate the function action for this choice: ` +
                            `${error.message}`);
                    }
                    else if (error instanceof WTCDError_1.WTCDError) {
                        error.pushWTCDStack(`Function action`, action.value.creator);
                    }
                    throw error;
                }
                if (newAction.type === 'action') {
                    yield* this.executeAction(newAction);
                }
                else if (newAction.type !== 'null') {
                    throw WTCDError_1.WTCDError.atLocation(action.value.creator, `Value returned ` +
                        `an function action is expected to be an action or null. ` +
                        `Received: ${describe(newAction)}`);
                }
                break;
            }
        }
    }
    pushContent($element) {
        this.currentlyBuilding.push($element);
    }
    runSection(section) {
        const $mdHost = document.createElement('div');
        // Evaluate the executes clause
        if (section.executes !== null) {
            this.evaluator(section.executes);
        }
        /** Times this section has been entered including this time */
        const enterTime = this.sectionEnterTimes.has(section.name)
            ? this.sectionEnterTimes.get(section.name) + 1
            : 1;
        this.sectionEnterTimes.set(section.name, enterTime);
        /** Content that fits within the bounds */
        const eligibleSectionContents = section.content.filter(content => (content.lowerBound === undefined || content.lowerBound <= enterTime) &&
            (content.upperBound === undefined || content.upperBound >= enterTime));
        if (eligibleSectionContents.length !== 0) {
            const selectedContent = eligibleSectionContents[this.random.nextInt(0, eligibleSectionContents.length)];
            $mdHost.innerHTML = selectedContent.html;
            // Parameterize
            for (const variable of selectedContent.variables) {
                $mdHost.getElementsByClassName(variable.elementClass)[0]
                    .innerText = String(this.resolveVariableReference(variable.variableName).value.value);
            }
            let $current = $mdHost.firstChild;
            while ($current !== null) {
                if ($current instanceof HTMLElement) {
                    this.pushContent($current);
                }
                $current = $current.nextSibling;
            }
        }
        return this.evaluator(section.then);
    }
    getPinned() {
        return this.pinned;
    }
    getStateDesc() {
        return this.stateDesc;
    }
    *start() {
        const stdScope = this.pushScope();
        for (const stdFunction of std_1.stdFunctions) {
            stdScope.addVariable(stdFunction.name, {
                types: ['function'],
                value: {
                    type: 'function',
                    value: {
                        fnType: 'native',
                        nativeFn: stdFunction,
                    },
                },
            });
        }
        // Global scope
        this.pushScope();
        if (this.started) {
            throw new Error('Interpretation has already started.');
        }
        this.started = true;
        let lastSection = null;
        try {
            // Initialization
            for (const statement of this.wtcdRoot.initStatements) {
                this.executeStatement(statement);
            }
            while (this.sectionStack.length !== 0) {
                const currentSection = this.sectionStack.pop();
                lastSection = currentSection;
                const then = this.runSection(currentSection);
                if (then.type === 'action') {
                    yield* this.executeAction(then);
                }
                else if (then.type !== 'null') {
                    throw WTCDError_1.WTCDError.atLocation(currentSection.then, `Expression after ` +
                        `then is expected to return an action, or null, ` +
                        `received: ${describe(then)}`);
                }
            }
        }
        catch (error) {
            if (error instanceof BubbleSignal) {
                throw WTCDError_1.WTCDError.atUnknown(`Uncaught BubbleSignal with type "${error.type}".`);
            }
            if (error instanceof WTCDError_1.WTCDError) {
                if (lastSection === null) {
                    error.pushWTCDStack(`initialization`);
                }
                else {
                    error.pushWTCDStack(`section "${lastSection.name}"`, lastSection);
                }
            }
            throw error;
        }
        const lastContent = {
            content: this.currentlyBuilding,
            choices: [],
        };
        this.updatePinned();
        return lastContent;
    }
}
exports.Interpreter = Interpreter;

},{"./WTCDError":63,"./constantsPool":65,"./invokeFunction":66,"./operators":67,"./std":71,"./utils":78}],62:[function(require,module,exports){
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
    nextInt(low, high) {
        return Math.floor(this.next(low, high));
    }
}
exports.Random = Random;

},{}],63:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const empty = {};
class WTCDError extends Error {
    constructor(message, line, column) {
        super(message);
        this.line = line;
        this.column = column;
        this.wtcdStackArray = [];
        this.name = 'WTCDError';
    }
    get wtcdStack() {
        return this.message + '\n' + this.wtcdStackArray.join('\n');
    }
    pushWTCDStack(info, location = empty) {
        this.wtcdStackArray.push(`    at ${info}`
            + (location.line
                ? ':' + location.line
                    + (location.column
                        ? ':' + location.column
                        : '')
                : ''));
    }
    static atUnknown(message) {
        return new WTCDError(message + ` at unknown location. (Location `
            + `info is not available for this type of error)`, null, null);
    }
    static atLineColumn(line, column, message) {
        return new WTCDError(message + ` at ${line}:${column}.`, line, column);
    }
    static atLocation(location, message) {
        if (location === null) {
            return WTCDError.atUnknown(message);
        }
        if (location.line === undefined) {
            return new WTCDError(message + ' at unknown location. (Try recompile in '
                + 'debug mode to enable source map)', null, null);
        }
        else {
            return WTCDError.atLineColumn(location.line, location.column, message);
        }
    }
}
exports.WTCDError = WTCDError;

},{}],64:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function autoEvaluated(fn) {
    return (expr, interpreterHandle) => {
        const arg0 = interpreterHandle.evaluator(expr.arg0);
        const arg1 = interpreterHandle.evaluator(expr.arg1);
        return fn(arg0, arg1, expr, interpreterHandle);
    };
}
exports.autoEvaluated = autoEvaluated;

},{}],65:[function(require,module,exports){
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
    if (type === 'number' && value >= 0 && value <= 100 && (value % 1 === 0)) {
        return exports.smallIntegers[value];
    }
    return {
        type,
        value,
    };
}
exports.getMaybePooled = getMaybePooled;

},{}],66:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const autoEvaluated_1 = require("./autoEvaluated");
const constantsPool_1 = require("./constantsPool");
const Interpreter_1 = require("./Interpreter");
const utils_1 = require("./std/utils");
const WTCDError_1 = require("./WTCDError");
class FunctionInvocationError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.FunctionInvocationError = FunctionInvocationError;
function invokeFunctionRaw(functionValue, args, interpreterHandle) {
    const { evaluator, pushScope, popScope, } = interpreterHandle;
    if (functionValue.fnType === 'native') {
        try {
            return functionValue.nativeFn(args, interpreterHandle);
        }
        catch (error) {
            if (error instanceof utils_1.NativeFunctionError) {
                // Wrap up native function errors
                throw new FunctionInvocationError(`Failed to call native function ` +
                    `"${functionValue.nativeFn.name}". Reason: ${error.message}`);
            }
            else {
                throw error;
            }
        }
    }
    else if (functionValue.fnType === 'wtcd') {
        const scope = pushScope();
        try {
            scope.addRegister('return');
            // Check and add arguments to the scope
            functionValue.expr.arguments.forEach((argument, index) => {
                let value = args[index];
                if (value === undefined || value.type === 'null') {
                    // Use default
                    if (argument.defaultValue !== null) {
                        value = evaluator(argument.defaultValue);
                    }
                    else if (Interpreter_1.isTypeAssignableTo('null', argument.type)) {
                        value = constantsPool_1.getMaybePooled('null', null);
                    }
                    else {
                        throw new FunctionInvocationError(`The argument with index = ` +
                            `${index} of invocation is omitted, but it does not have a ` +
                            `default value and it does not allow null values`);
                    }
                }
                if (!Interpreter_1.isTypeAssignableTo(value.type, argument.type)) {
                    throw new FunctionInvocationError(`The argument with index = ` +
                        `${index} of invocation has wrong type. Expected: ` +
                        `${argument.type}, received: ${Interpreter_1.describe(value)}`);
                }
                scope.addVariable(argument.name, {
                    types: [value.type],
                    value,
                });
            });
            // Rest arg
            if (functionValue.expr.restArgName !== null) {
                scope.addVariable(functionValue.expr.restArgName, {
                    types: ['list'],
                    value: {
                        type: 'list',
                        value: args.slice(functionValue.expr.arguments.length),
                    },
                });
            }
            // Restore captured variables
            functionValue.captured.forEach(captured => {
                scope.addVariable(captured.name, captured.value);
            });
            // Invoke function
            const evaluatedValue = evaluator(functionValue.expr.expression);
            const registerValue = scope.getRegister('return');
            // Prioritize register value
            if (registerValue.type === 'null') {
                // Only use evaluated value if no return or setReturn statement is
                // executed.
                return evaluatedValue;
            }
            else {
                return registerValue;
            }
        }
        catch (error) {
            if ((error instanceof Interpreter_1.BubbleSignal) &&
                (error.type === Interpreter_1.BubbleSignalType.RETURN)) {
                return scope.getRegister('return');
            }
            throw error;
        }
        finally {
            popScope();
        }
    }
    else {
        let fn = functionValue;
        const leftApplied = [];
        const rightApplied = [];
        do {
            if (fn.isLeft) {
                leftApplied.unshift(...fn.applied);
            }
            else {
                rightApplied.push(...fn.applied);
            }
            fn = fn.targetFn.value;
        } while (fn.fnType === 'partial');
        return invokeFunctionRaw(fn, [...leftApplied, ...args, ...rightApplied], interpreterHandle);
    }
}
exports.invokeFunctionRaw = invokeFunctionRaw;
function handleError(expr, error) {
    if (error instanceof FunctionInvocationError) {
        throw WTCDError_1.WTCDError.atLocation(expr, error.message);
    }
    else if (error instanceof WTCDError_1.WTCDError) {
        error.pushWTCDStack(`"${expr.operator}" invocation`, expr);
    }
    throw error;
}
exports.regularInvocationRaw = (arg0, arg1, expr, interpreterHandle) => {
    if (arg0.type !== 'function') {
        throw WTCDError_1.WTCDError.atLocation(expr, `Left side of function invocation ` +
            `"${expr.operator}" is expected to be a function, received: ` +
            `${Interpreter_1.describe(arg0)}`);
    }
    if (arg1.type !== 'list') {
        throw WTCDError_1.WTCDError.atLocation(expr, `Right side of function invocation ` +
            `"${expr.operator}" is expected to be a list, received: ` +
            `${Interpreter_1.describe(arg1)}`);
    }
    try {
        return invokeFunctionRaw(arg0.value, arg1.value, interpreterHandle);
    }
    catch (error) {
        return handleError(expr, error);
    }
};
exports.regularInvocation = autoEvaluated_1.autoEvaluated(exports.regularInvocationRaw);
exports.pipelineInvocation = autoEvaluated_1.autoEvaluated((arg0, arg1, expr, interpreterHandle) => {
    if (arg1.type !== 'function') {
        throw WTCDError_1.WTCDError.atLocation(expr, `Right side of pipeline invocation "|>" ` +
            `is expected to be a function, received: ${Interpreter_1.describe(arg1)}`);
    }
    try {
        return invokeFunctionRaw(arg1.value, [arg0], interpreterHandle);
    }
    catch (error) {
        return handleError(expr, error);
    }
});
exports.reverseInvocation = autoEvaluated_1.autoEvaluated((arg0, arg1, expr, interpreterHandle) => {
    if (arg0.type !== 'list') {
        throw WTCDError_1.WTCDError.atLocation(expr, `Left side of reverse invocation "|::" ` +
            `is expected to be a list, received: ${Interpreter_1.describe(arg0)}`);
    }
    if (arg1.type !== 'function') {
        throw WTCDError_1.WTCDError.atLocation(expr, `Right side of reverse invocation "|::" ` +
            `is expected to be a function, received: ${Interpreter_1.describe(arg1)}`);
    }
    try {
        return invokeFunctionRaw(arg1.value, arg0.value, interpreterHandle);
    }
    catch (error) {
        return handleError(expr, error);
    }
});

},{"./Interpreter":61,"./WTCDError":63,"./autoEvaluated":64,"./constantsPool":65,"./std/utils":77}],67:[function(require,module,exports){
"use strict";
// This file defines all infix and prefix operators in WTCD.
Object.defineProperty(exports, "__esModule", { value: true });
const autoEvaluated_1 = require("./autoEvaluated");
const constantsPool_1 = require("./constantsPool");
const Interpreter_1 = require("./Interpreter");
const invokeFunction_1 = require("./invokeFunction");
const WTCDError_1 = require("./WTCDError");
exports.unaryOperators = new Map([
    ['-', {
            precedence: 17,
            fn: (expr, { evaluator }) => {
                const arg = evaluator(expr.arg);
                if (arg.type !== 'number') {
                    throw WTCDError_1.WTCDError.atLocation(expr, `Unary operator "-" can only be applied ` +
                        `to a number, received: ${Interpreter_1.describe(arg)}`);
                }
                return constantsPool_1.getMaybePooled('number', -arg.value);
            },
        }],
    ['!', {
            precedence: 17,
            fn: (expr, { evaluator }) => {
                const arg = evaluator(expr.arg);
                if (arg.type !== 'boolean') {
                    throw WTCDError_1.WTCDError.atLocation(expr, `Unary operator "!" can only be applied ` +
                        `to a boolean, received: ${Interpreter_1.describe(arg)}`);
                }
                return constantsPool_1.getMaybePooled('boolean', !arg.value);
            },
        }],
]);
function autoEvaluatedSameTypeArg(argType, returnType, fn) {
    return autoEvaluated_1.autoEvaluated((arg0, arg1, expr, interpreterHandle) => {
        if (arg0.type === argType && arg1.type === argType) {
            // TypeScript is not smart enough to do the conversion here
            return constantsPool_1.getMaybePooled(returnType, fn(arg0.value, arg1.value, expr, interpreterHandle));
        }
        else {
            throw WTCDError_1.WTCDError.atLocation(expr, `Binary operator "${expr.operator}" can only be ` +
                `applied to two ${argType}s, received: ${Interpreter_1.describe(arg0)} (left) and ` +
                `${Interpreter_1.describe(arg1)} (right)`);
        }
    });
}
function opAssignment(arg0Type, // Type of the variable
arg1Type, fn) {
    return (expr, interpreterHandle) => {
        if (expr.arg0.type !== 'variableReference') {
            throw WTCDError_1.WTCDError.atLocation(expr, `Left side of binary operator "${expr.operator}" ` +
                `has to be a variable reference`);
        }
        const varRef = interpreterHandle.resolveVariableReference(expr.arg0.variableName);
        if (varRef.value.type !== arg0Type) {
            throw WTCDError_1.WTCDError.atLocation(expr, `Left side of binary operator "${expr.operator}" has to be a ` +
                `variable of type ${arg0Type}, actual type: ${varRef.value.type}`);
        }
        const arg1 = interpreterHandle.evaluator(expr.arg1);
        if (arg1.type !== arg1Type) {
            throw WTCDError_1.WTCDError.atLocation(expr, `Right side of binary operator "${expr.operator}" ` +
                ` has to be a ${arg1Type}, received: ${Interpreter_1.describe(arg1)}`);
        }
        const newValue = constantsPool_1.getMaybePooled(arg0Type, fn(varRef.value.value, arg1.value, expr, interpreterHandle));
        varRef.value = newValue;
        return newValue;
    };
}
exports.binaryOperators = new Map([
    ['=', {
            precedence: 3,
            fn: (expr, { evaluator, resolveVariableReference }) => {
                if (expr.arg0.type !== 'variableReference') {
                    throw WTCDError_1.WTCDError.atLocation(expr, `Left side of binary operator "=" has to be a ` +
                        `variable reference`);
                }
                const varRef = resolveVariableReference(expr.arg0.variableName);
                const arg1 = evaluator(expr.arg1);
                Interpreter_1.assignValueToVariable(varRef, arg1, expr, expr.arg0.variableName);
                return arg1;
            },
        }],
    ['+=', {
            precedence: 3,
            fn: (expr, { evaluator, resolveVariableReference }) => {
                if (expr.arg0.type !== 'variableReference') {
                    throw WTCDError_1.WTCDError.atLocation(expr, `Left side of binary operator "+=" ` +
                        `has to be a variable reference`);
                }
                const varRef = resolveVariableReference(expr.arg0.variableName);
                if (varRef.value.type !== 'string' && varRef.value.type !== 'number') {
                    throw WTCDError_1.WTCDError.atLocation(expr, `Left side of binary operator "+=" has to be a ` +
                        `variable of type number or string, actual type: ${varRef.value.type}`);
                }
                const arg1 = evaluator(expr.arg1);
                if (arg1.type !== varRef.value.type) {
                    throw WTCDError_1.WTCDError.atLocation(expr, `Right side of binary operator "+=" has to ` +
                        ` be a ${varRef.value.type}, received: ${Interpreter_1.describe(arg1)}`);
                }
                const newValue = constantsPool_1.getMaybePooled(varRef.value.type, varRef.value.value + arg1.value);
                varRef.value = newValue;
                return newValue;
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
    ['|>', {
            precedence: 5,
            fn: invokeFunction_1.pipelineInvocation,
        }],
    ['|::', {
            precedence: 5,
            fn: invokeFunction_1.reverseInvocation,
        }],
    ['||', {
            precedence: 6,
            fn: (expr, { evaluator }) => {
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
    ['?!', {
            precedence: 6,
            fn: (expr, { evaluator }) => {
                const arg0 = evaluator(expr.arg0);
                if (arg0.type !== 'null') {
                    return arg0;
                }
                const arg1 = evaluator(expr.arg1);
                if (arg1.type === 'null') {
                    throw WTCDError_1.WTCDError.atLocation(expr, `Right side of binary operator "??" ` +
                        `cannot be null. If returning null is desired in this case, please ` +
                        `use "???" instead`);
                }
                return arg1;
            },
        }],
    ['??', {
            precedence: 6,
            fn: (expr, { evaluator }) => {
                const arg0 = evaluator(expr.arg0);
                if (arg0.type !== 'null') {
                    return arg0;
                }
                return evaluator(expr.arg1);
            },
        }],
    ['&&', {
            precedence: 7,
            fn: (expr, { evaluator }) => {
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
            precedence: 11,
            fn: autoEvaluated_1.autoEvaluated((arg0, arg1) => (constantsPool_1.getMaybePooled('boolean', Interpreter_1.isEqual(arg0, arg1)))),
        }],
    ['!=', {
            precedence: 11,
            fn: autoEvaluated_1.autoEvaluated((arg0, arg1) => (constantsPool_1.getMaybePooled('boolean', !Interpreter_1.isEqual(arg0, arg1)))),
        }],
    ['<', {
            precedence: 12,
            fn: autoEvaluatedSameTypeArg('number', 'boolean', (arg0Raw, arg1Raw) => arg0Raw < arg1Raw),
        }],
    ['<=', {
            precedence: 12,
            fn: autoEvaluatedSameTypeArg('number', 'boolean', (arg0Raw, arg1Raw) => arg0Raw <= arg1Raw),
        }],
    ['>', {
            precedence: 12,
            fn: autoEvaluatedSameTypeArg('number', 'boolean', (arg0Raw, arg1Raw) => arg0Raw > arg1Raw),
        }],
    ['>=', {
            precedence: 12,
            fn: autoEvaluatedSameTypeArg('number', 'boolean', (arg0Raw, arg1Raw) => arg0Raw >= arg1Raw),
        }],
    ['+', {
            precedence: 14,
            fn: autoEvaluated_1.autoEvaluated((arg0, arg1, expr) => {
                if (arg0.type === 'number' && arg1.type === 'number') {
                    return constantsPool_1.getMaybePooled('number', arg0.value + arg1.value);
                }
                else if (arg0.type === 'string' && arg1.type === 'string') {
                    return constantsPool_1.getMaybePooled('string', arg0.value + arg1.value);
                }
                else {
                    throw WTCDError_1.WTCDError.atLocation(expr, `Binary operator "+" can only be applied to two ` +
                        `strings or two numbers, received: ${Interpreter_1.describe(arg0)} (left) and ` +
                        `${Interpreter_1.describe(arg1)} (right)`);
                }
            }),
        }],
    ['-', {
            precedence: 14,
            fn: autoEvaluatedSameTypeArg('number', 'number', (arg0Raw, arg1Raw) => arg0Raw - arg1Raw),
        }],
    ['*', {
            precedence: 15,
            fn: autoEvaluatedSameTypeArg('number', 'number', (arg0Raw, arg1Raw) => arg0Raw * arg1Raw),
        }],
    ['/', {
            precedence: 15,
            fn: autoEvaluatedSameTypeArg('number', 'number', (arg0Raw, arg1Raw) => arg0Raw / arg1Raw),
        }],
    ['~/', {
            precedence: 15,
            fn: autoEvaluatedSameTypeArg('number', 'number', (arg0Raw, arg1Raw) => Math.trunc(arg0Raw / arg1Raw)),
        }],
    ['%', {
            precedence: 15,
            fn: autoEvaluatedSameTypeArg('number', 'number', (arg0Raw, arg1Raw) => arg0Raw % arg1Raw),
        }],
    ['**', {
            precedence: 16,
            fn: autoEvaluatedSameTypeArg('number', 'number', (arg0Raw, arg1Raw) => arg0Raw ** arg1Raw),
        }],
    ['.', {
            precedence: 19,
            fn: autoEvaluated_1.autoEvaluated((arg0, arg1, expr) => {
                if (arg0.type !== 'list') {
                    throw WTCDError_1.WTCDError.atLocation(expr, `Left side of binary operator "." ` +
                        `is expected to be a list. Received: ${Interpreter_1.describe(arg0)}`);
                }
                if (arg1.type !== 'number' || arg1.value % 1 !== 0) {
                    throw WTCDError_1.WTCDError.atLocation(expr, `Right side of binary operator "." ` +
                        `is expected to be an integer. Received: ${Interpreter_1.describe(arg1)}`);
                }
                const value = arg0.value[arg1.value];
                if (value === undefined) {
                    throw WTCDError_1.WTCDError.atLocation(expr, `List does not have an element at ` +
                        `${arg1.value}. If return null is desired, use ".?" instead. List ` +
                        `contents: ${Interpreter_1.describe(arg0)}`);
                }
                return value;
            }),
        }],
    ['.?', {
            precedence: 19,
            fn: autoEvaluated_1.autoEvaluated((arg0, arg1, expr) => {
                if (arg0.type !== 'list') {
                    throw WTCDError_1.WTCDError.atLocation(expr, `Left side of binary operator ".?" ` +
                        `is expected to be a list. Received: ${Interpreter_1.describe(arg0)}`);
                }
                if (arg1.type !== 'number' || arg1.value % 1 !== 0) {
                    throw WTCDError_1.WTCDError.atLocation(expr, `Right side of binary operator ".?" ` +
                        `is expected to be an integer. Received: ${Interpreter_1.describe(arg1)}`);
                }
                const value = arg0.value[arg1.value];
                if (value === undefined) {
                    return constantsPool_1.getMaybePooled('null', null);
                }
                return value;
            }),
        }],
    ['?.', {
            precedence: 19,
            fn: (expr, { evaluator }) => {
                const arg0 = evaluator(expr.arg0);
                if (arg0.type === 'null') {
                    return arg0; // Short circuit
                }
                if (arg0.type !== 'list') {
                    throw WTCDError_1.WTCDError.atLocation(expr, `Left side of binary operator "?." ` +
                        `is expected to be a list or null. Received: ${Interpreter_1.describe(arg0)}`);
                }
                const arg1 = evaluator(expr.arg1);
                if (arg1.type !== 'number' || arg1.value % 1 !== 0) {
                    throw WTCDError_1.WTCDError.atLocation(expr, `Right side of binary operator "?." ` +
                        `is expected to be an integer. Received: ${Interpreter_1.describe(arg1)}`);
                }
                const value = arg0.value[arg1.value];
                if (value === undefined) {
                    throw WTCDError_1.WTCDError.atLocation(expr, `List does not have an element at ` +
                        `${arg1.value}. If return null is desired, use "?.?" instead. ` +
                        `List contents: ${Interpreter_1.describe(arg0)}`);
                }
                return value;
            },
        }],
    ['?.?', {
            precedence: 19,
            fn: (expr, { evaluator }) => {
                const arg0 = evaluator(expr.arg0);
                if (arg0.type === 'null') {
                    return arg0; // Short circuit
                }
                if (arg0.type !== 'list') {
                    throw WTCDError_1.WTCDError.atLocation(expr, `Left side of binary operator "?.?" ` +
                        `is expected to be a list or null. Received: ${Interpreter_1.describe(arg0)}`);
                }
                const arg1 = evaluator(expr.arg1);
                if (arg1.type !== 'number' || arg1.value % 1 !== 0) {
                    throw WTCDError_1.WTCDError.atLocation(expr, `Right side of binary operator ` +
                        `"?.?" is expected to be an integer. Received: ${Interpreter_1.describe(arg1)}`);
                }
                const value = arg0.value[arg1.value];
                if (value === undefined) {
                    return constantsPool_1.getMaybePooled('null', null);
                }
                return value;
            },
        }],
    ['::', {
            precedence: 20,
            fn: invokeFunction_1.regularInvocation,
        }],
    ['?::', {
            precedence: 20,
            fn: (expr, interpreterHandle) => {
                const { evaluator } = interpreterHandle;
                const arg0 = evaluator(expr.arg0);
                if (arg0.type === 'null') {
                    return arg0; // Short circuit
                }
                return invokeFunction_1.regularInvocationRaw(arg0, evaluator(expr.arg1), expr, interpreterHandle);
            },
        }],
    ['.:', {
            precedence: 20,
            fn: autoEvaluated_1.autoEvaluated((arg0, arg1, expr) => {
                if (arg0.type !== 'function') {
                    throw WTCDError_1.WTCDError.atLocation(expr, `Left side of binary operator ".:" ` +
                        `is expected to be a function. Received: ${Interpreter_1.describe(arg0)}`);
                }
                if (arg1.type !== 'list') {
                    throw WTCDError_1.WTCDError.atLocation(expr, `Right side of binary operator ".:" ` +
                        `is expected to be a list. Received: ${Interpreter_1.describe(arg1)}`);
                }
                if (arg1.value.length === 0) {
                    return arg0;
                }
                return {
                    type: 'function',
                    value: {
                        fnType: 'partial',
                        isLeft: false,
                        applied: arg1.value,
                        targetFn: arg0,
                    },
                };
            }),
        }],
    [':.', {
            precedence: 20,
            fn: autoEvaluated_1.autoEvaluated((arg0, arg1, expr) => {
                if (arg0.type !== 'function') {
                    throw WTCDError_1.WTCDError.atLocation(expr, `Left side of binary operator ":." ` +
                        `is expected to be a function. Received: ${Interpreter_1.describe(arg0)}`);
                }
                if (arg1.type !== 'list') {
                    throw WTCDError_1.WTCDError.atLocation(expr, `Right side of binary operator ":." ` +
                        `is expected to be a list. Received: ${Interpreter_1.describe(arg1)}`);
                }
                if (arg1.value.length === 0) {
                    return arg0;
                }
                return {
                    type: 'function',
                    value: {
                        fnType: 'partial',
                        isLeft: true,
                        applied: arg1.value,
                        targetFn: arg0,
                    },
                };
            }),
        }],
]);
exports.conditionalOperatorPrecedence = 4;
exports.operators = new Set([...exports.unaryOperators.keys(), ...exports.binaryOperators.keys(), '?', ':', '...']);

},{"./Interpreter":61,"./WTCDError":63,"./autoEvaluated":64,"./constantsPool":65,"./invokeFunction":66}],68:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const constantsPool_1 = require("../constantsPool");
const utils_1 = require("./utils");
const ChainedCanvas_1 = require("../ChainedCanvas");
function obtainCanvas(interpreterHandle, id) {
    const canvas = interpreterHandle.canvases.get(id);
    if (canvas === undefined) {
        throw new utils_1.NativeFunctionError(`Canvas with id="${id}" does not exist.`);
    }
    return canvas;
}
exports.canvasStdFunctions = [
    function canvasCreate(args, interpreterHandle) {
        utils_1.assertArgsLength(args, 3);
        const id = utils_1.assertArgType(args, 0, 'string');
        const width = utils_1.assertArgType(args, 1, 'number');
        const height = utils_1.assertArgType(args, 2, 'number');
        if (interpreterHandle.canvases.has(id)) {
            throw new utils_1.NativeFunctionError(`Canvas with id="${id}" already exists`);
        }
        if (width % 1 !== 0) {
            throw new utils_1.NativeFunctionError(`Width (${width}) has to be an integer`);
        }
        if (width <= 0) {
            throw new utils_1.NativeFunctionError(`Width (${width}) must be positive`);
        }
        if (height % 1 !== 0) {
            throw new utils_1.NativeFunctionError(`Height (${height}) has to be an integer`);
        }
        if (height <= 0) {
            throw new utils_1.NativeFunctionError(`Height (${height}) must be positive`);
        }
        interpreterHandle.canvases.set(id, new ChainedCanvas_1.ChainedCanvas(width, height));
        return constantsPool_1.getMaybePooled('null', null);
    },
    function canvasOutput(args, interpreterHandle) {
        const id = utils_1.assertArgType(args, 0, 'string');
        const canvas = obtainCanvas(interpreterHandle, id);
        const $newCanvas = document.createElement('canvas');
        $newCanvas.width = canvas.getWidth();
        $newCanvas.height = canvas.getHeight();
        $newCanvas.style.maxWidth = '100%';
        interpreterHandle.pushContent($newCanvas);
        canvas.onResolve(() => {
            if (document.body.contains($newCanvas)) {
                $newCanvas.getContext('2d').drawImage(canvas.canvas, 0, 0);
            }
        });
        return constantsPool_1.getMaybePooled('null', null);
    },
    function canvasClear(args, interpreterHandle) {
        const id = utils_1.assertArgType(args, 0, 'string');
        const canvas = obtainCanvas(interpreterHandle, id);
        canvas.updatePromise(() => __awaiter(this, void 0, void 0, function* () {
            canvas.ctx.clearRect(0, 0, canvas.getWidth(), canvas.getHeight());
        }));
        return constantsPool_1.getMaybePooled('null', null);
    },
    function canvasPutImage(args, interpreterHandle) {
        utils_1.assertArgsLength(args, 4);
        const id = utils_1.assertArgType(args, 0, 'string');
        const path = utils_1.assertArgType(args, 1, 'string');
        const x = utils_1.assertArgType(args, 2, 'number');
        const y = utils_1.assertArgType(args, 3, 'number');
        const canvas = obtainCanvas(interpreterHandle, id);
        canvas.updatePromise(() => __awaiter(this, void 0, void 0, function* () {
            try {
                const image = yield interpreterHandle.featureProvider.loadImage(path);
                canvas.ctx.drawImage(image, x, y);
            }
            catch (error) {
                console.error(`WTCD failed to load image with path="${path}".`, error);
            }
        }));
        return constantsPool_1.getMaybePooled('null', null);
    },
    function canvasSetFont(args, interpreterHandle) {
        utils_1.assertArgsLength(args, 3);
        const id = utils_1.assertArgType(args, 0, 'string');
        const size = utils_1.assertArgType(args, 1, 'number');
        const fontIdentifier = utils_1.assertArgType(args, 2, 'string');
        const canvas = obtainCanvas(interpreterHandle, id);
        canvas.updatePromise(() => __awaiter(this, void 0, void 0, function* () {
            try {
                const fontName = yield interpreterHandle.featureProvider
                    .loadFont(fontIdentifier);
                canvas.ctx.font = `${size}px ${fontName}`;
            }
            catch (error) {
                console.error(`WTCD failed to load font with ` +
                    `identifier="${fontIdentifier}".`, error);
            }
        }));
        return constantsPool_1.getMaybePooled('null', null);
    },
    function canvasSetFillStyle(args, interpreterHandle) {
        utils_1.assertArgsLength(args, 2);
        const id = utils_1.assertArgType(args, 0, 'string');
        const color = utils_1.assertArgType(args, 1, 'string');
        const canvas = obtainCanvas(interpreterHandle, id);
        canvas.updatePromise(() => __awaiter(this, void 0, void 0, function* () {
            canvas.ctx.fillStyle = color;
        }));
        return constantsPool_1.getMaybePooled('null', null);
    },
    function canvasFillText(args, interpreterHandle) {
        utils_1.assertArgsLength(args, 4, 6);
        const id = utils_1.assertArgType(args, 0, 'string');
        const text = utils_1.assertArgType(args, 1, 'string');
        const x = utils_1.assertArgType(args, 2, 'number');
        const y = utils_1.assertArgType(args, 3, 'number');
        const hAlign = utils_1.assertArgType(args, 4, 'string', 'start');
        const vAlign = utils_1.assertArgType(args, 5, 'string', 'alphabetic');
        const canvas = obtainCanvas(interpreterHandle, id);
        switch (hAlign) {
            case 'left':
            case 'center':
            case 'right':
            case 'start':
            case 'end':
                break;
            default:
                throw new utils_1.NativeFunctionError(`Unknown text hAlign: ${hAlign}`);
        }
        switch (vAlign) {
            case 'top':
            case 'hanging':
            case 'middle':
            case 'alphabetic':
            case 'ideographic':
            case 'bottom':
                break;
            default:
                throw new utils_1.NativeFunctionError(`Unknown text vAlign: ${vAlign}`);
        }
        canvas.updatePromise(() => __awaiter(this, void 0, void 0, function* () {
            const ctx = canvas.ctx;
            ctx.textAlign = hAlign;
            ctx.textBaseline = vAlign;
            ctx.fillText(text, x, y);
        }));
        return constantsPool_1.getMaybePooled('null', null);
    },
    function canvasFillRect(args, interpreterHandle) {
        utils_1.assertArgsLength(args, 5);
        const id = utils_1.assertArgType(args, 0, 'string');
        const x = utils_1.assertArgType(args, 1, 'number');
        const y = utils_1.assertArgType(args, 2, 'number');
        const width = utils_1.assertArgType(args, 3, 'number');
        const height = utils_1.assertArgType(args, 4, 'number');
        const canvas = obtainCanvas(interpreterHandle, id);
        canvas.updatePromise(() => __awaiter(this, void 0, void 0, function* () {
            canvas.ctx.fillRect(x, y, width, height);
        }));
        return constantsPool_1.getMaybePooled('null', null);
    },
];

},{"../ChainedCanvas":57,"../constantsPool":65,"./utils":77}],69:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constantsPool_1 = require("../constantsPool");
const Interpreter_1 = require("../Interpreter");
const utils_1 = require("./utils");
exports.contentStdFunctions = [
    function contentAddParagraph(args, interpreterHandle) {
        utils_1.assertArgsLength(args, 1);
        const $paragraph = document.createElement('p');
        $paragraph.innerText = utils_1.assertArgType(args, 0, 'string');
        interpreterHandle.pushContent($paragraph);
        return constantsPool_1.getMaybePooled('null', null);
    },
    function contentAddImage(args, interpreterHandle) {
        utils_1.assertArgsLength(args, 1);
        const $image = document.createElement('img');
        $image.src = utils_1.assertArgType(args, 0, 'string');
        interpreterHandle.pushContent($image);
        return constantsPool_1.getMaybePooled('null', null);
    },
    function contentAddUnorderedList(args, interpreterHandle) {
        const $container = document.createElement('ul');
        for (let i = 0; i < args.length; i++) {
            const content = utils_1.assertArgType(args, i, 'string');
            const $li = document.createElement('li');
            $li.innerText = content;
            $container.appendChild($li);
        }
        interpreterHandle.pushContent($container);
        return constantsPool_1.getMaybePooled('null', null);
    },
    function contentAddOrderedList(args, interpreterHandle) {
        const $container = document.createElement('ol');
        for (let i = 0; i < args.length; i++) {
            const content = utils_1.assertArgType(args, i, 'string');
            const $li = document.createElement('li');
            $li.innerText = content;
            $container.appendChild($li);
        }
        interpreterHandle.pushContent($container);
        return constantsPool_1.getMaybePooled('null', null);
    },
    function contentAddHeader(args, interpreterHandle) {
        utils_1.assertArgsLength(args, 1, 2);
        const level = utils_1.assertArgType(args, 1, 'number', 1);
        if (![1, 2, 3, 4, 5, 6].includes(level)) {
            throw new utils_1.NativeFunctionError(`There is no header with level ${level}`);
        }
        const $header = document.createElement('h' + level);
        $header.innerText = utils_1.assertArgType(args, 0, 'string');
        interpreterHandle.pushContent($header);
        return constantsPool_1.getMaybePooled('null', null);
    },
    function contentAddTable(args, interpreterHandle) {
        utils_1.assertArgsLength(args, 1, Infinity);
        const rows = args
            .map((_, index) => utils_1.assertArgType(args, index, 'list'));
        rows.forEach((row, rowIndex) => {
            if (row.length !== rows[0].length) {
                throw new utils_1.NativeFunctionError(`Row with index = ${rowIndex} has ` +
                    `incorrect number of items. Expecting ${rows[0].length}, received ` +
                    `${row.length}`);
            }
            row.forEach((item, columnIndex) => {
                if (item.type !== 'string') {
                    throw new utils_1.NativeFunctionError(`Item in row with index = ${rowIndex}` +
                        `, and column with index = ${columnIndex} is expected to be a ` +
                        `string, received: ${Interpreter_1.describe(item)}`);
                }
            });
        });
        const $table = document.createElement('table');
        const $thead = document.createElement('thead');
        const $headTr = document.createElement('tr');
        const headerRow = rows.shift();
        headerRow.forEach(content => {
            const $th = document.createElement('th');
            $th.innerText = content.value;
            $headTr.appendChild($th);
        });
        $thead.appendChild($headTr);
        $table.appendChild($thead);
        const $tbody = document.createElement('tbody');
        rows.forEach(row => {
            const $tr = document.createElement('tr');
            row.forEach(content => {
                const $td = document.createElement('td');
                $td.innerText = content.value;
                $tr.appendChild($td);
            });
            $tbody.appendChild($tr);
        });
        $table.appendChild($tbody);
        interpreterHandle.pushContent($table);
        return constantsPool_1.getMaybePooled('null', null);
    },
    function contentAddHorizontalRule(args, interpreterHandle) {
        utils_1.assertArgsLength(args, 0);
        interpreterHandle.pushContent(document.createElement('hr'));
        return constantsPool_1.getMaybePooled('null', null);
    },
];

},{"../Interpreter":61,"../constantsPool":65,"./utils":77}],70:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constantsPool_1 = require("../constantsPool");
const Interpreter_1 = require("../Interpreter");
const invokeFunction_1 = require("../invokeFunction");
const WTCDError_1 = require("../WTCDError");
const utils_1 = require("./utils");
exports.debugStdFunctions = [
    function print(args) {
        console.group('WTCD print call');
        args.forEach((arg, index) => console.info(`[${index}] ${Interpreter_1.describe(arg)}`));
        console.groupEnd();
        return constantsPool_1.getMaybePooled('null', null);
    },
    function assert(args) {
        utils_1.assertArgsLength(args, 1);
        const result = utils_1.assertArgType(args, 0, 'boolean');
        if (!result) {
            throw new utils_1.NativeFunctionError('Assertion failed');
        }
        return constantsPool_1.getMaybePooled('null', null);
    },
    function assertError(args, interpreterHandle) {
        utils_1.assertArgsLength(args, 1);
        const fn = utils_1.assertArgType(args, 0, 'function');
        try {
            invokeFunction_1.invokeFunctionRaw(fn, [], interpreterHandle);
        }
        catch (error) {
            if ((error instanceof WTCDError_1.WTCDError) ||
                (error instanceof invokeFunction_1.FunctionInvocationError)) {
                return constantsPool_1.getMaybePooled('null', null);
            }
            throw error;
        }
        throw new utils_1.NativeFunctionError('Assertion failed, no error is thrown');
    },
    function timeStart(args, interpreterHandle) {
        utils_1.assertArgsLength(args, 0, 1);
        const name = utils_1.assertArgType(args, 0, 'string', 'default');
        if (interpreterHandle.timers.has(name)) {
            throw new utils_1.NativeFunctionError(`Timer "${name}" already existed.`);
        }
        interpreterHandle.timers.set(name, Date.now());
        return constantsPool_1.getMaybePooled('null', null);
    },
    function timeEnd(args, interpreterHandle) {
        utils_1.assertArgsLength(args, 0, 1);
        const name = utils_1.assertArgType(args, 0, 'string', 'default');
        if (!interpreterHandle.timers.has(name)) {
            throw new utils_1.NativeFunctionError(`Cannot find timer "${name}".`);
        }
        const startTime = interpreterHandle.timers.get(name);
        interpreterHandle.timers.delete(name);
        const endTime = Date.now();
        console.group('WTCD timeEnd call');
        console.info(`Timer        : ${name}`);
        console.info(`Start time   : ${startTime}`);
        console.info(`End time     : ${endTime}`);
        console.info(`Time elapsed : ${endTime - startTime}ms`);
        console.groupEnd();
        return constantsPool_1.getMaybePooled('null', null);
    },
];

},{"../Interpreter":61,"../WTCDError":63,"../constantsPool":65,"../invokeFunction":66,"./utils":77}],71:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const content_1 = require("./content");
const debug_1 = require("./debug");
const list_1 = require("./list");
const math_1 = require("./math");
const random_1 = require("./random");
const reader_1 = require("./reader");
const string_1 = require("./string");
const canvas_1 = require("./canvas");
exports.stdFunctions = [
    ...content_1.contentStdFunctions,
    ...debug_1.debugStdFunctions,
    ...list_1.listStdFunctions,
    ...math_1.mathStdFunctions,
    ...random_1.randomStdFunctions,
    ...reader_1.readerStdFunctions,
    ...string_1.stringStdFunctions,
    ...canvas_1.canvasStdFunctions,
];

},{"./canvas":68,"./content":69,"./debug":70,"./list":72,"./math":73,"./random":74,"./reader":75,"./string":76}],72:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constantsPool_1 = require("../constantsPool");
const Interpreter_1 = require("../Interpreter");
const invokeFunction_1 = require("../invokeFunction");
const WTCDError_1 = require("../WTCDError");
const utils_1 = require("./utils");
exports.listStdFunctions = [
    function listSet(args) {
        utils_1.assertArgsLength(args, 3);
        const list = utils_1.assertArgType(args, 0, 'list');
        const index = utils_1.assertArgType(args, 1, 'number');
        const value = args[2];
        if (index % 1 !== 0) {
            throw new utils_1.NativeFunctionError(`Index (${index}) has to be an integer`);
        }
        if (index < 0) {
            throw new utils_1.NativeFunctionError(`Index (${index}) cannot be negative`);
        }
        if (index >= list.length) {
            throw new utils_1.NativeFunctionError(`Index (${index}) out of bounds. List ` +
                `length is ${list.length}`);
        }
        const newList = list.slice();
        newList[index] = value;
        return {
            type: 'list',
            value: newList,
        };
    },
    function listForEach(args, interpreterHandle) {
        utils_1.assertArgsLength(args, 2);
        const list = utils_1.assertArgType(args, 0, 'list');
        const fn = utils_1.assertArgType(args, 1, 'function');
        list.forEach((element, index) => {
            try {
                invokeFunction_1.invokeFunctionRaw(fn, [
                    element,
                    constantsPool_1.getMaybePooled('number', index),
                ], interpreterHandle);
            }
            catch (error) {
                if (error instanceof invokeFunction_1.FunctionInvocationError) {
                    throw new utils_1.NativeFunctionError(`Failed to apply function to the ` +
                        `element with index = ${index} of list: ${error.message}`);
                }
                else if (error instanceof WTCDError_1.WTCDError) {
                    error.pushWTCDStack(`listForEach (index = ${index})`);
                }
                throw error;
            }
        });
        return constantsPool_1.getMaybePooled('null', null);
    },
    function listMap(args, interpreterHandle) {
        utils_1.assertArgsLength(args, 2);
        const list = utils_1.assertArgType(args, 0, 'list');
        const fn = utils_1.assertArgType(args, 1, 'function');
        const result = list.map((element, index) => {
            try {
                return invokeFunction_1.invokeFunctionRaw(fn, [
                    element,
                    constantsPool_1.getMaybePooled('number', index),
                ], interpreterHandle);
            }
            catch (error) {
                if (error instanceof invokeFunction_1.FunctionInvocationError) {
                    throw new utils_1.NativeFunctionError(`Failed to apply function to the ` +
                        `element with index = ${index} of list: ${error.message}`);
                }
                else if (error instanceof WTCDError_1.WTCDError) {
                    error.pushWTCDStack(`listForMap (index = ${index})`);
                }
                throw error;
            }
        });
        return {
            type: 'list',
            value: result,
        };
    },
    function listCreateFilled(args) {
        utils_1.assertArgsLength(args, 1, 2);
        const length = utils_1.assertArgType(args, 0, 'number');
        const value = args.length === 1
            ? constantsPool_1.getMaybePooled('null', null)
            : args[1];
        if (length % 1 !== 0) {
            throw new utils_1.NativeFunctionError(`Length (${length}) has to be an integer.`);
        }
        if (length < 0) {
            throw new utils_1.NativeFunctionError(`Length (${length}) cannot be negative.`);
        }
        const list = new Array(length).fill(value);
        return {
            type: 'list',
            value: list,
        };
    },
    function listChunk(args) {
        utils_1.assertArgsLength(args, 2);
        const list = utils_1.assertArgType(args, 0, 'list');
        const chunkSize = utils_1.assertArgType(args, 1, 'number');
        if (chunkSize % 1 !== 0 || chunkSize < 1) {
            throw new utils_1.NativeFunctionError(`Chunk size (${chunkSize} has to be a ` +
                `positive integer.`);
        }
        const results = [];
        for (let i = 0; i < list.length; i += chunkSize) {
            results.push({
                type: 'list',
                value: list.slice(i, i + chunkSize),
            });
        }
        return {
            type: 'list',
            value: results,
        };
    },
    function listFilter(args, interpreterHandle) {
        utils_1.assertArgsLength(args, 2);
        const list = utils_1.assertArgType(args, 0, 'list');
        const fn = utils_1.assertArgType(args, 1, 'function');
        return {
            type: 'list',
            value: list.filter((item, index) => {
                try {
                    const result = invokeFunction_1.invokeFunctionRaw(fn, [
                        item,
                        constantsPool_1.getMaybePooled('number', index),
                    ], interpreterHandle);
                    if (result.type !== 'boolean') {
                        throw new utils_1.NativeFunctionError(`Predicate is expected to return ` +
                            `booleans, but ${Interpreter_1.describe(result)} is returned for element ` +
                            `with index = ${index}`);
                    }
                    return result.value;
                }
                catch (error) {
                    if (error instanceof invokeFunction_1.FunctionInvocationError) {
                        throw new utils_1.NativeFunctionError(`Failed to apply function to the ` +
                            `element with index = ${index} of list: ${error.message}`);
                    }
                    else if (error instanceof WTCDError_1.WTCDError) {
                        error.pushWTCDStack(`listFilter (index = ${index})`);
                    }
                    throw error;
                }
            }),
        };
    },
    function listSplice(args) {
        utils_1.assertArgsLength(args, 3, 4);
        const source = utils_1.assertArgType(args, 0, 'list');
        const start = utils_1.assertArgType(args, 1, 'number');
        const length = utils_1.assertArgType(args, 2, 'number');
        const newItems = utils_1.assertArgType(args, 3, 'list', []);
        if (start % 1 !== 0) {
            throw new utils_1.NativeFunctionError('Start index must be an integer, ' +
                `provided: ${start}`);
        }
        if (start < 0 || start > source.length) {
            throw new utils_1.NativeFunctionError(`Start index must be in the bounds of ` +
                `the list given (0 - ${source.length}), provided: ${start}`);
        }
        if (length % 1 !== 0) {
            throw new utils_1.NativeFunctionError('Start must be an integer.');
        }
        if (length < 0) {
            throw new utils_1.NativeFunctionError('Length must be nonnegative.');
        }
        if ((start + length) > source.length) {
            throw new utils_1.NativeFunctionError(`Length is too large and causes overflow.`);
        }
        const result = source.slice();
        result.splice(start, length, ...newItems);
        return {
            type: 'list',
            value: result,
        };
    },
    function listSlice(args) {
        utils_1.assertArgsLength(args, 2, 3);
        const source = utils_1.assertArgType(args, 0, 'list');
        const start = utils_1.assertArgType(args, 1, 'number');
        const end = utils_1.assertArgType(args, 2, 'number', source.length);
        if (start % 1 !== 0) {
            throw new utils_1.NativeFunctionError('Start index must be an integer, ' +
                `provided: ${start}`);
        }
        if (start < 0 || start > source.length) {
            throw new utils_1.NativeFunctionError(`Start index must be in the bounds of ` +
                `the list given (0 - ${source.length}), provided: ${start}`);
        }
        if (end % 1 !== 0) {
            throw new utils_1.NativeFunctionError('End index must be an integer, ' +
                `provided: ${end}`);
        }
        if (end < 0 || end > source.length) {
            throw new utils_1.NativeFunctionError(`End index must be in the bounds of ` +
                `the list given (0 - ${source.length}), provided: ${end}`);
        }
        if (end < start) {
            throw new utils_1.NativeFunctionError(`End index must be larger or equal to ` +
                `start index. Provided start = ${start}, end = ${end}`);
        }
        return {
            type: 'list',
            value: source.slice(start, end),
        };
    },
    function listLength(args) {
        utils_1.assertArgsLength(args, 1);
        return constantsPool_1.getMaybePooled('number', utils_1.assertArgType(args, 0, 'list').length);
    },
    function listIndexOf(args) {
        utils_1.assertArgsLength(args, 2);
        const list = utils_1.assertArgType(args, 0, 'list');
        for (let i = 0; i < list.length; i++) {
            if (Interpreter_1.isEqual(list[i], args[1])) {
                return constantsPool_1.getMaybePooled('number', i);
            }
        }
        return constantsPool_1.getMaybePooled('number', -1);
    },
    function listIncludes(args) {
        utils_1.assertArgsLength(args, 2);
        const list = utils_1.assertArgType(args, 0, 'list');
        return constantsPool_1.getMaybePooled('boolean', list.some(item => Interpreter_1.isEqual(item, args[1])));
    },
    function listFindIndex(args, interpreterHandle) {
        utils_1.assertArgsLength(args, 2);
        const list = utils_1.assertArgType(args, 0, 'list');
        const fn = utils_1.assertArgType(args, 1, 'function');
        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            try {
                const result = invokeFunction_1.invokeFunctionRaw(fn, [
                    item,
                    constantsPool_1.getMaybePooled('number', i),
                ], interpreterHandle);
                if (result.type !== 'boolean') {
                    throw new utils_1.NativeFunctionError(`Predicate is expected to return ` +
                        `booleans, but ${Interpreter_1.describe(result)} is returned for element ` +
                        `with index = ${i}`);
                }
                if (result.value) {
                    return constantsPool_1.getMaybePooled('number', i);
                }
            }
            catch (error) {
                if (error instanceof invokeFunction_1.FunctionInvocationError) {
                    throw new utils_1.NativeFunctionError(`Failed to apply function to the ` +
                        `element with index = ${i} of list: ${error.message}`);
                }
                else if (error instanceof WTCDError_1.WTCDError) {
                    error.pushWTCDStack(`listFindIndex (index = ${i})`);
                }
                throw error;
            }
        }
        return constantsPool_1.getMaybePooled('number', -1);
    },
];

},{"../Interpreter":61,"../WTCDError":63,"../constantsPool":65,"../invokeFunction":66,"./utils":77}],73:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constantsPool_1 = require("../constantsPool");
const utils_1 = require("./utils");
exports.mathStdFunctions = [
    function mathMin(args) {
        utils_1.assertArgsLength(args, 1, Infinity);
        let min = Infinity;
        for (let i = 0; i < args.length; i++) {
            const value = utils_1.assertArgType(args, i, 'number');
            if (value < min) {
                min = value;
            }
        }
        return constantsPool_1.getMaybePooled('number', min);
    },
    function mathMax(args) {
        utils_1.assertArgsLength(args, 1, Infinity);
        let max = -Infinity;
        for (let i = 0; i < args.length; i++) {
            const value = utils_1.assertArgType(args, i, 'number');
            if (value > max) {
                max = value;
            }
        }
        return constantsPool_1.getMaybePooled('number', max);
    },
    function mathFloor(args) {
        utils_1.assertArgsLength(args, 1);
        return constantsPool_1.getMaybePooled('number', Math.floor(utils_1.assertArgType(args, 0, 'number')));
    },
    function mathCeil(args) {
        utils_1.assertArgsLength(args, 1);
        return constantsPool_1.getMaybePooled('number', Math.ceil(utils_1.assertArgType(args, 0, 'number')));
    },
];

},{"../constantsPool":65,"./utils":77}],74:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constantsPool_1 = require("../constantsPool");
const utils_1 = require("./utils");
exports.randomStdFunctions = [
    function random(args, interpreterHandle) {
        utils_1.assertArgsLength(args, 0, 2);
        const low = utils_1.assertArgType(args, 0, 'number', 0);
        const high = utils_1.assertArgType(args, 1, 'number', 1);
        return {
            type: 'number',
            value: interpreterHandle.getRandom().next(low, high),
        };
    },
    function randomInt(args, interpreterHandle) {
        utils_1.assertArgsLength(args, 2);
        const low = utils_1.assertArgType(args, 0, 'number');
        const high = utils_1.assertArgType(args, 1, 'number');
        return constantsPool_1.getMaybePooled('number', interpreterHandle.getRandom().nextInt(low, high));
    },
    function randomBoolean(args, interpreterHandle) {
        utils_1.assertArgsLength(args, 0, 1);
        const trueChance = utils_1.assertArgType(args, 0, 'number', 0.5);
        return constantsPool_1.getMaybePooled('boolean', interpreterHandle.getRandom().next() < trueChance);
    },
    function randomBiased(args, interpreterHandle) {
        utils_1.assertArgsLength(args, 0, 4);
        const low = utils_1.assertArgType(args, 0, 'number', 0);
        const high = utils_1.assertArgType(args, 1, 'number', 1);
        const bias = utils_1.assertArgType(args, 2, 'number', (low + high) / 2);
        const influence = utils_1.assertArgType(args, 3, 'number', 4);
        if (low >= high) {
            throw new utils_1.NativeFunctionError('Low cannot be larger than or equal to ' +
                'high.');
        }
        if (bias < low || bias > high) {
            throw new utils_1.NativeFunctionError('Bias has to be between low and high.');
        }
        let norm;
        do {
            // https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
            norm = bias + (high - low) / influence * Math.sqrt((-2) *
                Math.log(interpreterHandle.getRandom().next())) *
                Math.cos(2 * Math.PI * interpreterHandle.getRandom().next());
        } while (norm < low || norm >= high);
        return {
            type: 'number',
            value: norm,
        };
    },
];

},{"../constantsPool":65,"./utils":77}],75:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constantsPool_1 = require("../constantsPool");
const utils_1 = require("./utils");
exports.readerStdFunctions = [
    function readerSetPinned(args, interpreterHandle) {
        utils_1.assertArgsLength(args, 1);
        utils_1.assertArgType(args, 0, 'function');
        interpreterHandle.setPinnedFunction(args[0]);
        return constantsPool_1.getMaybePooled('null', null);
    },
    function readerUnsetPinned(args, interpreterHandle) {
        utils_1.assertArgsLength(args, 0);
        interpreterHandle.setPinnedFunction(null);
        return constantsPool_1.getMaybePooled('null', null);
    },
    function readerSetStateDesc(args, interpreterHandle) {
        utils_1.assertArgsLength(args, 1);
        const stateDesc = utils_1.assertArgType(args, 0, 'string');
        interpreterHandle.setStateDesc(stateDesc);
        return constantsPool_1.getMaybePooled('null', null);
    },
    function readerUnsetStateDesc(args, interpreterHandle) {
        utils_1.assertArgsLength(args, 0);
        interpreterHandle.setStateDesc(null);
        return constantsPool_1.getMaybePooled('null', null);
    },
];

},{"../constantsPool":65,"./utils":77}],76:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constantsPool_1 = require("../constantsPool");
const utils_1 = require("./utils");
exports.stringStdFunctions = [
    function stringLength(args) {
        utils_1.assertArgsLength(args, 1);
        const str = utils_1.assertArgType(args, 0, 'string');
        return constantsPool_1.getMaybePooled('number', str.length);
    },
    function stringFormatNumberFixed(args) {
        utils_1.assertArgsLength(args, 1, 2);
        const num = utils_1.assertArgType(args, 0, 'number');
        const digits = utils_1.assertArgType(args, 1, 'number', 0);
        if (digits < 0 || digits > 100 || digits % 1 !== 0) {
            throw new utils_1.NativeFunctionError('Digits must be an integer between 0 and ' +
                `100, received: ${digits}`);
        }
        return constantsPool_1.getMaybePooled('string', num.toFixed(digits));
    },
    function stringFormatNumberPrecision(args) {
        utils_1.assertArgsLength(args, 2);
        const num = utils_1.assertArgType(args, 0, 'number');
        const digits = utils_1.assertArgType(args, 1, 'number');
        if (digits < 1 || digits > 100 || digits % 1 !== 0) {
            throw new utils_1.NativeFunctionError('Digits must be an integer between 1 and ' +
                `100, received: ${digits}`);
        }
        return constantsPool_1.getMaybePooled('string', num.toPrecision(digits));
    },
    function stringSplit(args) {
        utils_1.assertArgsLength(args, 2);
        const str = utils_1.assertArgType(args, 0, 'string');
        const separator = utils_1.assertArgType(args, 1, 'string');
        return constantsPool_1.getMaybePooled('list', str.split(separator).map(str => constantsPool_1.getMaybePooled('string', str)));
    },
    function stringSubByLength(args) {
        utils_1.assertArgsLength(args, 2, 3);
        const str = utils_1.assertArgType(args, 0, 'string');
        const startIndex = utils_1.assertArgType(args, 1, 'number');
        const length = utils_1.assertArgType(args, 2, 'number', str.length - startIndex);
        if (startIndex < 0 || startIndex % 1 !== 0) {
            throw new utils_1.NativeFunctionError(`Start index must be an nonnegative ` +
                `integer, received: ${startIndex}`);
        }
        if (startIndex > str.length) {
            throw new utils_1.NativeFunctionError(`Start cannot be larger than str length. ` +
                `startIndex=${startIndex}, str length=${str.length}`);
        }
        if (length < 0 || length % 1 !== 0) {
            throw new utils_1.NativeFunctionError(`Length must be an nonnegative integer ` +
                `, received: ${length}`);
        }
        if (startIndex + length > str.length) {
            throw new utils_1.NativeFunctionError(`Index out of bounds. ` +
                `startIndex=${startIndex}, length=${length}, ` +
                `str length=${str.length}.`);
        }
        return constantsPool_1.getMaybePooled('string', str.substr(startIndex, length));
    },
    function stringSubByIndex(args) {
        utils_1.assertArgsLength(args, 2, 3);
        const str = utils_1.assertArgType(args, 0, 'string');
        const startIndex = utils_1.assertArgType(args, 1, 'number');
        const endIndexExclusive = utils_1.assertArgType(args, 2, 'number', str.length);
        if (startIndex < 0 || startIndex % 1 !== 0) {
            throw new utils_1.NativeFunctionError(`Start index must be an nonnegative ` +
                `integer, received: ${startIndex}`);
        }
        if (startIndex > str.length) {
            throw new utils_1.NativeFunctionError(`Start cannot be larger than str length. ` +
                `startIndex=${startIndex}, str length=${str.length}`);
        }
        if (endIndexExclusive < 0 || endIndexExclusive % 1 !== 0) {
            throw new utils_1.NativeFunctionError(`End index must be an nonnegative ` +
                `integer, received: ${endIndexExclusive}`);
        }
        if (endIndexExclusive < startIndex || endIndexExclusive > str.length) {
            throw new utils_1.NativeFunctionError(`End index cannot be smaller than start ` +
                `index nor larger than the length of str. ` +
                `endIndex=${endIndexExclusive}, startIndex=${startIndex}, ` +
                `str length=${str.length}`);
        }
        return constantsPool_1.getMaybePooled('string', str.substring(startIndex, endIndexExclusive));
    },
];

},{"../constantsPool":65,"./utils":77}],77:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constantsPool_1 = require("../constantsPool");
const Interpreter_1 = require("../Interpreter");
class NativeFunctionError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.NativeFunctionError = NativeFunctionError;
function assertArgsLength(args, min, max = min) {
    if (args.length < min) {
        throw new NativeFunctionError(`Too few arguments are provided. ` +
            `Minimum number of arguments: ${min}, received: ${args.length}`);
    }
    if (args.length > max) {
        throw new NativeFunctionError(`Too many arguments are provided. ` +
            `Maximum number of arguments: ${max}, received: ${args.length}`);
    }
}
exports.assertArgsLength = assertArgsLength;
/** Turn undefined to null value */
function nullify(args, index) {
    const value = args[index];
    if (value === undefined) {
        return constantsPool_1.getMaybePooled('null', null);
    }
    return value;
}
exports.nullify = nullify;
function assertArgType(args, index, type, defaultValue) {
    const value = nullify(args, index);
    if (value.type === 'null' && defaultValue !== undefined) {
        return defaultValue;
    }
    if (value.type !== type) {
        throw new NativeFunctionError(`The argument with index = ${index} of ` +
            `invocation has wrong type. Expected: ${type}, received: ` +
            `${Interpreter_1.describe(value)}`);
    }
    return value.value;
}
exports.assertArgType = assertArgType;

},{"../Interpreter":61,"../constantsPool":65}],78:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function flat(arr) {
    const result = [];
    for (const item of arr) {
        if (Array.isArray(item)) {
            result.push(...item);
        }
        else {
            result.push(item);
        }
    }
    return result;
}
exports.flat = flat;
function arrayEquals(arr0, arr1, comparator = (e0, e1) => e0 === e1) {
    return (arr0.length === arr1.length) && arr0.every((e0, index) => comparator(e0, arr1[index]));
}
exports.arrayEquals = arrayEquals;

},{}]},{},[37]);
