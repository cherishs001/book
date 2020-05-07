import { Chapter } from '../../Data';
import { FlowReader } from '../../wtcd/FlowReader';
import { WTCDParseResult } from '../../wtcd/types';
import { loadingText } from '../constant/loadingText';
import { CHAPTER_FAILED, EARLY_ACCESS_DESC, EARLY_ACCESS_TITLE, GO_TO_MENU, NEXT_CHAPTER, PREVIOUS_CHAPTER } from '../constant/messages';
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
import { Content, ContentBlockStyle, focus, newContent, Side } from './contentControl';
import { createWTCDErrorMessage } from './createWTCDErrorMessage';
import { createWTCDErrorMessageFromError } from './createWTCDErrorMessageFromError';
import { updateHistory } from './history';
import { Layout, setLayout } from './layoutControl';
import { isAnyModalOpened } from './modalControl';
import { processElements } from './processElements';
import { WTCDGameReaderUI } from './WTCDGameReaderUI';

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
  const loadingBlock = content.addBlock({
    initElement: h('.content') as HTMLDivElement,
  });

  setLayout(Layout.MAIN);

  loadingBlock.element.innerText = loadingText;
  chaptersCache.get(chapterHtmlRelativePath).then(text => {
    if (content.isDestroyed) {
      debugLogger.log('Chapter loaded, but abandoned since the original ' +
        'content page is already destroyed.');
      return;
    }
    debugLogger.log('Chapter loaded.');

    loadingBlock.directRemove();
    const mainBlock = insertContent(content, text, chapterCtx.chapter) || content.addBlock();

    state.chapterTextNodes = getTextNodes(mainBlock.element);
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
    mainBlock.element.appendChild(h('div.page-switcher', [
      // 上一章
      (prevChapter !== undefined && canChapterShown(prevChapter))
        ? h('a.to-prev', {
          href: window.location.pathname + '#' + prevChapter.htmlRelativePath,
          onclick: (event: MouseEvent) => {
            event.preventDefault();
            loadPrevChapter();
          },
        }, PREVIOUS_CHAPTER)
        : null,

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
        : null,
    ]));

    // Re-focus the rect so it is arrow-scrollable
    setTimeout(() => {
      focus();
    }, 1);
    loadComments(content, chapterCtx.chapter.commentsUrl);
  })
  .catch(error => {
    debugLogger.error(`Failed to load chapter.`, error);
    loadingBlock.element.innerText = CHAPTER_FAILED;
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
  if (isAnyModalOpened()) {
    return;
  }
  if (arrowKey === ArrowKey.LEFT) {
    loadPrevChapter();
  } else if (arrowKey === ArrowKey.RIGHT) {
    loadNextChapter();
  }
});

escapeKeyPressEvent.on(() => {
  if (isAnyModalOpened()) {
    return;
  }
  closeChapter();
  updateHistory(true);
});

export enum ErrorType {
  COMPILE,
  RUNTIME,
  INTERNAL,
}

function insertContent(content: Content, text: string, chapter: Chapter) {
  switch (chapter.type) {
    case 'Markdown':
      const block = content.addBlock();
      block.element.innerHTML = text;
      processElements(block.element);
      return block;
    case 'WTCD': {
      const wtcdParseResult: WTCDParseResult = JSON.parse(text);
      if (wtcdParseResult.error === true) {
        content.addBlock({
          initElement: createWTCDErrorMessage({
            errorType: ErrorType.COMPILE,
            message: wtcdParseResult.message,
            internalStack: wtcdParseResult.internalStack,
          }),
        });
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
          const $wtcdContainer = content.addBlock().element;
          flowReader.renderTo($wtcdContainer);
          break;
        }
        case 'game': {
          new WTCDGameReaderUI(
            content,
            chapter.htmlRelativePath,
            wtcdParseResult.wtcdRoot,
          ).start();
          break;
        }
      }
    }
  }
}
