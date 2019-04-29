import { Folder } from '../Data';
import { loadChapter } from './chapterControl';
import { data } from './data';
import { updateHistory } from './history';
import { Menu } from './Menu';

export class ChaptersMenu extends Menu {
  public constructor(parent: Menu, folder?: Folder) {
    if (folder === undefined) {
      folder = data.chapterTree;
    }
    super(folder.isRoot ? '章节选择' : folder.displayName, parent);
    for (const subfolder of folder.subfolders) {
      const handle = this.addLink(new ChaptersMenu(this, subfolder), true);
      handle.addClass('folder');
    }
    const lastRead = window.localStorage.getItem('lastRead');
    for (const chapter of folder.chapters) {
      const handle = this.addItem(chapter.displayName, { small: true, button: true })
        .onClick((element: HTMLDivElement | HTMLAnchorElement) => {
          for (const $element of Array.from(document.getElementsByClassName('last-read'))) {
            $element.classList.remove('last-read');
          }
          element.classList.add('last-read');
          loadChapter(chapter.htmlRelativePath);
          updateHistory(true);
        });
      if (chapter.isEarlyAccess) {
        handle.setInnerText(`[编写中] ${chapter.displayName}`);
        handle.addClass('early-access');
      }
      if (lastRead !== undefined && lastRead === chapter.htmlRelativePath) {
        handle.addClass('last-read');
      }
    }
  }
}
