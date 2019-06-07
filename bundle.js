!function i(a,s,l){function c(t,e){if(!s[t]){if(!a[t]){var n="function"==typeof require&&require;if(!e&&n)return n(t,!0);if(u)return u(t,!0);var o=new Error("Cannot find module '"+t+"'");throw o.code="MODULE_NOT_FOUND",o}var r=s[t]={exports:{}};a[t][0].call(r.exports,function(e){return c(a[t][1][e]||e)},r,r.exports,i,a,s,l)}return s[t].exports}for(var u="function"==typeof require&&require,e=0;e<l.length;e++)c(l[e]);return c}({1:[function(e,t,n){"use strict";var o,r=this&&this.__extends||(o=function(e,t){return(o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}o(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)});Object.defineProperty(n,"__esModule",{value:!0});var i,a=e("./commentBlockControl"),s=e("./Menu"),l=e("./messages"),c=(i=s.Menu,r(u,i),u.prototype.update=function(){var t=this;this.clearItems();var e=a.getBlockedUsers();0===e.length?this.addItem(l.NO_BLOCKED_USERS,{small:!0}):this.addItem(l.CLICK_TO_UNBLOCK,{small:!0}),e.forEach(function(e){t.addItem(e,{small:!0,button:!0}).onClick(function(){a.unblockUser(e)})})},u);function u(e){var t=i.call(this,"屏蔽用户评论管理",e)||this;return t.update(),a.blockedUserUpdateEvent.on(t.update.bind(t)),t}n.BlockMenu=c},{"./Menu":8,"./commentBlockControl":16,"./messages":25}],2:[function(e,t,n){"use strict";var o,r=this&&this.__extends||(o=function(e,t){return(o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}o(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)}),p=this&&this.__values||function(e){var t="function"==typeof Symbol&&e[Symbol.iterator],n=0;return t?t.call(e):{next:function(){return e&&n>=e.length&&(e=void 0),{value:e&&e[n++],done:!e}}}};Object.defineProperty(n,"__esModule",{value:!0});var m=e("./chapterControl"),v=e("./data"),g=e("./history"),i=e("./Menu"),y=new Map,a=null;function C(e){e.addClass("last-read"),a=e}m.loadChapterEvent.on(function(e){null!==a&&a.removeClass("last-read"),C(y.get(e))});var _,s=(_=i.Menu,r(w,_),w);function w(e,t){var n,o,r,i,a=this;void 0===t&&(t=v.data.chapterTree),a=_.call(this,t.isRoot?"章节选择":t.displayName,e)||this;try{for(var s=p(t.subfolders),l=s.next();!l.done;l=s.next()){var c=l.value;a.addLink(new w(a,c),!0).addClass("folder")}}catch(e){n={error:e}}finally{try{l&&!l.done&&(o=s.return)&&o.call(s)}finally{if(n)throw n.error}}function u(e){var t=d.addItem(e.displayName,{small:!0,button:!0}).onClick(function(){m.loadChapter(e.htmlRelativePath),g.updateHistory(!0)});e.isEarlyAccess&&(t.setInnerText("[编写中] "+e.displayName),t.addClass("early-access")),window.localStorage.getItem("lastRead")===e.htmlRelativePath&&C(t,e.htmlRelativePath),y.set(e.htmlRelativePath,t)}var d=this;try{for(var h=p(t.chapters),f=h.next();!f.done;f=h.next()){u(f.value)}}catch(e){r={error:e}}finally{try{f&&!f.done&&(i=h.return)&&i.call(h)}finally{if(r)throw r.error}}return a}n.ChaptersMenu=s},{"./Menu":8,"./chapterControl":15,"./data":18,"./history":22}],3:[function(e,t,n){"use strict";var o,r=this&&this.__extends||(o=function(e,t){return(o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}o(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)});Object.defineProperty(n,"__esModule",{value:!0});var i,a=e("./Menu"),s=(i=a.Menu,r(l,i),l);function l(e){var t=i.call(this,"订阅/讨论组",e)||this;return t.addItem("Telegram 更新推送频道",{small:!0,button:!0,link:"https://t.me/joinchat/AAAAAEpkRVwZ-3s5V3YHjA"}),t.addItem("Telegram 讨论组",{small:!0,button:!0,link:"https://t.me/joinchat/Dt8_WlJnmEwYNbjzlnLyNA"}),t.addItem("GitHub Repo",{small:!0,button:!0,link:"https://github.com/SCLeoX/Wearable-Technology"}),t.addItem("原始 Google Docs",{small:!0,button:!0,link:"https://docs.google.com/document/d/1Pp5CtO8c77DnWGqbXg-3e7w9Q3t88P35FOl6iIJvMfo/edit?usp=sharing"}),t}n.ContactMenu=s},{"./Menu":8}],4:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var o=e("./DebugLogger");n.id=function(e){return document.getElementById(e)},n.getTextNodes=function e(t,n){for(var o=n||[],r=t.firstChild;null!==r;)r instanceof HTMLElement&&e(r,o),r instanceof Text&&o.push(r),r=r.nextSibling;return o};var r=new o.DebugLogger("selectNode");n.selectNode=function(t){try{var e=window.getSelection(),n=document.createRange();n.selectNodeContents(t),e.removeAllRanges(),e.addRange(n)}catch(e){r.log("Failed to select node: ",t,"; Error: ",e)}}},{"./DebugLogger":5}],5:[function(e,t,n){"use strict";var o=this&&this.__read||function(e,t){var n="function"==typeof Symbol&&e[Symbol.iterator];if(!n)return e;var o,r,i=n.call(e),a=[];try{for(;(void 0===t||0<t--)&&!(o=i.next()).done;)a.push(o.value)}catch(e){r={error:e}}finally{try{o&&!o.done&&(n=i.return)&&n.call(i)}finally{if(r)throw r.error}}return a},r=this&&this.__spread||function(){for(var e=[],t=0;t<arguments.length;t++)e=e.concat(o(arguments[t]));return e};Object.defineProperty(n,"__esModule",{value:!0});var i=e("./settings");var a=(s.prototype.log=function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];i.debugLogging.getValue()&&console.info.apply(console,r([this.prefix],e))},s);function s(e,t){void 0===t&&(t={}),this.prefix=e+"("+Object.keys(t).map(function(e){return e+"="+function(e){switch(typeof e){case"string":return'"'+e+'"';default:return String(e)}}(t[e])}).join(",")+")"}n.DebugLogger=a},{"./settings":26}],6:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var o=(r.prototype.on=function(e){var t=this;return this.isEmitting?this.queue.push(function(){t.on(e)}):(null===this.listeners&&(this.listeners=new Set),this.listeners.add(e)),e},r.prototype.off=function(e){var t=this;this.isEmitting?this.queue.push(function(){t.off(e)}):null!==this.listeners&&this.listeners.delete(e)},r.prototype.once=function(e){var t=this;return this.isEmitting?this.queue.push(function(){t.once(e)}):(null===this.onceListeners&&(this.onceListeners=[]),this.onceListeners.push(e)),e},r.prototype.expect=function(o){var r=this;return this.isEmitting?new Promise(function(e){r.queue.push(function(){r.expect(o).then(e)})}):void 0===o?new Promise(function(e){return r.once(e)}):new Promise(function(t){var n=r.on(function(e){o(e)&&(r.off(n),t(e))})})},r.prototype.emit=function(t){var e=this;if(this.isEmitting)this.queue.push(function(){e.emit(t)});else for(this.isEmitting=!0,null!==this.listeners&&this.listeners.forEach(function(e){return e(t)}),null!==this.onceListeners&&(this.onceListeners.forEach(function(e){return e(t)}),this.onceListeners.length=0),this.isEmitting=!1;1<=this.queue.length;)this.queue.shift()()},r);function r(){this.listeners=null,this.onceListeners=null,this.isEmitting=!1,this.queue=[]}n.Event=o},{}],7:[function(e,t,n){"use strict";var o,r=this&&this.__extends||(o=function(e,t){return(o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}o(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)});Object.defineProperty(n,"__esModule",{value:!0});var i,a=e("./ChaptersMenu"),s=e("./ContactMenu"),l=e("./Menu"),c=e("./SettingsMenu"),u=e("./StatsMenu"),d=e("./StyleMenu"),h=e("./ThanksMenu"),f=(i=l.Menu,r(p,i),p);function p(){var e=i.call(this,"",null)||this;return e.addLink(new a.ChaptersMenu(e)),e.addLink(new h.ThanksMenu(e)),e.addLink(new d.StyleMenu(e)),e.addLink(new s.ContactMenu(e)),e.addItem("源代码",{button:!0,link:"https://github.com/SCLeoX/Wearable-Technology"}),e.addLink(new c.SettingsMenu(e)),e.addLink(new u.StatsMenu(e)),e}n.MainMenu=f},{"./ChaptersMenu":2,"./ContactMenu":3,"./Menu":8,"./SettingsMenu":10,"./StatsMenu":12,"./StyleMenu":13,"./ThanksMenu":14}],8:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var i,o,a=e("./DebugLogger"),s=e("./Event"),l=e("./RectMode");(o=i=n.ItemDecoration||(n.ItemDecoration={}))[o.SELECTABLE=0]="SELECTABLE",o[o.BACK=1]="BACK";var r=(c.prototype.setSelected=function(e){return this.element.classList.toggle("selected",e),this},c.prototype.onClick=function(e){var t=this;return this.element.addEventListener("click",function(){e(t.element)}),this},c.prototype.linkTo=function(e){var t=this;return this.onClick(function(){t.menu.navigateTo(e)}),this},c.prototype.setInnerText=function(e){return this.element.innerText=e,this},c.prototype.addClass=function(e){return this.element.classList.add(e),this},c.prototype.removeClass=function(e){return this.element.classList.remove(e),this},c);function c(e,t){this.menu=e,this.element=t}n.ItemHandle=r;var u=(d.prototype.navigateTo=function(e){this.setActive(!1),e.setActive(!0),l.setRectMode(e.rectMode)},d.prototype.exit=function(){if(null===this.parent)throw new Error("Cannot exit the root menu.");this.navigateTo(this.parent)},d.prototype.setActive=function(e){this.debugLogger.log("setActive("+e+")"),!this.active&&e&&this.activateEvent.emit(),this.active=e,this.container.classList.toggle("hidden",!e)},d.prototype.isActive=function(){return this.active},d.prototype.addItem=function(e,t){var n;return t.button&&void 0!==t.link?((n=document.createElement("a")).href=t.link,n.target="_blank"):n=document.createElement("div"),n.innerText=e,t.small&&n.classList.add("small"),t.button&&(n.classList.add("button"),t.decoration===i.BACK?n.classList.add("back"):t.decoration===i.SELECTABLE&&n.classList.add("selectable")),this.container.appendChild(n),t.unclearable||this.clearableElements.push(n),new r(this,n)},d.prototype.clearItems=function(){this.clearableElements.forEach(function(e){return e.remove()}),this.clearableElements=[]},d.prototype.addLink=function(e,t){return this.addItem(e.name,{small:t,button:!0}).linkTo(e)},d);function d(e,t,n){var o=this;if(void 0===n&&(n=l.RectMode.OFF),this.name=e,this.parent=t,this.rectMode=n,this.clearableElements=[],this.activateEvent=new s.Event,this.debugLogger=new a.DebugLogger("Menu",{name:e}),this.fullPath=null===t?[]:t.fullPath.slice(),""!==e&&this.fullPath.push(e),this.container=document.createElement("div"),this.container.classList.add("menu","hidden"),1<=this.fullPath.length){var r=document.createElement("div");r.classList.add("path"),r.innerText=this.fullPath.join(" > "),this.container.appendChild(r)}null!==t&&this.addItem("返回",{button:!0,decoration:i.BACK,unclearable:!0}).linkTo(t),document.body.appendChild(this.container),l.rectModeChangeEvent.on(function(e){var t=e.newRectMode;o.active&&t===l.RectMode.MAIN&&(o.setActive(!1),l.rectModeChangeEvent.expect().then(function(){o.setActive(!0)}))})}n.Menu=u},{"./DebugLogger":5,"./Event":6,"./RectMode":9}],9:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var o,r,i=e("./DebugLogger"),a=e("./DOM"),s=e("./Event");(r=o=n.RectMode||(n.RectMode={}))[r.SIDE=0]="SIDE",r[r.MAIN=1]="MAIN",r[r.OFF=2]="OFF";var l=a.id("rect"),c=new i.DebugLogger("RectMode");n.rectModeChangeEvent=new s.Event;var u=o.OFF;n.setRectMode=function(e){c.log(o[u]+" -> "+o[e]),u!==e&&(e===o.OFF?l.classList.remove("reading"):(u===o.MAIN?l.classList.remove("main"):u===o.SIDE?l.classList.remove("side"):(l.classList.remove("main","side"),l.classList.add("reading")),e===o.MAIN?l.classList.add("main"):l.classList.add("side")),n.rectModeChangeEvent.emit({previousRectMode:u,newRectMode:e}),u=e)}},{"./DOM":4,"./DebugLogger":5,"./Event":6}],10:[function(e,t,n){"use strict";var o,r=this&&this.__extends||(o=function(e,t){return(o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}o(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)});Object.defineProperty(n,"__esModule",{value:!0});var a,i=e("./BlockMenu"),s=e("./commentsControl"),l=e("./DOM"),c=e("./Menu"),u=e("./RectMode"),d=e("./settings"),h=e("./stylePreviewArticle"),f=(a=c.Menu,r(p,a),p);function p(e,t,o,n){var r,i=a.call(this,t+"设置",e,n?u.RectMode.SIDE:u.RectMode.MAIN)||this;return n&&i.activateEvent.on(function(){s.hideComments(),l.id("content").innerHTML=h.stylePreviewArticle}),o.options.forEach(function(e,t){var n=i.addItem(e,{small:!0,button:!0,decoration:c.ItemDecoration.SELECTABLE}).onClick(function(){r.setSelected(!1),n.setSelected(!0),o.setValue(t),r=n});t===o.getValue()&&(r=n).setSelected(!0)}),i}n.EnumSettingMenu=f;var m,v=(m=c.Menu,r(g,m),g.prototype.addBooleanSetting=function(e,t){function n(){return e+"："+(t.getValue()?"开":"关")}var o=this.addItem(n(),{small:!0,button:!0}).onClick(function(){t.toggle(),o.setInnerText(n())})},g.prototype.addEnumSetting=function(e,t,n){function o(){return e+"："+t.getValueName()}var r=this,i=this.addItem(o(),{small:!0,button:!0}),a=new f(this,e,t,!0===n);i.linkTo(a).onClick(function(){r.activateEvent.once(function(){i.setInnerText(o())})})},g);function g(e){var t=m.call(this,"设置",e)||this;return t.addBooleanSetting("NSFW 警告",d.warning),t.addBooleanSetting("使用动画",d.animation),t.addBooleanSetting("显示编写中章节",d.earlyAccess),t.addBooleanSetting("显示评论",d.useComments),t.addBooleanSetting("手势切换章节（仅限手机）",d.gestureSwitchChapter),t.addEnumSetting("字体",d.fontFamily,!0),t.addBooleanSetting("开发人员模式",d.debugLogging),t.addLink(new i.BlockMenu(t),!0),t}n.SettingsMenu=v},{"./BlockMenu":1,"./DOM":4,"./Menu":8,"./RectMode":9,"./commentsControl":17,"./settings":26,"./stylePreviewArticle":28}],11:[function(e,t,n){"use strict";var o,r=this&&this.__extends||(o=function(e,t){return(o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}o(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)}),i=this&&this.__read||function(e,t){var n="function"==typeof Symbol&&e[Symbol.iterator];if(!n)return e;var o,r,i=n.call(e),a=[];try{for(;(void 0===t||0<t--)&&!(o=i.next()).done;)a.push(o.value)}catch(e){r={error:e}}finally{try{o&&!o.done&&(n=i.return)&&n.call(i)}finally{if(r)throw r.error}}return a};Object.defineProperty(n,"__esModule",{value:!0});var a,s=e("./data"),l=e("./Menu"),c=(a=l.Menu,r(u,a),u);function u(e){var r=a.call(this,"关键词统计",e)||this;return r.addItem("添加其他关键词",{small:!0,button:!0,link:"https://github.com/SCLeoX/Wearable-Technology/edit/master/src/builder/keywords.ts"}),s.data.keywordsCount.forEach(function(e){var t=i(e,2),n=t[0],o=t[1];r.addItem(n+"："+o,{small:!0})}),r}n.StatsKeywordsCountMenu=c},{"./Menu":8,"./data":18}],12:[function(e,t,n){"use strict";var o,r=this&&this.__extends||(o=function(e,t){return(o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}o(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)});Object.defineProperty(n,"__esModule",{value:!0});var i,a=e("./data"),s=e("./Menu"),l=e("./StatsKeywordsCountMenu"),c=(i=s.Menu,r(u,i),u);function u(e){var t=i.call(this,"统计",e)||this;return t.addItem("统计数据由构建脚本自动生成",{small:!0}),t.addLink(new l.StatsKeywordsCountMenu(t),!0),t.addItem("总字数："+a.data.charsCount,{small:!0}),t.addItem("总段落数："+a.data.paragraphsCount,{small:!0}),t}n.StatsMenu=c},{"./Menu":8,"./StatsKeywordsCountMenu":11,"./data":18}],13:[function(e,t,n){"use strict";var o,r=this&&this.__extends||(o=function(e,t){return(o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}o(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)}),m=this&&this.__values||function(e){var t="function"==typeof Symbol&&e[Symbol.iterator],n=0;return t?t.call(e):{next:function(){return e&&n>=e.length&&(e=void 0),{value:e&&e[n++],done:!e}}}};Object.defineProperty(n,"__esModule",{value:!0});var v=e("./commentsControl"),i=e("./DebugLogger"),g=e("./DOM"),y=e("./Menu"),C=e("./RectMode"),_=e("./stylePreviewArticle"),a=(s.prototype.injectStyleSheet=function(){var n=this,e=document.createElement("style");document.head.appendChild(e);var o=e.sheet;function t(t){try{o.insertRule(t)}catch(e){n.debugLogger.log('Failed to inject rule "'+t+'".',e)}}o.disabled=!0,t(".rect.reading { background-color: "+this.def.rectBgColor+"; }"),t(".rect.reading>div { background-color: "+this.def.paperBgColor+"; }"),t(".rect.reading>div { color: "+this.def.textColor+"; }"),t(".rect.reading>.content a { color: "+this.def.linkColor+"; }"),t(".rect.reading>.content a:hover { color: "+this.def.linkHoverColor+"; }"),t(".rect.reading>.content a:active { color: "+this.def.linkActiveColor+"; }"),t(".rect.reading>.content>.earlyAccess.block { background-color: "+this.def.contentBlockEarlyAccessColor+"; }"),t(".rect>.comments>div { background-color: "+this.def.commentColor+"; }"),t("@media (min-width: 901px) { ::-webkit-scrollbar-thumb { background-color: "+this.def.paperBgColor+"; } }"),t("@media (min-width: 901px) { ::-webkit-scrollbar-thumb:hover { background-color: "+this.def.linkColor+"; } }"),t("@media (min-width: 901px) { ::-webkit-scrollbar-thumb:active { background-color: "+this.def.linkActiveColor+"; } }");var r=this.def.keyIsDark?"black":"white",i=this.def.keyIsDark?0:255;t(".rect>.comments>.create-comment::before { background-color: "+r+"; }"),t(":root { --key-opacity-01: rgba("+i+","+i+","+i+",0.1); } "),t(":root { --key-opacity-05: rgba("+i+","+i+","+i+",0.5); } "),this.styleSheet=o},s.prototype.active=function(){if(null!==s.currentlyEnabled){var e=s.currentlyEnabled;null!==e.styleSheet&&(e.styleSheet.disabled=!0),e.itemHandle.setSelected(!1)}null===this.styleSheet&&this.injectStyleSheet(),this.styleSheet.disabled=!1,this.itemHandle.setSelected(!0),window.localStorage.setItem("style",this.name),s.currentlyEnabled=this},s.currentlyEnabled=null,s);function s(e,t){this.name=e,this.def=t,this.styleSheet=null,this.debugLogger=new i.DebugLogger("Style",{name:e})}var w,M=[new a("默认",{rectBgColor:"#EFEFED",paperBgColor:"#FFF",textColor:"#000",linkColor:"#00E",linkHoverColor:"#F00",linkActiveColor:"#00C",contentBlockEarlyAccessColor:"#FFE082",commentColor:"#F5F5F5",keyIsDark:!0}),new a("夜间",{rectBgColor:"#272B36",paperBgColor:"#38404D",textColor:"#DDD",linkColor:"#55E",linkHoverColor:"#55E",linkActiveColor:"#33C",contentBlockEarlyAccessColor:"#E65100",commentColor:"#272B36",keyIsDark:!1}),new a("羊皮纸",{rectBgColor:"#D8D4C9",paperBgColor:"#F8F4E9",textColor:"#552830",linkColor:"#00E",linkHoverColor:"#F00",linkActiveColor:"#00C",contentBlockEarlyAccessColor:"#FFE082",commentColor:"#F9EFD7",keyIsDark:!0}),new a("可穿戴科技",{rectBgColor:"#444",paperBgColor:"#333",textColor:"#DDD",linkColor:"#66F",linkHoverColor:"#66F",linkActiveColor:"#44D",contentBlockEarlyAccessColor:"#E65100",commentColor:"#444",keyIsDark:!1}),new a("巧克力",{rectBgColor:"#2C1C11",paperBgColor:"#3E2519",textColor:"#CD9F89",linkColor:"#66F",linkHoverColor:"#66F",linkActiveColor:"#44D",contentBlockEarlyAccessColor:"#E65100",commentColor:"#2C1C11",keyIsDark:!1})],l=(w=y.Menu,r(c,w),c);function c(e){function t(e){e.itemHandle=s.addItem(e.name,{small:!0,button:!0,decoration:y.ItemDecoration.SELECTABLE}).onClick(function(){e.active()})}var n,o,r,i,a=w.call(this,"阅读器样式",e,C.RectMode.SIDE)||this,s=this;try{for(var l=m(M),c=l.next();!c.done;c=l.next()){t(p=c.value)}}catch(e){n={error:e}}finally{try{c&&!c.done&&(o=l.return)&&o.call(l)}finally{if(n)throw n.error}}var u=window.localStorage.getItem("style"),d=!1;try{for(var h=m(M),f=h.next();!f.done;f=h.next()){var p;if(u===(p=f.value).name){p.active(),d=!0;break}}}catch(e){r={error:e}}finally{try{f&&!f.done&&(i=h.return)&&i.call(h)}finally{if(r)throw r.error}}return d||M[0].active(),a.activateEvent.on(function(){v.hideComments(),g.id("content").innerHTML=_.stylePreviewArticle}),a}n.StyleMenu=l},{"./DOM":4,"./DebugLogger":5,"./Menu":8,"./RectMode":9,"./commentsControl":17,"./stylePreviewArticle":28}],14:[function(e,t,n){"use strict";var o,r=this&&this.__extends||(o=function(e,t){return(o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}o(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)}),s=this&&this.__values||function(e){var t="function"==typeof Symbol&&e[Symbol.iterator],n=0;return t?t.call(e):{next:function(){return e&&n>=e.length&&(e=void 0),{value:e&&e[n++],done:!e}}}};Object.defineProperty(n,"__esModule",{value:!0});var l,i=e("./Menu"),c=e("./thanks"),a=(l=i.Menu,r(u,l),u);function u(e){var t,n,o=l.call(this,"鸣谢列表",e)||this;try{for(var r=s(c.thanks),i=r.next();!i.done;i=r.next()){var a=i.value;o.addItem(a.name,void 0===a.link?{small:!0}:{small:!0,button:!0,link:a.link})}}catch(e){t={error:e}}finally{try{i&&!i.done&&(n=r.return)&&n.call(r)}finally{if(t)throw t.error}}return o}n.ThanksMenu=a},{"./Menu":8,"./thanks":29}],15:[function(e,t,r){"use strict";var c=this&&this.__read||function(e,t){var n="function"==typeof Symbol&&e[Symbol.iterator];if(!n)return e;var o,r,i=n.call(e),a=[];try{for(;(void 0===t||0<t--)&&!(o=i.next()).done;)a.push(o.value)}catch(e){r={error:e}}finally{try{o&&!o.done&&(n=i.return)&&n.call(i)}finally{if(r)throw r.error}}return a};Object.defineProperty(r,"__esModule",{value:!0});var u=e("./commentsControl"),i=e("./data"),d=e("./DOM"),n=e("./Event"),o=e("./gestures"),h=e("./history"),a=e("./loadingText"),s=e("./RectMode"),l=e("./settings"),f=e("./state"),p=d.id("content"),m=new Map;function v(){s.setRectMode(s.RectMode.OFF),f.state.currentChapter=null,f.state.chapterSelection=null,f.state.chapterTextNodes=null}r.loadChapterEvent=new n.Event,r.closeChapter=v;function g(e){var t=c(e,4),n=t[0],o=t[1],r=t[2],i=t[3];if(null!==f.state.chapterTextNodes){var a=f.state.chapterTextNodes[n],s=f.state.chapterTextNodes[r];if(void 0!==a&&void 0!==s){document.getSelection().setBaseAndExtent(a,o,s,i);var l=a.parentElement;null!==l&&"function"==typeof l.scrollIntoView&&l.scrollIntoView()}}}function y(){var e=document.createElement("span");return e.style.flex="1",e}function C(e){return l.earlyAccess.getValue()||!e.isEarlyAccess}var _=function(e){f.state.chapterTextNodes=d.getTextNodes(p),void 0!==e&&(null===d.id("warning")?g(e):d.id("warning").addEventListener("click",function(){g(e)})),Array.from(p.getElementsByTagName("a")).forEach(function(e){return e.target="_blank"}),Array.from(p.getElementsByTagName("code")).forEach(function(e){return e.addEventListener("dblclick",function(){d.selectNode(e)})});var t=f.state.currentChapter,n=t.inFolderIndex;if(t.chapter.isEarlyAccess){var o=function(e,t,n){var o=document.createElement("div");o.classList.add("block",e);var r=document.createElement("h1");r.innerText=t,o.appendChild(r);var i=document.createElement("p");return i.innerText=n,o.appendChild(i),o}("earlyAccess","编写中章节","请注意，本文正在编写中，因此可能会含有未完成的句子或是尚未更新的信息。");p.prepend(o)}var r=document.createElement("div");if(r.style.display="flex",1<=n&&C(t.folder.chapters[n-1])){var i=t.folder.chapters[n-1].htmlRelativePath,a=document.createElement("a");a.innerText="上一章",a.href=window.location.pathname+"#"+i,a.style.textAlign="left",a.style.flex="1",a.addEventListener("click",function(e){e.preventDefault(),w(i),h.updateHistory(!0)}),r.appendChild(a)}else r.appendChild(y());var s=document.createElement("a");if(s.innerText="返回菜单",s.href=window.location.pathname,s.style.textAlign="center",s.style.flex="1",s.addEventListener("click",function(e){e.preventDefault(),v(),h.updateHistory(!0)}),r.appendChild(s),n<t.folder.chapters.length-1&&C(t.folder.chapters[n+1])){var l=t.folder.chapters[n+1].htmlRelativePath,c=document.createElement("a");c.innerText="下一章",c.href=window.location.pathname+"#"+l,c.style.textAlign="right",c.style.flex="1",c.addEventListener("click",function(e){e.preventDefault(),w(l),h.updateHistory(!0)}),r.appendChild(c)}else r.appendChild(y());p.appendChild(r),u.loadComments(t.chapter.commentsUrl),d.id("rect").style.overflow="hidden",setTimeout(function(){d.id("rect").style.overflow=null,void 0===e&&d.id("rect").scrollTo(0,0)},1)};function w(t,n){r.loadChapterEvent.emit(t),window.localStorage.setItem("lastRead",t),s.setRectMode(s.RectMode.MAIN);var o=i.relativePathLookUpMap.get(t);return f.state.currentChapter=o,m.has(t)?null===m.get(t)?p.innerText=a.loadingText:(p.innerHTML=m.get(t),_(n)):(p.innerText=a.loadingText,fetch("./chapters/"+t).then(function(e){return e.text()}).then(function(e){m.set(t,e),o===f.state.currentChapter&&(p.innerHTML=e,_(n))})),!0}o.swipeEvent.on(function(e){if(l.gestureSwitchChapter.getValue()){var t=f.state.currentChapter;if(null!==t){var n=t.inFolderIndex;if(e===o.SwipeDirection.TO_RIGHT){if(1<=n&&C(t.folder.chapters[n-1]))w(t.folder.chapters[n-1].htmlRelativePath),h.updateHistory(!0)}else if(e===o.SwipeDirection.TO_LEFT){if(n<t.folder.chapters.length-1&&C(t.folder.chapters[n+1]))w(t.folder.chapters[n+1].htmlRelativePath),h.updateHistory(!0)}}}}),r.loadChapter=w},{"./DOM":4,"./Event":6,"./RectMode":9,"./commentsControl":17,"./data":18,"./gestures":21,"./history":22,"./loadingText":24,"./settings":26,"./state":27}],16:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var o=e("./Event"),r=new Set(JSON.parse(window.localStorage.getItem("blockedUsers")||"[]"));function i(){window.localStorage.setItem("blockedUsers",JSON.stringify(Array.from(r))),n.blockedUserUpdateEvent.emit()}n.blockedUserUpdateEvent=new o.Event,n.blockUser=function(e){r.add(e),i()},n.unblockUser=function(e){r.delete(e),i()},n.isUserBlocked=function(e){return r.has(e)},n.getBlockedUsers=function(){return Array.from(r)}},{"./Event":6}],17:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var d=e("./commentBlockControl"),o=e("./DOM"),h=e("./formatTime"),r=e("./messages"),i=e("./settings"),a=o.id("comments"),s=o.id("comments-status"),l=o.id("create-comment"),c=/^https:\/\/github\.com\/([a-zA-Z0-9-_]+)\/([a-zA-Z0-9-_]+)\/issues\/([1-9][0-9]*)$/;var u=1,f=0,p="";function m(){a.classList.toggle("display-none",!0),f=0}l.addEventListener("click",function(){window.open(p,"_blank")}),n.hideComments=m,n.loadComments=function(e){if(!1!==i.useComments.getValue()){if(Array.from(a.getElementsByClassName("comment")).forEach(function(e){return e.remove()}),a.classList.toggle("display-none",!1),null===e)return s.innerText=r.COMMENTS_UNAVAILABLE,void l.classList.toggle("display-none",!0);l.classList.toggle("display-none",!1);var t=f=u++,n=function(e){var t=c.exec(e);if(null===t)throw new Error("Bad issue url: "+e+".");return"https://api.github.com/repos/"+t[1]+"/"+t[2]+"/issues/"+t[3]+"/comments"}(p=e);s.innerText=r.COMMENTS_LOADING,fetch(n).then(function(e){return e.json()}).then(function(e){t===f&&(s.innerText=r.COMMENTS_LOADED,e.forEach(function(e){d.isUserBlocked(e.user.login)||a.appendChild(function(e,t,n,o,r,i){var a=document.createElement("div");a.classList.add("comment");var s=document.createElement("img");s.classList.add("avatar"),s.src=e,a.appendChild(s);var l=document.createElement("a");l.classList.add("author"),l.innerText=t,l.target="_blank",l.href=n,a.appendChild(l);var c=document.createElement("div");c.classList.add("time"),c.innerText=o===r?h.formatTime(new Date(o)):h.formatTime(new Date(o))+"（最后修改于 "+h.formatTime(new Date(r))+"）",a.appendChild(c);var u=document.createElement("a");return u.classList.add("block-user"),u.innerText="屏蔽此人",u.onclick=function(){d.blockUser(t),a.remove()},a.appendChild(u),i.split("\n\n").forEach(function(e){var t=document.createElement("p");t.innerText=e,a.appendChild(t)}),a}(e.user.avatar_url,e.user.login,e.user.html_url,e.created_at,e.updated_at,e.body))}))})}else m()}},{"./DOM":4,"./commentBlockControl":16,"./formatTime":20,"./messages":25,"./settings":26}],18:[function(e,t,o){"use strict";Object.defineProperty(o,"__esModule",{value:!0}),o.data=window.DATA,o.relativePathLookUpMap=new Map,function t(n){n.subfolders.forEach(function(e){t(e)}),n.chapters.forEach(function(e,t){o.relativePathLookUpMap.set(e.htmlRelativePath,{folder:n,chapter:e,inFolderIndex:t})})}(o.data.chapterTree)},{}],19:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var r=e("./chapterControl"),i=e("./data"),a=e("./history"),s=e("./state");n.followQuery=function(){var e=decodeURIComponent(window.location.hash.substr(1)),t=i.relativePathLookUpMap.get(e);if(void 0!==t){if(s.state.currentChapter!==t)if("function"!=typeof URLSearchParams)r.loadChapter(e);else{var n=new URLSearchParams(window.location.search).get("selection"),o=null!==n?n.split(",").map(function(e){return+e}):[];4===o.length&&o.every(function(e){return 0<=e&&e%1==0&&!Number.isNaN(e)&&Number.isFinite(e)})?r.loadChapter(e,o):r.loadChapter(e),document.title=a.getTitle()}}else null!==s.state.currentChapter&&(r.closeChapter(),document.title=a.getTitle())}},{"./chapterControl":15,"./data":18,"./history":22,"./state":27}],20:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});n.formatTime=function(e){var t=Date.now()-e.getTime();return 6048e5<t?e.getFullYear()+"/"+(e.getMonth()+1)+"/"+e.getDate():864e5<t?Math.floor(t/864e5)+" 天前":36e5<t?Math.floor(t/36e5)+" 小时前":6e4<t?Math.floor(t/6e4)+" 分钟前":Math.floor(t/1e3)+" 秒前"}},{}],21:[function(e,t,i){"use strict";Object.defineProperty(i,"__esModule",{value:!0});var a,n,o=e("./DebugLogger"),r=e("./Event");(n=a=i.SwipeDirection||(i.SwipeDirection={}))[n.TO_TOP=0]="TO_TOP",n[n.TO_RIGHT=1]="TO_RIGHT",n[n.TO_BOTTOM=2]="TO_BOTTOM",n[n.TO_LEFT=3]="TO_LEFT";i.swipeEvent=new r.Event;var s=0,l=0,c=0;window.addEventListener("touchstart",function(e){1===e.touches.length&&(s=e.touches[0].clientX,l=e.touches[0].clientY,c=Date.now())}),window.addEventListener("touchend",function(e){if(0===e.touches.length&&!(500<Date.now()-c||900<window.innerWidth)){var t=e.changedTouches[0].clientX-s,n=e.changedTouches[0].clientY-l,o=Math.abs(t/window.innerWidth),r=Math.abs(n/window.innerHeight);.17<o&&r<.1?0<t?i.swipeEvent.emit(a.TO_RIGHT):i.swipeEvent.emit(a.TO_LEFT):.1<r&&o<.1&&(0<n?i.swipeEvent.emit(a.TO_BOTTOM):i.swipeEvent.emit(a.TO_TOP))}});var u=new o.DebugLogger("swipeEvent");i.swipeEvent.on(function(e){u.log(a[e])})},{"./DebugLogger":5,"./Event":6}],22:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var r=e("./state");function i(){var e="可穿戴科技";return null!==r.state.currentChapter&&(e+=" - "+r.state.currentChapter.chapter.displayName),e}n.getTitle=i,n.updateHistory=function(e){var t=e?window.history.pushState:window.history.replaceState,n=window.location.pathname;null!==r.state.currentChapter&&(null!==r.state.chapterSelection&&(n+="?selection="+r.state.chapterSelection.join(",")),n+="#"+r.state.currentChapter.chapter.htmlRelativePath);var o=i();document.title=o,t.call(window.history,null,o,n)}},{"./state":27}],23:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var o=e("./data"),r=e("./DOM"),i=e("./followQuery"),a=e("./MainMenu"),s=e("./settings"),l=e("./updateSelection"),c=r.id("warning");null!==c&&c.addEventListener("click",function(){c.style.opacity="0",s.animation.getValue()?c.addEventListener("transitionend",function(){c.remove()}):c.remove()}),r.id("build-number").innerText="Build "+o.data.buildNumber,(new a.MainMenu).setActive(!0),document.addEventListener("selectionchange",function(){l.updateSelection()}),window.addEventListener("popstate",function(){i.followQuery()}),i.followQuery()},{"./DOM":4,"./MainMenu":7,"./data":18,"./followQuery":19,"./settings":26,"./updateSelection":30}],24:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.loadingText="加载中..."},{}],25:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.COMMENTS_UNAVAILABLE="本文评论不可用。",n.COMMENTS_LOADING="评论加载中...",n.COMMENTS_LOADED="以下为本章节的评论区。（您可以在设置中禁用评论）",n.NO_BLOCKED_USERS="没有用户的评论被屏蔽",n.CLICK_TO_UNBLOCK="(点击用户名以解除屏蔽)"},{}],26:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});function r(){}var o=(i.prototype.updateLocalStorage=function(){window.localStorage.setItem(this.key,String(this.value))},i.prototype.getValue=function(){return this.value},i.prototype.setValue=function(e){e!==this.value&&this.onUpdate(e),this.value=e,this.updateLocalStorage()},i.prototype.toggle=function(){this.setValue(!this.value)},i);function i(e,t,n){void 0===n&&(n=r),this.key=e,this.onUpdate=n,this.value=t?"false"!==window.localStorage.getItem(e):"true"===window.localStorage.getItem(e),this.updateLocalStorage(),this.onUpdate(this.value)}n.BooleanSetting=o;var a=(s.prototype.isCorrectValue=function(e){return!(Number.isNaN(e)||e%1!=0||e<0||e>=this.options.length)},s.prototype.correctValue=function(){this.isCorrectValue(this.value)||(this.value=this.defaultValue)},s.prototype.updateLocalStorage=function(){window.localStorage.setItem(this.key,String(this.value))},s.prototype.getValue=function(){return this.value},s.prototype.getValueName=function(){return this.options[this.value]},s.prototype.setValue=function(e){e!==this.value&&this.onUpdate(e,this.options[e]),this.value=e,this.updateLocalStorage()},s);function s(e,t,n,o){if(void 0===o&&(o=r),this.key=e,this.options=t,this.defaultValue=n,this.onUpdate=o,!this.isCorrectValue(n))throw new Error("Default value "+n+" is not correct.");this.value=+(window.localStorage.getItem(e)||n),this.correctValue(),this.onUpdate(this.value,this.options[this.value])}n.EnumSetting=a,n.animation=new o("animation",!0,function(e){document.body.classList.toggle("animation-enabled",e)}),n.warning=new o("warning",!1),n.earlyAccess=new o("earlyAccess",!1,function(e){document.body.classList.toggle("early-access-disabled",!e)}),n.useComments=new o("useComments",!0),n.gestureSwitchChapter=new o("gestureSwitchChapter",!0);var l=['-apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif','Baskerville, Georgia, "Liberation Serif", "Kaiti SC", STKaiti, "AR PL UKai CN", "AR PL UKai HK", "AR PL UKai TW", "AR PL UKai TW MBE", "AR PL KaitiM GB", KaiTi, KaiTi_GB2312, DFKai-SB, "TW-Kai", serif','Georgia, "Nimbus Roman No9 L", "Songti SC", "Noto Serif CJK SC", "Source Han Serif SC", "Source Han Serif CN", STSong, "AR PL New Sung", "AR PL SungtiL GB", NSimSun, SimSun, "TW-Sung", "WenQuanYi Bitmap Song", "AR PL UMing CN", "AR PL UMing HK", "AR PL UMing TW", "AR PL UMing TW MBE", PMingLiU, MingLiU, serif','Baskerville, "Times New Roman", "Liberation Serif", STFangsong, FangSong, FangSong_GB2312, "CWTEX-F", serif'];n.fontFamily=new a("fontFamily",["黑体","楷体","宋体","仿宋"],0,function(e){document.documentElement.style.setProperty("--font-family",l[e])}),n.debugLogging=new o("debugLogging",!1)},{}],27:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.state={currentChapter:null,chapterSelection:null,chapterTextNodes:null}},{}],28:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.stylePreviewArticle="<h1>午饭</h1>\n<p><em>作者：友人♪B</em></p>\n<p>“午饭，午饭♪”</p>\n<p>阳伞下的琳，很是期待今天的午饭。</p>\n<p>或许是体质和别的血族不太一样，琳能够感知到食物的味道，似乎也保有着生物对食物的喜爱。</p>\n<p>虽然她并不能从这些食物中获取能量就是。</p>\n<p>学校食堂的夏季限定甜点今天也很是抢手，这点从队伍的长度就能看出来——队伍险些就要超出食堂的范围了。</p>\n<p>“你说我要有钱多好——”</p>\n<p>已经从隔壁窗口买下了普通，但是很便宜的营养餐的秋镜悬，看着队伍中兴致勃勃的琳。</p>\n<p>其实她并不是缺钱，大约是吝啬。</p>\n<p>这得怪她娘，穷养秋镜悬养习惯了，现在她光自己除灵退魔挣来的外快都够她奢侈上一把了，可却还保留着能不花钱绝对不花，必须花钱越少越好的吝啬习惯。</p>\n<p>少顷，琳已经带着她的甜品建筑——每块砖头都是一块蛋糕，堆成一个诡异的火柴盒——来到了桌前。</p>\n<p>“（吃不胖真好，有钱真好……”</p>\n<p>血族的听觉自然是捕捉到了秋镜悬的嘀咕，琳放下盘子，悄咪咪地将牙贴上了秋镜悬的脖颈。</p>\n<p>“嘻嘻♪”</p>\n<p>“呜——”</p>\n<p>盯——</p>\n<p>秋镜悬看了看盘中剩下的一块毛血旺，似是联系到了什么，将目光转向了琳的牙。</p>\n<p>正在享用蛋糕盛宴的琳以余光瞥见了她的视线，</p>\n<p>“盯着本小姐是要做什么呢？”</p>\n<p>“啊，没，没什么……”</p>\n<p>秋镜悬支支吾吾的说着，</p>\n<p>“就是好奇一个问题，血族为什么不吃毛血旺……”</p>\n<p>“噢☆毛血旺就是那个煮熟的血块是吧？太没有美感了这种血！而且吃了也没法儿恢复能量，简直就是血液的绝佳浪费☆！”</p>\n<p>琳发出了对这样美食的鄙视，不过这种鄙视大约只有血族和蚊子会出现吧……</p>\n<p>“血族需要摄入血，是因为血所具有的生命能量，如果煮熟了的话，超过九成的能量都被转化成其他的东西了，对我们来说实在是没什么用处，还白白浪费了作为原料的血，这种东西本小姐才不吃咧✘！饿死，死外边，从这边跳下去也不吃✘！”</p>\n<p>“欸，别这么说嘛，你能尝得到味道的吧，吃一块试试呗？”</p>\n<p>“真……真香♪”</p>\n<p>当晚，因为触发了真香定律而感到很火大的琳，把秋镜悬丢进了自己的高维空间里头放置了一晚上（高维时间三天）泄愤。</p>"},{}],29:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.thanks=[{name:"神楽坂 立音"},{name:"lgd_小翅膀"},{name:"青葉"},{name:"kn"},{name:"F74nk",link:"https://t.me/F74nk_K"},{name:"杨佳文"},{name:"不知名的N姓人士就好"},{name:"某不愿透露姓名的N性？"},{name:"神楽坂 萌绫"},{name:"Butby"},{name:"友人♪B"},{name:"NekoCaffeine"},{name:"RainSlide"},{name:"czp",link:"https://www.hiczp.com"},{name:"kookxiang"},{name:"櫻川 紗良"},{name:"Skimige"},{name:"TenmaHiltonWhat",link:"https://tenmahw.com"},{name:"路人乙"}].sort(function(){return Math.random()-.5})},{}],30:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var a=e("./history"),s=e("./state");n.updateSelection=function(){if(null!==s.state.chapterTextNodes){var e=String(s.state.chapterSelection),t=document.getSelection();if(null===t)s.state.chapterSelection=null;else{var n=t.anchorNode instanceof HTMLElement?t.anchorNode.firstChild:t.anchorNode,o=s.state.chapterTextNodes.indexOf(n),r=t.focusNode instanceof HTMLElement?t.focusNode.firstChild:t.focusNode,i=s.state.chapterTextNodes.indexOf(r);-1===o||-1===i||o===i&&t.anchorOffset===t.focusOffset?s.state.chapterSelection=null:o<i||o===i&&t.anchorOffset<t.focusOffset?s.state.chapterSelection=[o,t.anchorOffset,i,t.focusOffset]:s.state.chapterSelection=[i,t.focusOffset,o,t.anchorOffset]}e!==String(s.state.chapterSelection)&&a.updateHistory(!1)}}},{"./history":22,"./state":27}]},{},[23]);