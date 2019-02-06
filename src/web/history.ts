
import { state } from './state';

export function getTitle() {
  let title = '可穿戴科技';
  if (state.currentChapter !== null) {
    title += ' - ' + state.currentChapter;
  }
  return title;
}

export function updateHistory(push: boolean) {
  const method = push ? window.history.pushState : window.history.replaceState;
  let query = window.location.pathname;
  if (state.currentChapter !== null) {
    query += '?chapter=' + state.currentChapter;
    if (state.chapterSelection !== null) {
      query += `&selection=${state.chapterSelection.join(',')}`;
    }
  }
  const title = getTitle();
  document.title = title;
  method.call(window.history, null, title, query);
}
