!function a(i,l,c){function s(t,e){if(!l[t]){if(!i[t]){var n="function"==typeof require&&require;if(!e&&n)return n(t,!0);if(u)return u(t,!0);var o=new Error("Cannot find module '"+t+"'");throw o.code="MODULE_NOT_FOUND",o}var r=l[t]={exports:{}};i[t][0].call(r.exports,function(e){return s(i[t][1][e]||e)},r,r.exports,a,i,l,c)}return l[t].exports}for(var u="function"==typeof require&&require,e=0;e<c.length;e++)s(c[e]);return s}({1:[function(e,t,n){"use strict";var o,r=this&&this.__extends||(o=function(e,t){return(o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}o(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)}),h=this&&this.__values||function(e){var t="function"==typeof Symbol&&e[Symbol.iterator],n=0;return t?t.call(e):{next:function(){return e&&n>=e.length&&(e=void 0),{value:e&&e[n++],done:!e}}}};Object.defineProperty(n,"__esModule",{value:!0});var m,v=e("./chapterControl"),y=e("./data"),_=e("./history"),a=e("./Menu"),i=(m=a.Menu,r(C,m),C);function C(e,t){var n,o,r,a,i=this;void 0===t&&(t=y.data.chapterTree),i=m.call(this,t.isRoot?"章节选择":t.displayName,e)||this;try{for(var l=h(t.subfolders),c=l.next();!c.done;c=l.next()){var s=c.value;i.addLink(new C(i,s),!0).addClass("folder")}}catch(e){n={error:e}}finally{try{c&&!c.done&&(o=l.return)&&o.call(l)}finally{if(n)throw n.error}}function u(e){var t=d.addItem(e.displayName,{small:!0,button:!0}).onClick(function(){v.loadChapter(e.htmlRelativePath),_.updateHistory(!0)});e.isEarlyAccess&&(t.setInnerText("[编写中] "+e.displayName),t.addClass("early-access"))}var d=this;try{for(var p=h(t.chapters),f=p.next();!f.done;f=p.next()){u(f.value)}}catch(e){r={error:e}}finally{try{f&&!f.done&&(a=p.return)&&a.call(p)}finally{if(r)throw r.error}}return i}n.ChaptersMenu=i},{"./Menu":5,"./chapterControl":12,"./data":14,"./history":17}],2:[function(e,t,n){"use strict";var o,r=this&&this.__extends||(o=function(e,t){return(o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}o(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)});Object.defineProperty(n,"__esModule",{value:!0});var a,i=e("./Menu"),l=(a=i.Menu,r(c,a),c);function c(e){var t=a.call(this,"订阅/讨论组",e)||this;return t.addItem("Telegram 更新推送频道",{small:!0,button:!0,link:"https://t.me/joinchat/AAAAAEpkRVwZ-3s5V3YHjA"}),t.addItem("Telegram 讨论组",{small:!0,button:!0,link:"https://t.me/joinchat/Dt8_WlJnmEwYNbjzlnLyNA"}),t.addItem("GitHub Repo",{small:!0,button:!0,link:"https://github.com/SCLeoX/Wearable-Technology"}),t.addItem("原始 Google Docs",{small:!0,button:!0,link:"https://docs.google.com/document/d/1Pp5CtO8c77DnWGqbXg-3e7w9Q3t88P35FOl6iIJvMfo/edit?usp=sharing"}),t}n.ContactMenu=l},{"./Menu":5}],3:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.id=function(e){return document.getElementById(e)},n.getTextNodes=function e(t,n){for(var o=n||[],r=t.firstChild;null!==r;)r instanceof HTMLElement&&e(r,o),r instanceof Text&&o.push(r),r=r.nextSibling;return o}},{}],4:[function(e,t,n){"use strict";var o,r=this&&this.__extends||(o=function(e,t){return(o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}o(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)});Object.defineProperty(n,"__esModule",{value:!0});var a,i=e("./ChaptersMenu"),l=e("./ContactMenu"),c=e("./Menu"),s=e("./SettingsMenu"),u=e("./StatsMenu"),d=e("./StyleMenu"),p=e("./ThanksMenu"),f=(a=c.Menu,r(h,a),h);function h(){var e=a.call(this,"",null)||this;return e.addLink(new i.ChaptersMenu(e)),e.addLink(new p.ThanksMenu(e)),e.addLink(new d.StyleMenu(e)),e.addLink(new l.ContactMenu(e)),e.addItem("源代码",{button:!0,link:"https://github.com/SCLeoX/Wearable-Technology"}),e.addLink(new s.SettingsMenu(e)),e.addLink(new u.StatsMenu(e)),e}n.MainMenu=f},{"./ChaptersMenu":1,"./ContactMenu":2,"./Menu":5,"./SettingsMenu":7,"./StatsMenu":9,"./StyleMenu":10,"./ThanksMenu":11}],5:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var r,o,a=e("./RectMode");(o=r=n.ItemDecoration||(n.ItemDecoration={}))[o.SELECTABLE=0]="SELECTABLE",o[o.BACK=1]="BACK";var i=(l.prototype.setSelected=function(e){return this.element.classList.toggle("selected",e),this},l.prototype.onClick=function(e){var t=this;return this.element.addEventListener("click",function(){t.menu.isActive()&&e()}),this},l.prototype.linkTo=function(e){var t=this;return this.onClick(function(){t.menu.setActive(!1),e.setActive(!0),a.setRectMode(e.rectMode)}),this},l.prototype.setInnerText=function(e){return this.element.innerText=e,this},l.prototype.addClass=function(e){return this.element.classList.add(e),this},l);function l(e,t){this.menu=e,this.element=t}n.ItemHandle=i;var c=(s.prototype.onActive=function(){},s.prototype.setActive=function(e){!this.active&&e&&this.onActive(),this.active=e,this.container.classList.toggle("hidden",!e)},s.prototype.isActive=function(){return this.active},s.prototype.addItem=function(e,t){var n;return t.button&&void 0!==t.link?((n=document.createElement("a")).href=t.link,n.target="_blank"):n=document.createElement("div"),n.innerText=e,t.small&&n.classList.add("small"),t.button&&(n.classList.add("button"),t.decoration===r.BACK?n.classList.add("back"):t.decoration===r.SELECTABLE&&n.classList.add("selectable")),this.container.appendChild(n),new i(this,n)},s.prototype.addLink=function(e,t){return this.addItem(e.name,{small:t,button:!0}).linkTo(e)},s);function s(e,t,n){if(void 0===n&&(n=a.RectMode.OFF),this.name=e,this.rectMode=n,this.fullPath=null===t?[]:t.fullPath.slice(),""!==e&&this.fullPath.push(e),this.container=document.createElement("div"),this.container.classList.add("menu","hidden"),1<=this.fullPath.length){var o=document.createElement("div");o.classList.add("path"),o.innerText=this.fullPath.join(" > "),this.container.appendChild(o)}null!==t&&this.addItem("返回",{button:!0,decoration:r.BACK}).linkTo(t),document.body.appendChild(this.container)}n.Menu=c},{"./RectMode":6}],6:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var o,r,a=e("./DOM");(r=o=n.RectMode||(n.RectMode={}))[r.SIDE=0]="SIDE",r[r.MAIN=1]="MAIN",r[r.OFF=2]="OFF";var i=a.id("rect"),l=o.OFF;n.setRectMode=function(e){l!==e&&(e===o.OFF?i.classList.remove("reading"):(l===o.MAIN?i.classList.remove("main"):l===o.SIDE?i.classList.remove("side"):(i.classList.remove("main","side"),i.classList.add("reading")),e===o.MAIN?i.classList.add("main"):i.classList.add("side")),l=e)}},{"./DOM":3}],7:[function(e,t,n){"use strict";var o,r=this&&this.__extends||(o=function(e,t){return(o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}o(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)});Object.defineProperty(n,"__esModule",{value:!0});var a,i=e("./Menu"),l=e("./settings"),c=(a=i.Menu,r(s,a),s.prototype.addBooleanSetting=function(e,t){function n(){return e+"："+(t.getValue()?"开":"关")}var o=this.addItem(n(),{small:!0,button:!0}).onClick(function(){t.toggle(),o.setInnerText(n())})},s);function s(e){var t=a.call(this,"设置",e)||this;return t.addBooleanSetting("NSFW 警告",l.warning),t.addBooleanSetting("使用动画",l.animation),t.addBooleanSetting("显示编写中章节",l.earlyAccess),t.addBooleanSetting("显示评论",l.useComments),t}n.SettingsMenu=c},{"./Menu":5,"./settings":21}],8:[function(e,t,n){"use strict";var o,r=this&&this.__extends||(o=function(e,t){return(o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}o(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)}),a=this&&this.__read||function(e,t){var n="function"==typeof Symbol&&e[Symbol.iterator];if(!n)return e;var o,r,a=n.call(e),i=[];try{for(;(void 0===t||0<t--)&&!(o=a.next()).done;)i.push(o.value)}catch(e){r={error:e}}finally{try{o&&!o.done&&(n=a.return)&&n.call(a)}finally{if(r)throw r.error}}return i};Object.defineProperty(n,"__esModule",{value:!0});var i,l=e("./data"),c=e("./Menu"),s=(i=c.Menu,r(u,i),u);function u(e){var r=i.call(this,"关键词统计",e)||this;return r.addItem("添加其他关键词",{small:!0,button:!0,link:"https://github.com/SCLeoX/Wearable-Technology/edit/master/src/builder/keywords.ts"}),l.data.keywordsCount.forEach(function(e){var t=a(e,2),n=t[0],o=t[1];r.addItem(n+"："+o,{small:!0})}),r}n.StatsKeywordsCountMenu=s},{"./Menu":5,"./data":14}],9:[function(e,t,n){"use strict";var o,r=this&&this.__extends||(o=function(e,t){return(o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}o(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)});Object.defineProperty(n,"__esModule",{value:!0});var a,i=e("./data"),l=e("./Menu"),c=e("./StatsKeywordsCountMenu"),s=(a=l.Menu,r(u,a),u);function u(e){var t=a.call(this,"统计",e)||this;return t.addItem("统计数据由构建脚本自动生成",{small:!0}),t.addLink(new c.StatsKeywordsCountMenu(t),!0),t.addItem("总字数："+i.data.charsCount,{small:!0}),t.addItem("总段落数："+i.data.paragraphsCount,{small:!0}),t}n.StatsMenu=s},{"./Menu":5,"./StatsKeywordsCountMenu":8,"./data":14}],10:[function(e,t,n){"use strict";var o,r=this&&this.__extends||(o=function(e,t){return(o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}o(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)}),m=this&&this.__values||function(e){var t="function"==typeof Symbol&&e[Symbol.iterator],n=0;return t?t.call(e):{next:function(){return e&&n>=e.length&&(e=void 0),{value:e&&e[n++],done:!e}}}};Object.defineProperty(n,"__esModule",{value:!0});var a=e("./DOM"),v=e("./Menu"),y=e("./RectMode"),i=e("./stylePreviewArticle"),l=(c.prototype.injectStyleSheet=function(){var e=document.createElement("style");document.head.appendChild(e);var t=e.sheet;t.disabled=!0,t.insertRule(".rect.reading { background-color: "+this.def.rectBgColor+"; }"),t.insertRule(".rect.reading>div { background-color: "+this.def.paperBgColor+"; }"),t.insertRule(".rect.reading>div { color: "+this.def.textColor+"; }"),t.insertRule(".rect.reading>.content a { color: "+this.def.linkColor+"; }"),t.insertRule(".rect.reading>.content a:visited { color: "+this.def.linkColor+"; }"),t.insertRule(".rect.reading>.content a:hover { color: "+this.def.linkHoverColor+"; }"),t.insertRule(".rect.reading>.content a:active { color: "+this.def.linkActiveColor+"; }"),t.insertRule(".rect.reading>.content>.earlyAccess.block { background-color: "+this.def.contentBlockEarlyAccessColor+"; }"),t.insertRule(".rect>.comments>div { background-color: "+this.def.commentColor+"; }"),this.styleSheet=t},c.prototype.active=function(){if(null!==c.currentlyEnabled){var e=c.currentlyEnabled;null!==e.styleSheet&&(e.styleSheet.disabled=!0),e.itemHandle.setSelected(!1)}null===this.styleSheet&&this.injectStyleSheet(),this.styleSheet.disabled=!1,this.itemHandle.setSelected(!0),window.localStorage.setItem("style",this.name),c.currentlyEnabled=this},c.currentlyEnabled=null,c);function c(e,t){this.name=e,this.def=t,this.styleSheet=null}var _,C=[new l("默认",{rectBgColor:"#EFEFED",paperBgColor:"#FFF",textColor:"#000",linkColor:"#00E",linkHoverColor:"#00E",linkActiveColor:"#00C",contentBlockEarlyAccessColor:"#FFE082",commentColor:"#EFEFED"}),new l("夜间",{rectBgColor:"#272B36",paperBgColor:"#38404D",textColor:"#DDD",linkColor:"#55E",linkHoverColor:"#55E",linkActiveColor:"#33C",contentBlockEarlyAccessColor:"#E65100",commentColor:"#272B36"}),new l("羊皮纸",{rectBgColor:"#D8D4C9",paperBgColor:"#F8F4E9",textColor:"#552830",linkColor:"#00E",linkHoverColor:"#00E",linkActiveColor:"#00C",contentBlockEarlyAccessColor:"#FFE082",commentColor:"#D8D4C9"}),new l("可穿戴科技",{rectBgColor:"#444",paperBgColor:"#333",textColor:"#DDD",linkColor:"#66F",linkHoverColor:"#66F",linkActiveColor:"#44D",contentBlockEarlyAccessColor:"#E65100",commentColor:"#444"}),new l("巧克力",{rectBgColor:"#2C1C11",paperBgColor:"#3E2519",textColor:"#CD9F89",linkColor:"#66F",linkHoverColor:"#66F",linkActiveColor:"#44D",contentBlockEarlyAccessColor:"#E65100",commentColor:"#2C1C11"})],s=(_=v.Menu,r(u,_),u.prototype.onActive=function(){a.id("content").innerHTML=i.stylePreviewArticle},u);function u(e){function t(e){e.itemHandle=l.addItem(e.name,{small:!0,button:!0,decoration:v.ItemDecoration.SELECTABLE}).onClick(function(){e.active()})}var n,o,r,a,i=_.call(this,"阅读器样式",e,y.RectMode.SIDE)||this,l=this;try{for(var c=m(C),s=c.next();!s.done;s=c.next()){t(h=s.value)}}catch(e){n={error:e}}finally{try{s&&!s.done&&(o=c.return)&&o.call(c)}finally{if(n)throw n.error}}var u=window.localStorage.getItem("style"),d=!1;try{for(var p=m(C),f=p.next();!f.done;f=p.next()){var h;if(u===(h=f.value).name){h.active(),d=!0;break}}}catch(e){r={error:e}}finally{try{f&&!f.done&&(a=p.return)&&a.call(p)}finally{if(r)throw r.error}}return d||C[0].active(),i}n.StyleMenu=s},{"./DOM":3,"./Menu":5,"./RectMode":6,"./stylePreviewArticle":23}],11:[function(e,t,n){"use strict";var o,r=this&&this.__extends||(o=function(e,t){return(o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}o(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)}),l=this&&this.__values||function(e){var t="function"==typeof Symbol&&e[Symbol.iterator],n=0;return t?t.call(e):{next:function(){return e&&n>=e.length&&(e=void 0),{value:e&&e[n++],done:!e}}}};Object.defineProperty(n,"__esModule",{value:!0});var c,a=e("./Menu"),s=e("./thanks"),i=(c=a.Menu,r(u,c),u);function u(e){var t,n,o=c.call(this,"鸣谢列表",e)||this;try{for(var r=l(s.thanks),a=r.next();!a.done;a=r.next()){var i=a.value;o.addItem(i.name,void 0===i.link?{small:!0}:{small:!0,button:!0,link:i.link})}}catch(e){t={error:e}}finally{try{a&&!a.done&&(n=r.return)&&n.call(r)}finally{if(t)throw t.error}}return o}n.ThanksMenu=i},{"./Menu":5,"./thanks":24}],12:[function(e,t,n){"use strict";var s=this&&this.__read||function(e,t){var n="function"==typeof Symbol&&e[Symbol.iterator];if(!n)return e;var o,r,a=n.call(e),i=[];try{for(;(void 0===t||0<t--)&&!(o=a.next()).done;)i.push(o.value)}catch(e){r={error:e}}finally{try{o&&!o.done&&(n=a.return)&&n.call(a)}finally{if(r)throw r.error}}return i};Object.defineProperty(n,"__esModule",{value:!0});var u=e("./commentsControl"),r=e("./data"),d=e("./DOM"),p=e("./history"),a=e("./loadingText"),i=e("./RectMode"),o=e("./settings"),f=e("./state"),h=d.id("content"),l=new Map;function m(){i.setRectMode(i.RectMode.OFF),f.state.currentChapter=null,f.state.chapterSelection=null,f.state.chapterTextNodes=null}n.closeChapter=m;function v(e){var t=s(e,4),n=t[0],o=t[1],r=t[2],a=t[3];if(null!==f.state.chapterTextNodes){var i=f.state.chapterTextNodes[n],l=f.state.chapterTextNodes[r];if(void 0!==i&&void 0!==l){document.getSelection().setBaseAndExtent(i,o,l,a);var c=i.parentElement;null!==c&&"function"==typeof c.scrollIntoView&&c.scrollIntoView()}}}function y(){var e=document.createElement("span");return e.style.flex="1",e}function _(e){return o.earlyAccess.getValue()||!e.isEarlyAccess}var c=function(e){f.state.chapterTextNodes=d.getTextNodes(h),void 0!==e&&(null===d.id("warning")?v(e):d.id("warning").addEventListener("click",function(){v(e)}));var t=f.state.currentChapter,n=t.inFolderIndex;if(t.chapter.isEarlyAccess){var o=function(e,t,n){var o=document.createElement("div");o.classList.add("block",e);var r=document.createElement("h1");r.innerText=t,o.appendChild(r);var a=document.createElement("p");return a.innerText=n,o.appendChild(a),o}("earlyAccess","编写中章节","请注意，本文正在编写中，因此可能会含有未完成的句子或是尚未更新的信息。");h.prepend(o)}var r=document.createElement("div");if(r.style.display="flex",1<=n&&_(t.folder.chapters[n-1])){var a=t.folder.chapters[n-1].htmlRelativePath,i=document.createElement("a");i.innerText="上一章",i.href=window.location.pathname+"?chapter="+a,i.style.textAlign="left",i.style.flex="1",i.addEventListener("click",function(e){e.preventDefault(),C(a),p.updateHistory(!0)}),r.appendChild(i)}else r.appendChild(y());var l=document.createElement("a");if(l.innerText="返回菜单",l.href=window.location.pathname,l.style.textAlign="center",l.style.flex="1",l.addEventListener("click",function(e){e.preventDefault(),m(),p.updateHistory(!0)}),r.appendChild(l),n<t.folder.chapters.length-1&&_(t.folder.chapters[n+1])){var c=t.folder.chapters[n+1].htmlRelativePath,s=document.createElement("a");s.innerText="下一章",s.href=window.location.pathname+"?chapter="+c,s.style.textAlign="right",s.style.flex="1",s.addEventListener("click",function(e){e.preventDefault(),C(c),p.updateHistory(!0)}),r.appendChild(s)}else r.appendChild(y());h.appendChild(r),u.loadComments(t.chapter.commentsUrl),d.id("rect").style.overflow="hidden",setTimeout(function(){d.id("rect").style.overflow=null,void 0===e&&d.id("rect").scrollTo(0,0)},1)};function C(t,n){i.setRectMode(i.RectMode.MAIN);var o=r.relativePathLookUpMap.get(t);return f.state.currentChapter=o,l.has(t)?null===l.get(t)?h.innerText=a.loadingText:(h.innerHTML=l.get(t),c(n)):(h.innerText=a.loadingText,fetch("./chapters/"+t).then(function(e){return e.text()}).then(function(e){l.set(t,e),o===f.state.currentChapter&&(h.innerHTML=e,c(n))})),!0}n.loadChapter=C},{"./DOM":3,"./RectMode":6,"./commentsControl":13,"./data":14,"./history":17,"./loadingText":19,"./settings":21,"./state":22}],13:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var o=e("./DOM"),u=e("./formatTime"),r=e("./messages"),a=e("./settings"),i=o.id("comments"),l=o.id("comments-status"),c=o.id("create-comment"),s=/^https:\/\/github\.com\/([a-zA-Z0-9-_]+)\/([a-zA-Z0-9-_]+)\/issues\/([1-9][0-9]*)$/;var d=1,p=0,f="";function h(){i.classList.toggle("display-none",!0),p=0}c.addEventListener("click",function(){window.open(f,"_blank")}),n.hideComments=h,n.loadComments=function(e){if(!1!==a.useComments.getValue()){if(Array.from(i.getElementsByClassName("comment")).forEach(function(e){return e.remove()}),i.classList.toggle("display-none",!1),null===e)return l.innerText=r.COMMENTS_UNAVAILABLE,void c.classList.toggle("display-none",!0);c.classList.toggle("display-none",!1);var t=p=d++,n=function(e){var t=s.exec(e);if(null===t)throw new Error("Bad issue url: "+e+".");return"https://api.github.com/repos/"+t[1]+"/"+t[2]+"/issues/"+t[3]+"/comments"}(f=e);l.innerText=r.COMMENTS_LOADING,fetch(n).then(function(e){return e.json()}).then(function(e){t===p&&(l.innerText=r.COMMENTS_LOADED,e.forEach(function(e){i.appendChild(function(e,t,n,o,r,a){var i=document.createElement("div");i.classList.add("comment");var l=document.createElement("img");l.classList.add("avatar"),l.src=e,i.appendChild(l);var c=document.createElement("a");c.classList.add("author"),c.innerText=t,c.target="_blank",c.href=n,i.appendChild(c);var s=document.createElement("div");return s.classList.add("time"),s.innerText=o===r?u.formatTime(new Date(o)):u.formatTime(new Date(o))+"（最后修改于 "+u.formatTime(new Date(r))+"）",i.appendChild(s),a.split("\n\n").forEach(function(e){var t=document.createElement("p");t.innerText=e,i.appendChild(t)}),i}(e.user.avatar_url,e.user.login,e.user.html_url,e.created_at,e.updated_at,e.body))}))})}else h()}},{"./DOM":3,"./formatTime":16,"./messages":20,"./settings":21}],14:[function(e,t,o){"use strict";Object.defineProperty(o,"__esModule",{value:!0}),o.data=window.DATA,o.relativePathLookUpMap=new Map,function t(n){n.subfolders.forEach(function(e){t(e)}),n.chapters.forEach(function(e,t){o.relativePathLookUpMap.set(e.htmlRelativePath,{folder:n,chapter:e,inFolderIndex:t})})}(o.data.chapterTree)},{}],15:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var r=e("./chapterControl"),a=e("./data"),i=e("./history"),l=e("./state");n.followQuery=function(){var e=decodeURIComponent(window.location.hash.substr(1)),t=a.relativePathLookUpMap.get(e);if(void 0!==t){if(l.state.currentChapter!==t)if("function"!=typeof URLSearchParams)r.loadChapter(e);else{var n=new URLSearchParams(window.location.search).get("selection"),o=null!==n?n.split(",").map(function(e){return+e}):[];4===o.length&&o.every(function(e){return 0<=e&&e%1==0&&!Number.isNaN(e)&&Number.isFinite(e)})?r.loadChapter(e,o):r.loadChapter(e),document.title=i.getTitle()}}else null!==l.state.currentChapter&&(r.closeChapter(),document.title=i.getTitle())}},{"./chapterControl":12,"./data":14,"./history":17,"./state":22}],16:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});n.formatTime=function(e){var t=Date.now()-e.getTime();return 6048e5<t?e.getFullYear()+"/"+(e.getMonth()+1)+"/"+e.getDate():864e5<t?Math.floor(t/864e5)+" 天前":36e5<t?Math.floor(t/36e5)+" 小时前":6e4<t?Math.floor(t/6e4)+" 分钟前":Math.floor(t/1e3)+" 秒前"}},{}],17:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var r=e("./state");function a(){var e="可穿戴科技";return null!==r.state.currentChapter&&(e+=" - "+r.state.currentChapter.chapter.displayName),e}n.getTitle=a,n.updateHistory=function(e){var t=e?window.history.pushState:window.history.replaceState,n=window.location.pathname;null!==r.state.currentChapter&&(null!==r.state.chapterSelection&&(n+="?selection="+r.state.chapterSelection.join(",")),n+="#"+r.state.currentChapter.chapter.htmlRelativePath);var o=a();document.title=o,t.call(window.history,null,o,n)}},{"./state":22}],18:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var o=e("./data"),r=e("./DOM"),a=e("./followQuery"),i=e("./MainMenu"),l=e("./settings"),c=e("./updateSelection"),s=r.id("warning");null!==s&&s.addEventListener("click",function(){s.style.opacity="0",l.animation.getValue()?s.addEventListener("transitionend",function(){s.remove()}):s.remove()}),r.id("build-number").innerText="Build "+o.data.buildNumber,(new i.MainMenu).setActive(!0),document.addEventListener("selectionchange",function(){c.updateSelection()}),window.addEventListener("popstate",function(){a.followQuery()}),a.followQuery()},{"./DOM":3,"./MainMenu":4,"./data":14,"./followQuery":15,"./settings":21,"./updateSelection":25}],19:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.loadingText="加载中..."},{}],20:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.COMMENTS_UNAVAILABLE="本文评论不可用。",n.COMMENTS_LOADING="评论加载中...",n.COMMENTS_LOADED="以下为本章节的评论区。（您可以在设置中禁用评论）"},{}],21:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});function o(){}var r=(a.prototype.updateLocalStorage=function(){window.localStorage.setItem(this.key,String(this.value))},a.prototype.getValue=function(){return this.value},a.prototype.setValue=function(e){e!==this.value&&this.onUpdate(e),this.value=e,this.updateLocalStorage()},a.prototype.toggle=function(){this.setValue(!this.value)},a);function a(e,t,n){void 0===n&&(n=o),this.key=e,this.onUpdate=n,this.value=t?"false"!==window.localStorage.getItem(e):"true"===window.localStorage.getItem(e),this.updateLocalStorage(),this.onUpdate(this.value)}n.BooleanSetting=r,n.animation=new r("animation",!0,function(e){document.body.classList.toggle("animation-enabled",e)}),n.warning=new r("warning",!1),n.earlyAccess=new r("earlyAccess",!1,function(e){document.body.classList.toggle("early-access-disabled",!e)}),n.useComments=new r("useComments",!0)},{}],22:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.state={currentChapter:null,chapterSelection:null,chapterTextNodes:null}},{}],23:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.stylePreviewArticle="<h1>午饭</h1>\n<p><em>作者：友人♪B</em></p>\n<p>“午饭，午饭♪”</p>\n<p>阳伞下的琳，很是期待今天的午饭。</p>\n<p>或许是体质和别的血族不太一样，琳能够感知到食物的味道，似乎也保有着生物对食物的喜爱。</p>\n<p>虽然她并不能从这些食物中获取能量就是。</p>\n<p>学校食堂的夏季限定甜点今天也很是抢手，这点从队伍的长度就能看出来——队伍险些就要超出食堂的范围了。</p>\n<p>“你说我要有钱多好——”</p>\n<p>已经从隔壁窗口买下了普通，但是很便宜的营养餐的秋镜悬，看着队伍中兴致勃勃的琳。</p>\n<p>其实她并不是缺钱，大约是吝啬。</p>\n<p>这得怪她娘，穷养秋镜悬养习惯了，现在她光自己除灵退魔挣来的外快都够她奢侈上一把了，可却还保留着能不花钱绝对不花，必须花钱越少越好的吝啬习惯。</p>\n<p>少顷，琳已经带着她的甜品建筑——每块砖头都是一块蛋糕，堆成一个诡异的火柴盒——来到了桌前。</p>\n<p>“（吃不胖真好，有钱真好……”</p>\n<p>血族的听觉自然是捕捉到了秋镜悬的嘀咕，琳放下盘子，悄咪咪地将牙贴上了秋镜悬的脖颈。</p>\n<p>“嘻嘻♪”</p>\n<p>“呜——”</p>\n<p>盯——</p>\n<p>秋镜悬看了看盘中剩下的一块毛血旺，似是联系到了什么，将目光转向了琳的牙。</p>\n<p>正在享用蛋糕盛宴的琳以余光瞥见了她的视线，</p>\n<p>“盯着本小姐是要做什么呢？”</p>\n<p>“啊，没，没什么……”</p>\n<p>秋镜悬支支吾吾的说着，</p>\n<p>“就是好奇一个问题，血族为什么不吃毛血旺……”</p>\n<p>“噢☆毛血旺就是那个煮熟的血块是吧？太没有美感了这种血！而且吃了也没法儿恢复能量，简直就是血液的绝佳浪费☆！”</p>\n<p>琳发出了对这样美食的鄙视，不过这种鄙视大约只有血族和蚊子会出现吧……</p>\n<p>“血族需要摄入血，是因为血所具有的生命能量，如果煮熟了的话，超过九成的能量都被转化成其他的东西了，对我们来说实在是没什么用处，还白白浪费了作为原料的血，这种东西本小姐才不吃咧✘！饿死，死外边，从这边跳下去也不吃✘！”</p>\n<p>“欸，别这么说嘛，你能尝得到味道的吧，吃一块试试呗？”</p>\n<p>“真……真香♪”</p>\n<p>当晚，因为触发了真香定律而感到很火大的琳，把秋镜悬丢进了自己的高维空间里头放置了一晚上（高维时间三天）泄愤。</p>"},{}],24:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.thanks=[{name:"神楽坂 立音"},{name:"lgd_小翅膀"},{name:"青葉"},{name:"kn"},{name:"F74nk",link:"https://t.me/F74nk_K"},{name:"杨佳文"},{name:"不知名的N姓人士就好"},{name:"某不愿透露姓名的N性？"},{name:"神楽坂 萌绫"},{name:"Butby"},{name:"友人♪B"},{name:"NekoCaffeine"},{name:"RainSlide"},{name:"czp",link:"https://www.hiczp.com"},{name:"kookxiang"},{name:"櫻川 紗良"},{name:"Skimige"}].sort(function(){return Math.random()-.5})},{}],25:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var i=e("./history"),l=e("./state");n.updateSelection=function(){if(null!==l.state.chapterTextNodes){var e=String(l.state.chapterSelection),t=document.getSelection();if(null===t)l.state.chapterSelection=null;else{var n=t.anchorNode instanceof HTMLElement?t.anchorNode.firstChild:t.anchorNode,o=l.state.chapterTextNodes.indexOf(n),r=t.focusNode instanceof HTMLElement?t.focusNode.firstChild:t.focusNode,a=l.state.chapterTextNodes.indexOf(r);-1===o||-1===a||o===a&&t.anchorOffset===t.focusOffset?l.state.chapterSelection=null:o<a||o===a&&t.anchorOffset<t.focusOffset?l.state.chapterSelection=[o,t.anchorOffset,a,t.focusOffset]:l.state.chapterSelection=[a,t.focusOffset,o,t.anchorOffset]}e!==String(l.state.chapterSelection)&&i.updateHistory(!1)}}},{"./history":17,"./state":22}]},{},[18]);