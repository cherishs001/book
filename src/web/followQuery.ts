import { closeChapter, loadChapter } from './chapterControl';
import { getTitle } from './history';
import { state } from './state';

export function followQuery() {
  if (typeof URLSearchParams !== 'function') {
    return;
  }
  const query = new URLSearchParams(window.location.search);
  const chapter = query.get('chapter');
  if (chapter === null) {
    if (state.currentChapter !== null) {
      closeChapter();
      document.title = getTitle();
    }
    return;
  }
  if (state.currentChapter !== chapter) {
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
}
