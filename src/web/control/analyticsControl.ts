import { AutoCache } from '../data/AutoCache';
import { state } from '../data/state';
import { DebugLogger } from '../DebugLogger';
import { loadChapterEvent } from './chapterControl';

// 《可穿戴科技》统计系统
// 本系统服务端开源，并且不收集任何个人信息。
// 其存在目的仅仅是为了让琳知道有多少读者在看，以满足她的虚荣心。
//
// 服务端源代码：https://github.com/SCLeoX/wt_analytics

const analyticsUrl = 'https://wta.makai.city';

const analyticsCache = new AutoCache<string, any>(relativePath => {
  return fetch(analyticsUrl + '/count', {
    method: 'POST',
    body: relativePath,
  });
}, new DebugLogger('Analytics Cache'));

loadChapterEvent.on(chapterRelativePath => {
  // Wait for 5 seconds in order to confirm the user is still reading the same
  // chapter.
  setTimeout(() => {
    if (state.currentChapter?.chapter.htmlRelativePath !== chapterRelativePath) {
      return;
    }
    analyticsCache.get(chapterRelativePath);
  }, 5000);
});
