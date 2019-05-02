import { Chapter } from '../Data';
import { loadComments } from './commentsControl';
import { ContentBlockType } from './ContentBlockType';
import { relativePathLookUpMap } from './data';
import { getTextNodes, id } from './DOM';
import { updateHistory } from './history';
import { loadingText } from './loadingText';
import { LastRead } from './LocalStorage';
import { RectMode, setRectMode } from './RectMode';
import { earlyAccess } from './settings';
import { Selection, state } from './state';

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

const canChapterShown = (chapter: Chapter) =>
  earlyAccess.getValue() || !chapter.isEarlyAccess;

const createContentBlock = (type: ContentBlockType, title: string, text: string) => {
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

const finalizeChapterLoading = (selection?: Selection) => {
  state.chapterTextNodes = getTextNodes($content);
  if (selection !== undefined) {
    if (id('warning') === null) {
      select(selection);
    } else {
      id('warning').addEventListener('click', () => {
        select(selection);
      });
    }
  }

  Array.from($content.getElementsByClassName('a')).forEach($anchor => ($anchor as HTMLAnchorElement).target = '_blank');

  const chapterCtx = state.currentChapter!;
  const chapterIndex = chapterCtx.inFolderIndex;

  if (chapterCtx.chapter.isEarlyAccess) {
    const $block = createContentBlock('earlyAccess', '编写中章节', '请注意，本文正在编写中，因此可能会含有未完成的句子或是尚未更新的信息。');
    $content.prepend($block);
  }

  const $div = document.createElement('div');
  $div.style.display = 'flex';
  if (chapterIndex >= 1 && canChapterShown(chapterCtx.folder.chapters[chapterIndex - 1])) {
    const prevChapter = chapterCtx.folder.chapters[chapterIndex - 1].htmlRelativePath;
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
  if (chapterIndex < chapterCtx.folder.chapters.length - 1 && canChapterShown(chapterCtx.folder.chapters[chapterIndex + 1])) {
    const nextChapter = chapterCtx.folder.chapters[chapterIndex + 1].htmlRelativePath;
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

  loadComments(chapterCtx.chapter.commentsUrl);

  let slideF: boolean = false;
  let startX: number;
  const onMove = (x: number) => {
    const cond = window.outerWidth * 0.3;
    if (x < startX && startX - x >= cond) {
      const prevChapter = chapterCtx.folder.chapters[chapterIndex - 1].htmlRelativePath;
      loadChapter(prevChapter);
      updateHistory(true);
    } else if (x > startX && x - startX >= cond) {
      const nextChapter = chapterCtx.folder.chapters[chapterIndex + 1].htmlRelativePath;
      loadChapter(nextChapter);
      updateHistory(true);
    }
  };

  window.onmousedown = (e) => {
    slideF = true;
    startX = e.clientX;
  };
  window.ontouchstart = (e) => {
    slideF = true;
    startX = e.touches[0].pageX;
  };

  window.onmouseup = () => {
    slideF = false;
  };
  window.ontouchend = () => {
    slideF = false;
  };

  window.onmousemove = (e) => {
    if (!slideF) {
      return;
    }
    onMove(e.clientX);
  };
  window.ontouchmove = (e) => {
    if (!slideF) {
      return;
    }
    onMove(e.touches[0].pageX);
  };

  // fix for stupid scrolling issues under iOS
  id('rect').style.overflow = 'hidden';
  setTimeout(() => {
    id('rect').style.overflow = null;
    if (selection === undefined) {
      id('rect').scrollTo(0, 0);
    }
  }, 1);
};

export function loadChapter(chapterHtmlRelativePath: string, selection?: Selection) {
  localStorage.setItem('lastRead', chapterHtmlRelativePath);
  const element = document.querySelector('[data-chapterPath="' + chapterHtmlRelativePath + '"]');
  if (element != null) {
    LastRead.UpdateLastRead(element);
  }
  setRectMode(RectMode.MAIN);
  const chapterCtx = relativePathLookUpMap.get(chapterHtmlRelativePath)!;
  state.currentChapter = chapterCtx;
  if (chaptersCache.has(chapterHtmlRelativePath)) {
    if (chaptersCache.get(chapterHtmlRelativePath) === null) {
      $content.innerText = loadingText;
    } else {
      $content.innerHTML = chaptersCache.get(chapterHtmlRelativePath)!;
      finalizeChapterLoading(selection);
    }
  } else {
    $content.innerText = loadingText;
    fetch(`./chapters/${chapterHtmlRelativePath}`)
      .then(response => response.text())
      .then(text => {
        chaptersCache.set(chapterHtmlRelativePath, text);
        if (chapterCtx === state.currentChapter) {
          $content.innerHTML = text;
          finalizeChapterLoading(selection);
        }
      });
  }
  return true;
}
