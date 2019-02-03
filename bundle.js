!function i(a,l,c){function s(e,t){if(!l[e]){if(!a[e]){var n="function"==typeof require&&require;if(!t&&n)return n(e,!0);if(u)return u(e,!0);var o=new Error("Cannot find module '"+e+"'");throw o.code="MODULE_NOT_FOUND",o}var r=l[e]={exports:{}};a[e][0].call(r.exports,function(t){return s(a[e][1][t]||t)},r,r.exports,i,a,l,c)}return l[e].exports}for(var u="function"==typeof require&&require,t=0;t<c.length;t++)s(c[t]);return s}({1:[function(t,e,n){"use strict";var o,r=this&&this.__extends||(o=function(t,e){return(o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n])})(t,e)},function(t,e){function n(){this.constructor=t}o(t,e),t.prototype=null===e?Object.create(e):(n.prototype=e.prototype,new n)}),s=this&&this.__values||function(t){var e="function"==typeof Symbol&&t[Symbol.iterator],n=0;return e?e.call(t):{next:function(){return t&&n>=t.length&&(t=void 0),{value:t&&t[n++],done:!t}}}};Object.defineProperty(n,"__esModule",{value:!0});var u=t("./chapterControl"),d=t("./data"),p=t("./history"),i=function(c){function t(t){var e,n,o=c.call(this,"章节选择",t)||this,r=function(t){i.addItem("章节 "+t,{small:!0,button:!0}).onClick(function(){u.loadChapter(t),p.updateHistory(!0)})},i=this;try{for(var a=s(d.data.chapters),l=a.next();!l.done;l=a.next()){r(l.value)}}catch(t){e={error:t}}finally{try{l&&!l.done&&(n=a.return)&&n.call(a)}finally{if(e)throw e.error}}return o}return r(t,c),t}(t("./Menu").Menu);n.ChaptersMenu=i},{"./Menu":5,"./chapterControl":11,"./data":12,"./history":14}],2:[function(t,e,n){"use strict";var o,r=this&&this.__extends||(o=function(t,e){return(o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n])})(t,e)},function(t,e){function n(){this.constructor=t}o(t,e),t.prototype=null===e?Object.create(e):(n.prototype=e.prototype,new n)});Object.defineProperty(n,"__esModule",{value:!0});var i=function(n){function t(t){var e=n.call(this,"订阅/讨论组",t)||this;return e.addItem("Telegram 更新推送频道",{small:!0,button:!0,link:"https://t.me/joinchat/AAAAAEpkRVwZ-3s5V3YHjA"}),e.addItem("Telegram 讨论组",{small:!0,button:!0,link:"https://t.me/joinchat/Dt8_WlJnmEwYNbjzlnLyNA"}),e.addItem("GitHub Repo",{small:!0,button:!0,link:"https://github.com/SCLeoX/Wearable-Technology"}),e.addItem("原始 Google Docs",{small:!0,button:!0,link:"https://docs.google.com/document/d/1Pp5CtO8c77DnWGqbXg-3e7w9Q3t88P35FOl6iIJvMfo/edit?usp=sharing"}),e}return r(t,n),t}(t("./Menu").Menu);n.ContactMenu=i},{"./Menu":5}],3:[function(t,e,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.id=function(t){return document.getElementById(t)},n.getTextNodes=function t(e,n){for(var o=n||[],r=e.firstChild;null!==r;)r instanceof HTMLElement&&t(r,o),r instanceof Text&&o.push(r),r=r.nextSibling;return o}},{}],4:[function(t,e,n){"use strict";var o,r=this&&this.__extends||(o=function(t,e){return(o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n])})(t,e)},function(t,e){function n(){this.constructor=t}o(t,e),t.prototype=null===e?Object.create(e):(n.prototype=e.prototype,new n)});Object.defineProperty(n,"__esModule",{value:!0});var i=t("./ChaptersMenu"),a=t("./ContactMenu"),l=t("./Menu"),c=t("./SettingsMenu"),s=t("./StatsMenu"),u=t("./StyleMenu"),d=t("./ThanksMenu"),p=function(e){function t(){var t=e.call(this,"",null)||this;return t.addLink(new i.ChaptersMenu(t)),t.addLink(new d.ThanksMenu(t)),t.addLink(new u.StyleMenu(t)),t.addLink(new a.ContactMenu(t)),t.addLink(new c.SettingsMenu(t)),t.addLink(new s.StatsMenu(t)),t}return r(t,e),t}(l.Menu);n.MainMenu=p},{"./ChaptersMenu":1,"./ContactMenu":2,"./Menu":5,"./SettingsMenu":7,"./StatsMenu":8,"./StyleMenu":9,"./ThanksMenu":10}],5:[function(t,e,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var o,r,i=t("./RectMode");(r=o=n.ItemDecoration||(n.ItemDecoration={}))[r.SELECTABLE=0]="SELECTABLE",r[r.BACK=1]="BACK";var a=function(){function t(t,e){this.menu=t,this.element=e}return t.prototype.setSelected=function(t){return this.element.classList.toggle("selected",t),this},t.prototype.onClick=function(t){var e=this;return this.element.addEventListener("click",function(){e.menu.isActive()&&t()}),this},t.prototype.linkTo=function(t){var e=this;return this.onClick(function(){e.menu.setActive(!1),t.setActive(!0),i.setRectMode(t.rectMode)}),this},t.prototype.setInnerText=function(t){return this.element.innerText=t,this},t}();n.ItemHandle=a;var l=function(){function t(t,e,n){void 0===n&&(n=i.RectMode.OFF),this.name=t,this.rectMode=n,this.container=document.createElement("div"),this.container.classList.add("menu","hidden"),null!==e&&this.addItem("返回",{button:!0,decoration:o.BACK}).linkTo(e),document.body.appendChild(this.container)}return t.prototype.onActive=function(){},t.prototype.setActive=function(t){!this.active&&t&&this.onActive(),this.active=t,this.container.classList.toggle("hidden",!t)},t.prototype.isActive=function(){return this.active},t.prototype.addItem=function(t,e){var n;return e.button&&void 0!==e.link?((n=document.createElement("a")).href=e.link,n.target="_blank"):n=document.createElement("div"),n.innerText=t,e.small&&n.classList.add("small"),e.button&&(n.classList.add("button"),e.decoration===o.BACK?n.classList.add("back"):e.decoration===o.SELECTABLE&&n.classList.add("selectable")),this.container.appendChild(n),new a(this,n)},t.prototype.addLink=function(t,e){this.addItem(t.name,{small:e,button:!0}).linkTo(t)},t}();n.Menu=l},{"./RectMode":6}],6:[function(t,e,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var o,r,i=t("./DOM");(r=o=n.RectMode||(n.RectMode={}))[r.SIDE=0]="SIDE",r[r.MAIN=1]="MAIN",r[r.OFF=2]="OFF";var a=i.id("rect"),l=o.OFF;n.setRectMode=function(t){l!==t&&(t===o.OFF?a.classList.remove("reading"):(l===o.MAIN?a.classList.remove("main"):l===o.SIDE?a.classList.remove("side"):(a.classList.remove("main","side"),a.classList.add("reading")),t===o.MAIN?a.classList.add("main"):a.classList.add("side")),l=t)}},{"./DOM":3}],7:[function(t,e,n){"use strict";var o,r=this&&this.__extends||(o=function(t,e){return(o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n])})(t,e)},function(t,e){function n(){this.constructor=t}o(t,e),t.prototype=null===e?Object.create(e):(n.prototype=e.prototype,new n)});Object.defineProperty(n,"__esModule",{value:!0});var i=t("./Menu"),a=t("./settings"),l=function(n){function t(t){var e=n.call(this,"设置",t)||this;return e.addBooleanSetting("NSFW 警告",a.warning),e.addBooleanSetting("使用动画",a.animation),e}return r(t,n),t.prototype.addBooleanSetting=function(t,e){var n=function(){return t+"："+(e.getValue()?"开":"关")},o=this.addItem(n(),{small:!0,button:!0}).onClick(function(){e.toggle(),o.setInnerText(n())})},t}(i.Menu);n.SettingsMenu=l},{"./Menu":5,"./settings":17}],8:[function(t,e,n){"use strict";var o,r=this&&this.__extends||(o=function(t,e){return(o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n])})(t,e)},function(t,e){function n(){this.constructor=t}o(t,e),t.prototype=null===e?Object.create(e):(n.prototype=e.prototype,new n)});Object.defineProperty(n,"__esModule",{value:!0});var i=t("./data"),a=function(n){function t(t){var e=n.call(this,"统计",t)||this;return e.addItem("统计数据由构建脚本自动生成",{small:!0}),e.addItem("总字数："+i.data.charsCount,{small:!0}),e.addItem("总段落数："+i.data.paragraphsCount,{small:!0}),e}return r(t,n),t}(t("./Menu").Menu);n.StatsMenu=a},{"./Menu":5,"./data":12}],9:[function(t,e,n){"use strict";var o,r=this&&this.__extends||(o=function(t,e){return(o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n])})(t,e)},function(t,e){function n(){this.constructor=t}o(t,e),t.prototype=null===e?Object.create(e):(n.prototype=e.prototype,new n)}),y=this&&this.__values||function(t){var e="function"==typeof Symbol&&t[Symbol.iterator],n=0;return e?e.call(t):{next:function(){return t&&n>=t.length&&(t=void 0),{value:t&&t[n++],done:!t}}}};Object.defineProperty(n,"__esModule",{value:!0});var i=t("./DOM"),m=t("./Menu"),_=t("./RectMode"),a=t("./stylePreviewArticle"),l=function(){function e(t,e){this.name=t,this.def=e,this.styleSheet=null}return e.prototype.injectStyleSheet=function(){var t=document.createElement("style");document.head.appendChild(t);var e=t.sheet;e.disabled=!0,e.insertRule(".rect.reading { background-color: "+this.def.rectBgColor+"; }"),e.insertRule(".rect.reading>.content { background-color: "+this.def.paperBgColor+"; }"),e.insertRule(".rect.reading>.content { color: "+this.def.textColor+"; }"),e.insertRule(".rect.reading>.content a { color: "+this.def.linkColor+"; }"),e.insertRule(".rect.reading>.content a:visited { color: "+this.def.linkColor+"; }"),e.insertRule(".rect.reading>.content a:hover { color: "+this.def.linkHoverColor+"; }"),e.insertRule(".rect.reading>.content a:active { color: "+this.def.linkActiveColor+"; }"),this.styleSheet=e},e.prototype.active=function(){if(null!==e.currentlyEnabled){var t=e.currentlyEnabled;null!==t.styleSheet&&(t.styleSheet.disabled=!0),t.itemHandle.setSelected(!1)}null===this.styleSheet&&this.injectStyleSheet(),this.styleSheet.disabled=!1,this.itemHandle.setSelected(!0),window.localStorage.setItem("style",this.name),e.currentlyEnabled=this},e.currentlyEnabled=null,e}(),M=[new l("默认",{rectBgColor:"#EFEFED",paperBgColor:"#FFF",textColor:"#000",linkColor:"#00E",linkHoverColor:"#00E",linkActiveColor:"#00C"}),new l("夜间",{rectBgColor:"#272B36",paperBgColor:"#38404D",textColor:"#DDD",linkColor:"#55E",linkHoverColor:"#55E",linkActiveColor:"#33C"}),new l("羊皮纸",{rectBgColor:"#D8D4C9",paperBgColor:"#F8F4E9",textColor:"#552830",linkColor:"#00E",linkHoverColor:"#00E",linkActiveColor:"#00C"}),new l("可穿戴科技",{rectBgColor:"#444",paperBgColor:"#333",textColor:"#DDD",linkColor:"#66F",linkHoverColor:"#66F",linkActiveColor:"#44D"}),new l("巧克力",{rectBgColor:"#2C1C11",paperBgColor:"#3E2519",textColor:"#CD9F89",linkColor:"#66F",linkHoverColor:"#66F",linkActiveColor:"#44D"})],c=function(v){function t(t){var e,n,o,r,i=v.call(this,"编辑器样式",t,_.RectMode.SIDE)||this,a=function(t){t.itemHandle=l.addItem(t.name,{small:!0,button:!0,decoration:m.ItemDecoration.SELECTABLE}).onClick(function(){t.active()})},l=this;try{for(var c=y(M),s=c.next();!s.done;s=c.next()){a(h=s.value)}}catch(t){e={error:t}}finally{try{s&&!s.done&&(n=c.return)&&n.call(c)}finally{if(e)throw e.error}}var u=window.localStorage.getItem("style"),d=!1;try{for(var p=y(M),f=p.next();!f.done;f=p.next()){var h;if(u===(h=f.value).name){h.active(),d=!0;break}}}catch(t){o={error:t}}finally{try{f&&!f.done&&(r=p.return)&&r.call(p)}finally{if(o)throw o.error}}return d||M[0].active(),i}return r(t,v),t.prototype.onActive=function(){i.id("content").innerHTML=a.stylePreviewArticle},t}(m.Menu);n.StyleMenu=c},{"./DOM":3,"./Menu":5,"./RectMode":6,"./stylePreviewArticle":19}],10:[function(t,e,n){"use strict";var o,r=this&&this.__extends||(o=function(t,e){return(o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n])})(t,e)},function(t,e){function n(){this.constructor=t}o(t,e),t.prototype=null===e?Object.create(e):(n.prototype=e.prototype,new n)}),c=this&&this.__values||function(t){var e="function"==typeof Symbol&&t[Symbol.iterator],n=0;return e?e.call(t):{next:function(){return t&&n>=t.length&&(t=void 0),{value:t&&t[n++],done:!t}}}};Object.defineProperty(n,"__esModule",{value:!0});var i=t("./Menu"),s=t("./thanks"),a=function(l){function t(t){var e,n,o=l.call(this,"鸣谢列表",t)||this;try{for(var r=c(s.thanks),i=r.next();!i.done;i=r.next()){var a=i.value;o.addItem(a.name,void 0===a.link?{small:!0}:{small:!0,button:!0,link:a.link})}}catch(t){e={error:t}}finally{try{i&&!i.done&&(n=r.return)&&n.call(r)}finally{if(e)throw e.error}}return o}return r(t,l),t}(i.Menu);n.ThanksMenu=a},{"./Menu":5,"./thanks":20}],11:[function(t,e,n){"use strict";var s=this&&this.__read||function(t,e){var n="function"==typeof Symbol&&t[Symbol.iterator];if(!n)return t;var o,r,i=n.call(t),a=[];try{for(;(void 0===e||0<e--)&&!(o=i.next()).done;)a.push(o.value)}catch(t){r={error:t}}finally{try{o&&!o.done&&(n=i.return)&&n.call(i)}finally{if(r)throw r.error}}return a};Object.defineProperty(n,"__esModule",{value:!0});var c=t("./data"),u=t("./DOM"),d=t("./history"),o=t("./loadingText"),r=t("./RectMode"),p=t("./state"),f=u.id("content"),i=new Map;function h(){r.setRectMode(r.RectMode.OFF),p.state.currentChapter=null,p.state.chapterSelection=null,p.state.chapterTextNodes=null}n.closeChapter=h;var v=function(){var t=document.createElement("span");return t.style.flex="1",t},a=function(t){p.state.chapterTextNodes=u.getTextNodes(f),void 0!==t&&function(t){var e=s(t,4),n=e[0],o=e[1],r=e[2],i=e[3];if(null!==p.state.chapterTextNodes){var a=p.state.chapterTextNodes[n],l=p.state.chapterTextNodes[r];if(void 0!==a&&void 0!==l){document.getSelection().setBaseAndExtent(a,o,l,i);var c=a.parentElement;null!==c&&"function"==typeof c.scrollIntoView&&c.scrollIntoView()}}}(t);var e=c.data.chapters.indexOf(p.state.currentChapter),n=document.createElement("div");if(n.style.display="flex",-1!==e&&0!==e){var o=c.data.chapters[e-1],r=document.createElement("a");r.innerText="上一章",r.href=window.location.pathname+"?chapter="+o,r.style.textAlign="left",r.style.flex="1",r.addEventListener("click",function(t){t.preventDefault(),y(o),d.updateHistory(!0)}),n.appendChild(r)}else n.appendChild(v());var i=document.createElement("a");if(i.innerText="返回菜单",i.href=window.location.pathname,i.style.textAlign="center",i.style.flex="1",i.addEventListener("click",function(t){t.preventDefault(),h(),d.updateHistory(!0)}),n.appendChild(i),-1!==e&&e<c.data.chapters.length-1){var a=c.data.chapters[e+1],l=document.createElement("a");l.innerText="下一章",l.href=window.location.pathname+"?chapter="+a,l.style.textAlign="right",l.style.flex="1",l.addEventListener("click",function(t){t.preventDefault(),y(a),d.updateHistory(!0)}),n.appendChild(l)}else n.appendChild(v());f.appendChild(n)};function y(e,n){return r.setRectMode(r.RectMode.MAIN),p.state.currentChapter=e,i.has(e)?null===i.get(e)?f.innerText=o.loadingText:(f.innerHTML=i.get(e),a(n)):(f.innerText=o.loadingText,fetch("./chapters/"+e+".html").then(function(t){return t.text()}).then(function(t){i.set(e,t),e===p.state.currentChapter&&(f.innerHTML=t,a(n))})),!0}n.loadChapter=y},{"./DOM":3,"./RectMode":6,"./data":12,"./history":14,"./loadingText":16,"./state":18}],12:[function(t,e,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.data=window.DATA},{}],13:[function(t,e,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var r=t("./chapterControl"),i=t("./history"),a=t("./state");n.followQuery=function(){if("function"==typeof URLSearchParams){var t=new URLSearchParams(window.location.search),e=t.get("chapter");if(null!==e){if(a.state.currentChapter!==e){var n=t.get("selection"),o=null!==n?n.split(",").map(function(t){return+t}):[];4===o.length&&o.every(function(t){return 0<=t&&t%1==0&&!Number.isNaN(t)&&Number.isFinite(t)})?r.loadChapter(e,o):r.loadChapter(e),document.title=i.getTitle()}}else null!==a.state.currentChapter&&(r.closeChapter(),document.title=i.getTitle())}}},{"./chapterControl":11,"./history":14,"./state":18}],14:[function(t,e,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var r=t("./state");function i(){var t="可穿戴科技";return null!==r.state.currentChapter&&(t+=" - 章节 "+r.state.currentChapter),t}n.getTitle=i,n.updateHistory=function(t){var e=t?window.history.pushState:window.history.replaceState,n=window.location.pathname;null!==r.state.currentChapter&&(n+="?chapter="+r.state.currentChapter,null!==r.state.chapterSelection&&(n+="&selection="+r.state.chapterSelection.join(",")));var o=i();document.title=o,e.call(window.history,null,o,n)}},{"./state":18}],15:[function(t,e,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var o=t("./data"),r=t("./DOM"),i=t("./followQuery"),a=t("./MainMenu"),l=t("./settings"),c=t("./updateSelection"),s=r.id("warning");null!==s&&s.addEventListener("click",function(){s.style.opacity="0",l.animation.getValue()?s.addEventListener("transitionend",function(){s.remove()}):s.remove()}),r.id("build-number").innerText="Build "+o.data.buildNumber,(new a.MainMenu).setActive(!0),document.addEventListener("selectionchange",function(){c.updateSelection()}),window.addEventListener("popstate",function(){i.followQuery()}),i.followQuery()},{"./DOM":3,"./MainMenu":4,"./data":12,"./followQuery":13,"./settings":17,"./updateSelection":21}],16:[function(t,e,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.loadingText="加载中..."},{}],17:[function(t,e,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var o=function(){},r=function(){function t(t,e,n){void 0===n&&(n=o),this.key=t,this.onUpdate=n,this.value=e?"false"!==window.localStorage.getItem(t):"true"===window.localStorage.getItem(t),this.updateLocalStorage(),this.onUpdate(this.value)}return t.prototype.updateLocalStorage=function(){window.localStorage.setItem(this.key,String(this.value))},t.prototype.getValue=function(){return this.value},t.prototype.setValue=function(t){t!==this.value&&this.onUpdate(t),this.value=t,this.updateLocalStorage()},t.prototype.toggle=function(){this.setValue(!this.value)},t}();n.BooleanSetting=r,n.animation=new r("animation",!0,function(t){document.body.classList.toggle("animation-enabled",t)}),n.warning=new r("warning",!1)},{}],18:[function(t,e,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.state={currentChapter:null,chapterSelection:null,chapterTextNodes:null}},{}],19:[function(t,e,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.stylePreviewArticle="<h1>午饭</h1>\n<p><em>作者：友人♪B</em></p>\n<p>“午饭，午饭♪”</p>\n<p>阳伞下的琳，很是期待今天的午饭。</p>\n<p>或许是体质和别的血族不太一样，琳能够感知到食物的味道，似乎也保有着生物对食物的喜爱。</p>\n<p>虽然她并不能从这些食物中获取能量就是。</p>\n<p>学校食堂的夏季限定甜点今天也很是抢手，这点从队伍的长度就能看出来——队伍险些就要超出食堂的范围了。</p>\n<p>“你说我要有钱多好——”</p>\n<p>已经从隔壁窗口买下了普通，但是很便宜的营养餐的秋镜悬，看着队伍中兴致勃勃的琳。</p>\n<p>其实她并不是缺钱，大约是吝啬。</p>\n<p>这得怪她娘，穷养秋镜悬养习惯了，现在她光自己除灵退魔挣来的外快都够她奢侈上一把了，可却还保留着能不花钱绝对不花，必须花钱越少越好的吝啬习惯。</p>\n<p>少顷，琳已经带着她的甜品建筑——每块砖头都是一块蛋糕，堆成一个诡异的火柴盒——来到了桌前。</p>\n<p>“（吃不胖真好，有钱真好……”</p>\n<p>血族的听觉自然是捕捉到了秋镜悬的嘀咕，琳放下盘子，悄咪咪地将牙贴上了秋镜悬的脖颈。</p>\n<p>“嘻嘻♪”</p>\n<p>“呜——”</p>\n<p>盯——</p>\n<p>秋镜悬看了看盘中剩下的一块毛血旺，似是联系到了什么，将目光转向了琳的牙。</p>\n<p>正在享用蛋糕盛宴的琳以余光瞥见了她的视线，</p>\n<p>“盯着本小姐是要做什么呢？”</p>\n<p>“啊，没，没什么……”</p>\n<p>秋镜悬支支吾吾的说着，</p>\n<p>“就是好奇一个问题，血族为什么不吃毛血旺……”</p>\n<p>“噢☆毛血旺就是那个煮熟的血块是吧？太没有美感了这种血！而且吃了也没法儿恢复能量，简直就是血液的绝佳浪费☆！”</p>\n<p>琳发出了对这样美食的鄙视，不过这种鄙视大约只有血族和蚊子会出现吧……</p>\n<p>“血族需要摄入血，是因为血所具有的生命能量，如果煮熟了的话，超过九成的能量都被转化成其他的东西了，对我们来说实在是没什么用处，还白白浪费了作为原料的血，这种东西本小姐才不吃咧✘！饿死，死外边，从这边跳下去也不吃✘！”</p>\n<p>“欸，别这么说嘛，你能尝得到味道的吧，吃一块试试呗？”</p>\n<p>“真……真香♪”</p>\n<p>当晚，因为触发了真香定律而感到很火大的琳，把秋镜悬丢进了自己的高维空间里头放置了一晚上（高维时间三天）泄愤。</p>"},{}],20:[function(t,e,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.thanks=[{name:"神楽坂 立音"},{name:"lgd_小翅膀"},{name:"青葉"},{name:"kn"},{name:"F74nk",link:"https://t.me/F74nk_K"},{name:"杨佳文"},{name:"不知名的N姓人士就好"},{name:"某不愿透露姓名的N性？"},{name:"神楽坂 萌绫"},{name:"Butby"},{name:"友人♪B"},{name:"NekoCaffeine"},{name:"RainSlide"}].sort(function(){return Math.random()-.5})},{}],21:[function(t,e,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var a=t("./history"),l=t("./state");n.updateSelection=function(){if(null!==l.state.chapterTextNodes){var t=String(l.state.chapterSelection),e=document.getSelection();if(null===e)l.state.chapterSelection=null;else{var n=e.anchorNode instanceof HTMLElement?e.anchorNode.firstChild:e.anchorNode,o=l.state.chapterTextNodes.indexOf(n),r=e.focusNode instanceof HTMLElement?e.focusNode.firstChild:e.focusNode,i=l.state.chapterTextNodes.indexOf(r);-1===o||-1===i||o===i&&e.anchorOffset===e.focusOffset?l.state.chapterSelection=null:o<i||o===i&&e.anchorOffset<e.focusOffset?l.state.chapterSelection=[o,e.anchorOffset,i,e.focusOffset]:l.state.chapterSelection=[i,e.focusOffset,o,e.anchorOffset]}t!==String(l.state.chapterSelection)&&a.updateHistory(!1)}}},{"./history":14,"./state":18}]},{},[15]);