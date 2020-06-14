import { BROKEN_LINK_DESC, BROKEN_LINK_OK, BROKEN_LINK_TITLE } from '../constant/messages';
import { relativePathLookUpMap } from '../data/data';
import { state } from '../data/state';
import { pages } from '../pages/pages';
import { closeChapter, loadChapter } from './chapterControl';
import { newContent, Side } from './contentControl';
import { getTitle, updateHistory } from './history';
import { Layout, setLayout } from './layoutControl';
import { notify } from './modalControl';

function followQueryToChapter(relativePath: string): boolean {
  const chapterCtx = relativePathLookUpMap.get(relativePath);
  if (chapterCtx === undefined) {
    // Cannot find chapter
    return false;
  }
  const side = (
    state.currentChapter !== null &&
    chapterCtx.inFolderIndex < state.currentChapter.inFolderIndex
  ) ? Side.LEFT : Side.RIGHT;
  if (typeof URLSearchParams !== 'function') {
    loadChapter(relativePath, undefined, side);
  } else {
    const query = new URLSearchParams(window.location.search);
    const selectionQuery = query.get('selection');
    const selection: Array<number> = selectionQuery !== null
      ? selectionQuery.split(',').map(str => +str)
      : [];
    if (selection.length !== 4 || !selection.every(
      num => (num >= 0) && (num % 1 === 0) && (!Number.isNaN(num)) && (Number.isFinite(num)),
    )) {
      loadChapter(relativePath, undefined, side);
    } else {
      loadChapter(
        relativePath,
        selection as [number, number, number, number],
        side,
      );
    }
  }
  return true;
}

function followQueryToPage(pageSpecifier: string): boolean {
  for (const page of pages) {
    if (pageSpecifier.startsWith(page.name)) {
      const content = newContent(Side.LEFT);
      setLayout(Layout.MAIN);
      return page.handler(content, pageSpecifier.substr(page.name.length));
    }
  }
  return false;
}

export function followQuery() {
  let handled = false;
  if (window.location.hash === '') {
    closeChapter();
    handled = true;
    document.title = getTitle();
    updateHistory(false);
  } else {
    const querySpecifier = decodeURIComponent(window.location.hash.substr(1)); // Ignore the # in the result
    if (!querySpecifier.startsWith('#')) {
      handled = followQueryToChapter(querySpecifier);
      document.title = getTitle();
      updateHistory(false);
    } else if (querySpecifier.startsWith('#page/')) { // Double #
      handled = followQueryToPage(querySpecifier.substr(6));
    } else {
      handled = false;
    }
  }

  if (!handled) {
    notify(BROKEN_LINK_TITLE, BROKEN_LINK_DESC, BROKEN_LINK_OK);
    document.title = getTitle();
    updateHistory(false);
  }
}
