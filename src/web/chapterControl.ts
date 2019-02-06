import { data } from './data';
import { getTextNodes, id } from './DOM';
import { updateHistory } from './history';
import { loadingText } from './loadingText';
import { RectMode, setRectMode } from './RectMode';
import { Selection, state } from './state';
import { earlyAccess } from './settings';

const $content = id('content');
const chaptersCache = new Map<string, string | null>();

export function closeChapter() {
  setRectMode(RectMode.OFF);
  state.currentChapter = null;
  state.chapterSelection = null;
  state.chapterTextNodes = null;
}

const select = ([
  anchorNodeIndex,
  anchorOffset,
  focusNodeIndex,
  focusOffset,
]: Selection) => {
  if (state.chapterTextNodes === null) {
    return;
  }
  const anchorNode = state.chapterTextNodes[anchorNodeIndex];
  const focusNode = state.chapterTextNodes[focusNodeIndex];
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

const canChapterShown = (chapterIndex: number) =>
  earlyAccess.getValue() || !data.earlyAccessChapters.includes(data.chapters[chapterIndex]);

const finalizeChapterLoading = (selection?: Selection) => {
  state.chapterTextNodes = getTextNodes($content);
  if (selection !== undefined) {
    select(selection);
  }
  const chapterIndex = data.chapters.indexOf(state.currentChapter!);

  const $div = document.createElement('div');
  $div.style.display = 'flex';
  if (chapterIndex >= 1 && canChapterShown(chapterIndex - 1)) {
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
  if (chapterIndex !== -1 && (chapterIndex < data.chapters.length - 1) && canChapterShown(chapterIndex + 1)) {
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

export function loadChapter(chapter: string, selection?: Selection) {
  setRectMode(RectMode.MAIN);
  state.currentChapter = chapter;
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
        if (chapter === state.currentChapter) {
          $content.innerHTML = text;
          finalizeChapterLoading(selection);
        }
      });
  }
  return true;
}
