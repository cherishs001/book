import { Chapter } from '../../Data';
import { FlowReader } from '../../wtcd/FlowReader';
import { GameReader } from '../../wtcd/GameReader';
import { WTCDParseResult } from '../../wtcd/types';
import { WTCDError } from '../../wtcd/WTCDError';
import { ContentBlockType } from '../constant/ContentBlockType';
import { loadingText } from '../constant/loadingText';
import { WTCD_ERROR_COMPILE_TITLE, WTCD_ERROR_INTERNAL_DESC, WTCD_ERROR_INTERNAL_STACK_DESC, WTCD_ERROR_INTERNAL_STACK_TITLE, WTCD_ERROR_INTERNAL_TITLE, WTCD_ERROR_MESSAGE, WTCD_ERROR_RUNTIME_DESC, WTCD_ERROR_RUNTIME_TITLE, WTCD_ERROR_WTCD_STACK_DESC, WTCD_ERROR_WTCD_STACK_TITLE } from '../constant/messages';
import { relativePathLookUpMap } from '../data/data';
import { earlyAccess, gestureSwitchChapter } from '../data/settings';
import { Selection, state } from '../data/state';
import { DebugLogger } from '../DebugLogger';
import { Event } from '../Event';
import { SwipeDirection, swipeEvent } from '../input/gestures';
import { ArrowKey, arrowKeyPressEvent, escapeKeyPressEvent } from '../input/keyboard';
import { getTextNodes, id } from '../util/DOM';
import { hideComments, loadComments } from './commentsControl';
import { updateHistory } from './history';
import { Layout, setLayout } from './layoutControl';
import { processElements } from './processElements';

const debugLogger = new DebugLogger('chapterControl');

const $content = id('content');
const $rect = id('rect');
const chaptersCache = new Map<string, string | null>();

export const loadChapterEvent = new Event<string>();

export function closeChapter() {
  setLayout(Layout.OFF);
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
  $block.classList.add('content-block', type);
  const $title = document.createElement('h1');
  $title.innerText = title;
  $block.appendChild($title);
  const $text = document.createElement('p');
  $text.innerText = text;
  $block.appendChild($text);
  return $block;
};

export function loadPrevChapter() {
  const chapterCtx = state.currentChapter;
  if (chapterCtx === null) {
    return;
  }
  const chapterIndex = chapterCtx.inFolderIndex;
  if (chapterIndex >= 1 && canChapterShown(chapterCtx.folder.chapters[chapterIndex - 1])) {
    const prevChapter = chapterCtx.folder.chapters[chapterIndex - 1].htmlRelativePath;
    loadChapter(prevChapter);
    updateHistory(true);
  }
}

export function loadNextChapter() {
  const chapterCtx = state.currentChapter;
  if (chapterCtx === null) {
    return;
  }
  const chapterIndex = chapterCtx.inFolderIndex;
  if (chapterIndex < chapterCtx.folder.chapters.length - 1 && canChapterShown(chapterCtx.folder.chapters[chapterIndex + 1])) {
    const nextChapter = chapterCtx.folder.chapters[chapterIndex + 1].htmlRelativePath;
    loadChapter(nextChapter);
    updateHistory(true);
  }
}

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

  processElements($content);

  const chapterCtx = state.currentChapter!;
  const chapterIndex = chapterCtx.inFolderIndex;

  if (chapterCtx.chapter.isEarlyAccess) {
    const $block = createContentBlock('early-access', '编写中章节', '请注意，本文正在编写中，因此可能会含有未完成的句子或是尚未更新的信息。');
    $rect.prepend($block);
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
    $nextLink.href = `${window.location.pathname}#${nextChapter}`;
    $nextLink.style.textAlign = 'right';
    $nextLink.style.flex = '1';
    $nextLink.addEventListener('click', event => {
      event.preventDefault();
      loadNextChapter();
    });
    $div.appendChild($nextLink);
  } else {
    $div.appendChild(getFlexOneSpan());
  }
  $content.appendChild($div);

  loadComments(chapterCtx.chapter.commentsUrl);

  // fix for stupid scrolling issues under iOS
  id('rect').style.overflow = 'hidden';
  setTimeout(() => {
    id('rect').style.overflow = '';
    if (selection === undefined) {
      id('rect').scrollTo(0, 0);
    }
  }, 1);

  // Re-focus the rect so it is arrow-scrollable
  setTimeout(() => {
    id('rect').focus();
  }, 1);
};

swipeEvent.on(direction => {
  if (!gestureSwitchChapter.getValue()) {
    return;
  }
  if (direction === SwipeDirection.TO_RIGHT) {
    // 上一章
    loadPrevChapter();
  } else if (direction === SwipeDirection.TO_LEFT) {
    // 下一章
    loadNextChapter();
  }
});

arrowKeyPressEvent.on(arrowKey => {
  if (arrowKey === ArrowKey.LEFT) {
    loadPrevChapter();
  } else if (arrowKey === ArrowKey.RIGHT) {
    loadNextChapter();
  }
});

escapeKeyPressEvent.on(() => {
  closeChapter();
  updateHistory(true);
});

enum ErrorType {
  COMPILE,
  RUNTIME,
  INTERNAL,
}

