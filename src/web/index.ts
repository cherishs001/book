import { getTextNodes } from './getTextNodes';
import { loadingText } from './loadingText';
import { Menu } from './Menu';
import { load as loadStyles } from './Style';
import { stylePreviewArticle } from './stylePreviewArticle';

interface Data {
  chapters: Array<string>;
  charsCount: number;
  paragraphsCount: number;
  buildNumber: string;
}
const data = (window as any).DATA as Data;

const id = <T extends HTMLElement = HTMLDivElement>(id: string) => {
  return document.getElementById(id) as T;
};

const $warning = id('warning');

const $buildNumber = id('build-number');
$buildNumber.innerText = `Build ${data.buildNumber}`;

const $rect = id('rect');
const $content = id('content');

const $btngrpMain = id('btngrp-main');
const $btnChapters = id('btn-chapters');
const $btnThanks = id('btn-thanks');
const $btnStyle = id('btn-style');
const $btnContact = id('btn-contact');
const $btnSettings = id('btn-settings');
const $btnStats = id('btn-stats');

const $btngrpChapters = id('btngrp-chapters');
const $btnChaptersBack = id('btn-chapters-back');

const $btngrpThanks = id('btngrp-thanks');
const $btnThanksBack = id('btn-thanks-back');

const $btngrpStyle = id('btngrp-style');
const $btnStyleBack = id('btn-style-back');
loadStyles($btngrpStyle);

const $btngrpContact = id('btngrp-contact');
const $btnContactBack = id('btn-contact-back');

const $btngrpSettings = id('btngrp-settings');
const $btnSettingsBack = id('btn-settings-back');
const $btnSettingsWarning = id('btn-settings-warning');
const $btnSettingsAnimation = id('btn-settings-animation');

const $btngrpStats = id('btngrp-stats');
const $btnStatsBack = id('btn-stats-back');
const $txtStatsChars = id('txt-stats-chars');
const $txtStatsParagraphs = id('txt-stats-paragraphs');

$txtStatsChars.innerText = `总字数：${data.charsCount}`;
$txtStatsParagraphs.innerText = `总段落数：${data.paragraphsCount}`;

enum RectMode {
  SIDE,
  MAIN,
  OFF,
}
let rectMode: RectMode = RectMode.OFF;
const setRectMode = (newRectMode: RectMode) => {
  // console.info(`${RectMode[rectMode]} -> ${RectMode[newRectMode]}`);
  if (rectMode === newRectMode) {
    return;
  }
  if (newRectMode === RectMode.OFF) {
    $rect.classList.remove('reading');
  } else {
    if (rectMode === RectMode.MAIN) {
      $rect.classList.remove('main');
    } else if (rectMode === RectMode.SIDE) {
      $rect.classList.remove('side');
    } else {
      $rect.classList.remove('main', 'side');
      $rect.classList.add('reading');
    }
    if (newRectMode === RectMode.MAIN) {
      $rect.classList.add('main');
    } else {
      $rect.classList.add('side');
    }
  }
  rectMode = newRectMode;
};

let menu: Menu = Menu.MAIN;
const menuGroups = {
  [Menu.MAIN]: $btngrpMain,
  [Menu.CHAPTERS]: $btngrpChapters,
  [Menu.THANKS]: $btngrpThanks,
  [Menu.STYLE]: $btngrpStyle,
  [Menu.CONTACT]: $btngrpContact,
  [Menu.SETTINGS]: $btngrpSettings,
  [Menu.STATS]: $btngrpStats,
};

