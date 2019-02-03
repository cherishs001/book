import { loadChapter } from './chapterControl';
import { data } from './data';
import { updateHistory } from './history';
import { Menu } from './Menu';

export class ChaptersMenu extends Menu {
  public constructor(parent: Menu) {
    super('章节选择', parent);
    for (const chapter of data.chapters) {
      this.addItem(`章节 ${chapter}`, { small: true, button: true })
        .onClick(() => {
          loadChapter(chapter);
          updateHistory(true);
        });
    }
  }
}