function createWTCDErrorMessage({
  errorType,
  message,
  internalStack,
  wtcdStack,
}: {
  errorType: ErrorType;
  message: string;
  internalStack?: string;
  wtcdStack?: string;
}): HTMLElement {
  const $target = document.createElement('div');
  const $title = document.createElement('h1');
  const $desc = document.createElement('p');
  switch (errorType) {
    case ErrorType.COMPILE:
      $title.innerText = WTCD_ERROR_COMPILE_TITLE;
      $desc.innerText = WTCD_ERROR_COMPILE_TITLE;
      break;
    case ErrorType.RUNTIME:
      $title.innerText = WTCD_ERROR_RUNTIME_TITLE;
      $desc.innerText = WTCD_ERROR_RUNTIME_DESC;
      break;
    case ErrorType.INTERNAL:
      $title.innerText = WTCD_ERROR_INTERNAL_TITLE;
      $desc.innerText = WTCD_ERROR_INTERNAL_DESC;
      break;
  }
  $target.appendChild($title);
  $target.appendChild($desc);
  const $message = document.createElement('p');
  $message.innerText = WTCD_ERROR_MESSAGE + message;
  $target.appendChild($message);
  if (wtcdStack !== undefined) {
    const $stackTitle = document.createElement('h2');
    $stackTitle.innerText = WTCD_ERROR_WTCD_STACK_TITLE;
    $target.appendChild($stackTitle);
    const $stackDesc = document.createElement('p');
    $stackDesc.innerText = WTCD_ERROR_WTCD_STACK_DESC;
    $target.appendChild($stackDesc);
    const $pre = document.createElement('pre');
    const $code = document.createElement('code');
    $code.innerText = wtcdStack;
    $pre.appendChild($code);
    $target.appendChild($pre);
  }
  if (internalStack !== undefined) {
    const $stackTitle = document.createElement('h2');
    $stackTitle.innerText = WTCD_ERROR_INTERNAL_STACK_TITLE;
    $target.appendChild($stackTitle);
    const $stackDesc = document.createElement('p');
    $stackDesc.innerText = WTCD_ERROR_INTERNAL_STACK_DESC;
    $target.appendChild($stackDesc);
    const $pre = document.createElement('pre');
    const $code = document.createElement('code');
    $code.innerText = internalStack;
    $pre.appendChild($code);
    $target.appendChild($pre);
  }
  return $target;
}

function createWTCDErrorMessageFromError(error: Error) {
  return createWTCDErrorMessage({
    errorType: (error instanceof WTCDError)
      ? ErrorType.RUNTIME
      : ErrorType.INTERNAL,
    message: error.message,
    internalStack: error.stack,
    wtcdStack: (error instanceof WTCDError)
      ? error.wtcdStack
      : undefined,
  });
}

function insertContent($target: HTMLDivElement, content: string, chapter: Chapter) {
  switch (chapter.type) {
    case 'Markdown':
      $target.innerHTML = content;
      break;
    case 'WTCD': {
      $target.innerHTML = '';
      const wtcdParseResult: WTCDParseResult = JSON.parse(content);
      if (wtcdParseResult.error === true) {
        $target.appendChild(createWTCDErrorMessage({
          errorType: ErrorType.COMPILE,
          message: wtcdParseResult.message,
          internalStack: wtcdParseResult.internalStack,
        }));
        break;
      }
      switch (chapter.preferredReader) {
        case 'flow': {
          const flowReader = new FlowReader(
            chapter.htmlRelativePath,
            wtcdParseResult.wtcdRoot,
            createWTCDErrorMessageFromError,
            processElements,
          );
          const $wtcdContainer = document.createElement('div');
          flowReader.renderTo($wtcdContainer);
          $content.appendChild($wtcdContainer);
          break;
        }
        case 'game': {
          const gameReader = new GameReader(
            chapter.htmlRelativePath,
            wtcdParseResult.wtcdRoot,
            createWTCDErrorMessageFromError,
            processElements,
          );
          const $wtcdContainer = document.createElement('div');
          gameReader.renderTo($wtcdContainer);
          $content.appendChild($wtcdContainer);
          break;
        }
      }
    }
  }
}

export function loadChapter(chapterHtmlRelativePath: string, selection?: Selection) {
  debugLogger.log('Load chapter', chapterHtmlRelativePath, 'selection', selection);
  hideComments();
  Array.from(document.getElementsByClassName('content-block'))
    .forEach($block => $block.remove());
  loadChapterEvent.emit(chapterHtmlRelativePath);
  window.localStorage.setItem('lastRead', chapterHtmlRelativePath);
  setLayout(Layout.MAIN);
  const chapterCtx = relativePathLookUpMap.get(chapterHtmlRelativePath)!;
  state.currentChapter = chapterCtx;
  if (chaptersCache.has(chapterHtmlRelativePath)) {
    if (chaptersCache.get(chapterHtmlRelativePath) === null) {
      $content.innerText = loadingText;
    } else {
      insertContent($content, chaptersCache.get(chapterHtmlRelativePath)!, chapterCtx.chapter);
      finalizeChapterLoading(selection);
    }
  } else {
    $content.innerText = loadingText;
    fetch(`./chapters/${chapterHtmlRelativePath}`)
      .then(response => response.text())
      .then(text => {
        chaptersCache.set(chapterHtmlRelativePath, text);
        if (chapterCtx === state.currentChapter) {
          insertContent($content, text, chapterCtx.chapter);
          finalizeChapterLoading(selection);
        }
      });
  }
  return true;
}
