import { Folder } from '../Data';
import { loadChapter } from './chapterControl';
import { data } from './data';
import { updateHistory } from './history';
import { Menu } from './Menu';
import { Cookie } from './Cookie';

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
    const lastReading = Cookie.GetCookie("LastReading");
    for (const chapter of folder.chapters) {
      const handle = this.addItem(chapter.displayName + (lastReading == null || lastReading != chapter.htmlRelativePath ? "" : "<span style='color:yellow;font-size:15px;'>上次阅读</span>"), { small: true, button: true, html: true })
        .onClick(() => {
          loadChapter(chapter.htmlRelativePath);
          updateHistory(true);
        });
      if (chapter.isEarlyAccess) {
        handle.setInnerText(`[编写中] ${chapter.displayName}`);
        handle.addClass('early-access');
      }
    }
  }
}
