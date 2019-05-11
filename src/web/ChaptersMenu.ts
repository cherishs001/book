import { Folder } from '../Data';
import { loadChapter, loadChapterEvent } from './chapterControl';
import { data } from './data';
import { updateHistory } from './history';
import { ItemHandle, Menu } from './Menu';

const chapterSelectionButtonsMap: Map<string, ItemHandle> = new Map();
let currentLastReadLabelAt: ItemHandle | null = null;

function attachLastReadLabelTo(button: ItemHandle, htmlRelativePath: string) {
  button.addClass('last-read');
  currentLastReadLabelAt = button;
}

loadChapterEvent.on(newChapterHtmlRelativePath => {
  if (currentLastReadLabelAt !== null) {
    currentLastReadLabelAt.removeClass('last-read');
  }
  attachLastReadLabelTo(chapterSelectionButtonsMap.get(newChapterHtmlRelativePath)!, newChapterHtmlRelativePath);
});

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
    for (const chapter of folder.chapters) {
      const handle = this.addItem(chapter.displayName, { small: true, button: true })
        .onClick(() => {
          loadChapter(chapter.htmlRelativePath);
          updateHistory(true);
        });
      if (chapter.isEarlyAccess) {
        handle.setInnerText(`[编写中] ${chapter.displayName}`);
        handle.addClass('early-access');
      }

      const lastRead = window.localStorage.getItem('lastRead');
      if (lastRead === chapter.htmlRelativePath) {
        attachLastReadLabelTo(handle, chapter.htmlRelativePath);
      }

      chapterSelectionButtonsMap.set(chapter.htmlRelativePath, handle);
    }
  }
}