const attachMenuSwitchEvent = (button: HTMLElement, from: Menu, to: Menu, cb?: () => void) => {
  button.addEventListener('click', () => {
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

attachMenuSwitchEvent($btnChapters, Menu.MAIN, Menu.CHAPTERS);
attachMenuSwitchEvent($btnChaptersBack, Menu.CHAPTERS, Menu.MAIN);
attachMenuSwitchEvent($btnThanks, Menu.MAIN, Menu.THANKS);
attachMenuSwitchEvent($btnThanksBack, Menu.THANKS, Menu.MAIN);
attachMenuSwitchEvent($btnStyle, Menu.MAIN, Menu.STYLE, () => {
  $content.innerHTML = stylePreviewArticle;
  setRectMode(RectMode.SIDE);
});
attachMenuSwitchEvent($btnStyleBack, Menu.STYLE, Menu.MAIN, () => {
  setRectMode(RectMode.OFF);
});
attachMenuSwitchEvent($btnContact, Menu.MAIN, Menu.CONTACT);
attachMenuSwitchEvent($btnContactBack, Menu.CONTACT, Menu.MAIN);
attachMenuSwitchEvent($btnSettings, Menu.MAIN, Menu.SETTINGS);
attachMenuSwitchEvent($btnSettingsBack, Menu.SETTINGS, Menu.MAIN);
attachMenuSwitchEvent($btnStats, Menu.MAIN, Menu.STATS);
attachMenuSwitchEvent($btnStatsBack, Menu.STATS, Menu.MAIN);

let settingsWarning = window.localStorage.getItem('warning') !== 'false';
let settingsAnimation = window.localStorage.getItem('animation') !== 'false';
const updateSettingsWarning = () => {
  $btnSettingsWarning.innerText = `NSFW 警告：${settingsWarning ? '开' : '关'}`;
};
updateSettingsWarning();
const updateSettingsAnimation = () => {
  $btnSettingsAnimation.innerText = `使用动画：${settingsAnimation ? '开' : '关'}`;
  if (settingsAnimation) {
    document.body.classList.add('animation-enabled');
  } else {
    document.body.classList.remove('animation-enabled');
  }
};
updateSettingsAnimation();
$btnSettingsWarning.addEventListener('click', () => {
  settingsWarning = !settingsWarning;
  window.localStorage.setItem('warning', String(settingsWarning));
  updateSettingsWarning();
});
$btnSettingsAnimation.addEventListener('click', () => {
  settingsAnimation = !settingsAnimation;
  window.localStorage.setItem('animation', String(settingsAnimation));
  updateSettingsAnimation();
});
if ($warning !== null) {
  $warning.addEventListener('click', () => {
    $warning.style.opacity = '0';
    if (settingsAnimation) {
      $warning.addEventListener('transitionend', () => {
        $warning.remove();
      });
    } else {
      $warning.remove();
    }
  });
}

const chaptersCache = new Map<string, string | null>();
let currentChapter: null | string = null;
let chapterSelection: [number, number, number, number] | null = null;
let chapterTextNodes: Array<Text> | null = null;

const closeChapter = () => {
  setRectMode(RectMode.OFF);
  currentChapter = null;
  chapterSelection = null;
  chapterTextNodes = null;
};

const select = ([
  anchorNodeIndex,
  anchorOffset,
  focusNodeIndex,
  focusOffset,
]: [number, number, number, number]) => {
  if (chapterTextNodes === null) {
    return;
  }
  const anchorNode = chapterTextNodes[anchorNodeIndex];
  const focusNode = chapterTextNodes[focusNodeIndex];
  if (anchorNode === undefined || focusNode === undefined) {
    return;
  }
  document.getSelection()!.setBaseAndExtent(
    anchorNode,
    anchorOffset,
    focusNode,
    focusOffset,
  );
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

const finalizeChapterLoading = (selection?: [number, number, number, number]) => {
  chapterTextNodes = getTextNodes($content);
  if (selection !== undefined) {
    select(selection);
  }
  const chapterIndex = data.chapters.indexOf(currentChapter!);

  const $div = document.createElement('div');
  $div.style.display = 'flex';
  if (chapterIndex !== -1 && (chapterIndex !== 0)) {
    const prevChapter = data.chapters[chapterIndex - 1];
    const $prevLink = document.createElement('a');
    $prevLink.innerText = '上一章';
    $prevLink.href = `${window.location.pathname}?chapter=${prevChapter}`;
    $prevLink.style.textAlign = 'left';
    $prevLink.style.flex = '1';
    $prevLink.addEventListener('click', event => {
      event.preventDefault();
      loadChapter(prevChapter);
      updateHistory(true);
    });
    $div.appendChild($prevLink);
  } else {
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
    updateHistory(true);
  });
  $div.appendChild($menuLink);
  if (chapterIndex !== -1 && (chapterIndex < data.chapters.length - 1)) {
    const nextChapter = data.chapters[chapterIndex + 1];
    const $nextLink = document.createElement('a');
    $nextLink.innerText = '下一章';
    $nextLink.href = `${window.location.pathname}?chapter=${nextChapter}`;
    $nextLink.style.textAlign = 'right';
    $nextLink.style.flex = '1';
    $nextLink.addEventListener('click', event => {
      event.preventDefault();
      loadChapter(nextChapter);
      updateHistory(true);
    });
    $div.appendChild($nextLink);
  } else {
    $div.appendChild(getFlexOneSpan());
  }
  $content.appendChild($div);
};

const loadChapter = (chapter: string, selection?: [number, number, number, number]) => {
  setRectMode(RectMode.MAIN);
  currentChapter = chapter;
  if (chaptersCache.has(chapter)) {
    if (chaptersCache.get(chapter) === null) {
      $content.innerText = loadingText;
    } else {
      $content.innerHTML = chaptersCache.get(chapter)!;
      finalizeChapterLoading(selection);
    }
  } else {
    $content.innerText = loadingText;
    fetch(`./chapters/${chapter}.html`)
      .then(response => response.text())
      .then(text => {
        chaptersCache.set(chapter, text);
        if (chapter === currentChapter) {
          $content.innerHTML = text;
          finalizeChapterLoading(selection);
        }
      });
  }
  return true;
};

const getTitle = () => {
  let title = '可穿戴科技';
  if (currentChapter !== null) {
    title += ' - 章节 ' + currentChapter;
  }
  return title;
};

const updateHistory = (push: boolean) => {
  const method = push ? window.history.pushState : window.history.replaceState;
  let query = window.location.pathname;
  if (currentChapter !== null) {
    query += '?chapter=' + currentChapter;
    if (chapterSelection !== null) {
      query += `&selection=${chapterSelection.join(',')}`;
    }
  }
  const title = getTitle();
  document.title = title;
  method.call(window.history, null, title, query);
};

document.addEventListener('selectionchange', () => {
  if (chapterTextNodes === null) {
    return;
  }
  const before = String(chapterSelection);
  const selection = document.getSelection();
  if (selection === null) {
    chapterSelection = null;
  } else {
    const anchor = ((selection.anchorNode instanceof HTMLElement)
      ? selection.anchorNode.firstChild
      : selection.anchorNode) as Text;
    const anchorNodeIndex = chapterTextNodes.indexOf(anchor);
    const focus = ((selection.focusNode instanceof HTMLElement)
      ? selection.focusNode.firstChild
      : selection.focusNode) as Text;
    const focusNodeIndex = chapterTextNodes.indexOf(focus);
    if (
      (anchorNodeIndex === -1) || (focusNodeIndex === -1) ||
      (anchorNodeIndex === focusNodeIndex && selection.anchorOffset === selection.focusOffset)
    ) {
      chapterSelection = null;
    } else {
      if (
        (anchorNodeIndex < focusNodeIndex) ||
        (anchorNodeIndex === focusNodeIndex && selection.anchorOffset < selection.focusOffset)
      ) {
        chapterSelection = [
          anchorNodeIndex,
          selection.anchorOffset,
          focusNodeIndex,
          selection.focusOffset,
        ];
      } else {
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

const followQuery = () => {
  if (typeof URLSearchParams !== 'function') {
    return;
  }
  const query = new URLSearchParams(window.location.search);
  const chapter = query.get('chapter');
  if (chapter === null) {
    if (currentChapter !== null) {
      closeChapter();
      document.title = getTitle();
    }
    return;
  }
  if (currentChapter !== chapter) {
    const selectionQuery = query.get('selection');
    const selection: Array<number> = selectionQuery !== null
      ? selectionQuery.split(',').map(str => +str)
      : [];
    if (selection.length !== 4 || !selection.every(
      num => (num >= 0) && (num % 1 === 0) && (!Number.isNaN(num)) && (Number.isFinite(num)),
    )) {
      loadChapter(chapter);
    } else {
      loadChapter(chapter, selection as [number, number, number, number]);
    }
    document.title = getTitle();
  }
};

window.addEventListener('popstate', () => {
  followQuery();
});

for (const chapter of data.chapters) {
  const $button = document.createElement('div');
  $button.classList.add('small', 'button');
  $button.innerText = `章节 ${chapter}`;
  $button.addEventListener('click', () => {
    loadChapter(chapter);
    updateHistory(true);
  });
  $btngrpChapters.appendChild($button);
}

followQuery();
