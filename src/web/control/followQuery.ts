import { relativePathLookUpMap } from '../data/data';
import { state } from '../data/state';
import { closeChapter, loadChapter } from './chapterControl';
import { Side } from './contentControl';
import { getTitle, updateHistory } from './history';

export function followQuery() {
  const chapterHtmlRelativePath = decodeURIComponent(window.location.hash.substr(1)); // Ignore the # in the result
  const chapterCtx = relativePathLookUpMap.get(chapterHtmlRelativePath);
  if (chapterCtx === undefined) {
    if (state.currentChapter !== null) {
      closeChapter();
      document.title = getTitle();
    }
  } else if (state.currentChapter !== chapterCtx) {
    const side = (
      state.currentChapter !== null &&
      chapterCtx.inFolderIndex > state.currentChapter.inFolderIndex
    ) ? Side.RIGHT : Side.LEFT;
    if (typeof URLSearchParams !== 'function') {
      loadChapter(chapterHtmlRelativePath, undefined, side);
    } else {
      const query = new URLSearchParams(window.location.search);
      const selectionQuery = query.get('selection');
      const selection: Array<number> = selectionQuery !== null
        ? selectionQuery.split(',').map(str => +str)
        : [];
      if (selection.length !== 4 || !selection.every(
        num => (num >= 0) && (num % 1 === 0) && (!Number.isNaN(num)) && (Number.isFinite(num)),
      )) {
        loadChapter(chapterHtmlRelativePath, undefined, side);
      } else {
        loadChapter(
          chapterHtmlRelativePath,
          selection as [number, number, number, number],
          side,
        );
      }
      document.title = getTitle();
    }
  }
  updateHistory(false);
}
