import { Chapter } from '../../Data';
import { FlowReader } from '../../wtcd/FlowReader';
import { GameReader } from '../../wtcd/GameReader';
import { WTCDParseResult } from '../../wtcd/types';
import { WTCDError } from '../../wtcd/WTCDError';
import { loadingText } from '../constant/loadingText';
import {
  CHAPTER_FAILED,
  EARLY_ACCESS_DESC,
  EARLY_ACCESS_TITLE,
  GO_TO_MENU,
  NEXT_CHAPTER,
  PREVIOUS_CHAPTER,
  WTCD_ERROR_COMPILE_TITLE,
  WTCD_ERROR_INTERNAL_DESC,
  WTCD_ERROR_INTERNAL_STACK_DESC,
  WTCD_ERROR_INTERNAL_STACK_TITLE,
  WTCD_ERROR_INTERNAL_TITLE,
  WTCD_ERROR_MESSAGE,
  WTCD_ERROR_RUNTIME_DESC,
  WTCD_ERROR_RUNTIME_TITLE,
  WTCD_ERROR_WTCD_STACK_DESC,
  WTCD_ERROR_WTCD_STACK_TITLE,
} from '../constant/messages';
import { AutoCache } from '../data/AutoCache';
import { relativePathLookUpMap } from '../data/data';
import { earlyAccess, gestureSwitchChapter } from '../data/settings';
import { Selection, state } from '../data/state';
import { DebugLogger } from '../DebugLogger';
import { Event } from '../Event';
import { h } from '../hs';
import { SwipeDirection, swipeEvent } from '../input/gestures';
import { ArrowKey, arrowKeyPressEvent, escapeKeyPressEvent } from '../input/keyboard';
import { getTextNodes, id } from '../util/DOM';
import { loadComments } from './commentsControl';
import { ContentBlockStyle, focusOnContainer, getCurrentContent, newContent, Side } from './contentControl';
import { updateHistory } from './history';
import { Layout, setLayout } from './layoutControl';
import { processElements } from './processElements';
import { scrollTo } from './scrollControl';

const debugLogger = new DebugLogger('Chapter Control');

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

export function loadPrevChapter() {
  const chapterCtx = state.currentChapter;
  if (chapterCtx === null) {
    return;
  }
  const chapterIndex = chapterCtx.inFolderIndex;
  if (chapterIndex >= 1 && canChapterShown(chapterCtx.folder.chapters[chapterIndex - 1])) {
    const prevChapter = chapterCtx.folder.chapters[chapterIndex - 1].htmlRelativePath;
    loadChapter(prevChapter, undefined, Side.LEFT);
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
    loadChapter(nextChapter, undefined, Side.RIGHT);
    updateHistory(true);
  }
}

const chaptersCache = new AutoCache<string, string>(
  chapterHtmlRelativePath => {
    const url = `./chapters/${chapterHtmlRelativePath}`;
    debugLogger.log(`Loading chapter from ${url}.`);
    return fetch(url).then(response => response.text());
  },
  new DebugLogger('Chapters Cache'),
);
export function loadChapter(
  chapterHtmlRelativePath: string,
  selection?: Selection,
  side: Side = Side.LEFT,
) {
  scrollTo(0);

  debugLogger.log(
    'Load chapter',
    chapterHtmlRelativePath,
    'with selection',
    selection,
  );
  loadChapterEvent.emit(chapterHtmlRelativePath);
  window.localStorage.setItem('lastRead', chapterHtmlRelativePath);
  const chapterCtx = relativePathLookUpMap.get(chapterHtmlRelativePath)!;
  state.currentChapter = chapterCtx;

  const content = newContent(side);

  if (chapterCtx.chapter.isEarlyAccess) {
    content.addBlock({
      initElement: (
        h('div', [
          h('h1', EARLY_ACCESS_TITLE),
          h('p', EARLY_ACCESS_DESC),
        ])
      ),
      style: ContentBlockStyle.WARNING,
    });
  }
  const chapterBlock = content.addBlock({
    initElement: h('.content') as HTMLDivElement,
  });

  setLayout(Layout.MAIN);

  chapterBlock.element.innerText = loadingText;
  chaptersCache.get(chapterHtmlRelativePath).then(text => {
    if (content.isDestroyed) {
      debugLogger.log('Chapter loaded, but abandoned since the original ' +
        'content page is already destroyed.');
      return;
    }
    debugLogger.log('Chapter loaded.');

    insertContent(chapterBlock.element, text, chapterCtx.chapter);
    processElements(chapterBlock.element);

    state.chapterTextNodes = getTextNodes(chapterBlock.element);
    if (selection !== undefined) {
      if (id('warning') === null) {
        select(selection);
      } else {
        id('warning').addEventListener('click', () => {
          select(selection);
        });
      }
    }

    const chapterIndex = chapterCtx.inFolderIndex;
    const prevChapter = chapterCtx.folder.chapters[chapterIndex - 1];
    const nextChapter = chapterCtx.folder.chapters[chapterIndex + 1];
    chapterBlock.element.appendChild(h('div.page-switcher', [
      // 上一章
      (prevChapter !== undefined && canChapterShown(prevChapter))
        ? h('a.to-prev', {
          href: window.location.pathname + '#' + prevChapter.htmlRelativePath,
          onclick: (event: MouseEvent) => {
            event.preventDefault();
            loadPrevChapter();
          },
        }, PREVIOUS_CHAPTER)
        : h('a'),

      // 返回菜单
      h('a.to-menu', {
        href: window.location.pathname,
        onclick: (event: MouseEvent) => {
          event.preventDefault();
          closeChapter();
          updateHistory(true);
        },
      }, GO_TO_MENU),

      // 下一章
      (nextChapter !== undefined && canChapterShown(nextChapter))
        ? h('a.to-next', {
          href: window.location.pathname + '#' + nextChapter.htmlRelativePath,
          onclick: (event: MouseEvent) => {
            event.preventDefault();
            loadNextChapter();
          },
        }, NEXT_CHAPTER)
        : h('a'),
    ]));

    // fix for stupid scrolling issues under iOS
    // id('rect').style.overflow = 'hidden';
    // setTimeout(() => {
    //   id('rect').style.overflow = '';
    //   if (selection === undefined) {
    //     id('rect').scrollTo(0, 0);
    //   }
    // }, 1);

    // Re-focus the rect so it is arrow-scrollable
    setTimeout(() => {
      focusOnContainer();
    }, 1);
    loadComments(getCurrentContent()!, chapterCtx.chapter.commentsUrl);
  })
  .catch(error => {
    debugLogger.error(`Failed to load chapter.`, error);
    chapterBlock.element.innerText = CHAPTER_FAILED;
  });
}

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
          $target.appendChild($wtcdContainer);
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
          $target.appendChild($wtcdContainer);
          break;
        }
      }
    }
  }
}
