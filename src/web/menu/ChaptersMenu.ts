import { ChapterType, Folder } from '../../Data';
import { loadChapter, loadChapterEvent } from '../control/chapterControl';
import { updateHistory } from '../control/history';
import { data } from '../data/data';
import { ItemDecoration, ItemHandle, Menu } from '../Menu';
import { shortNumber } from '../util/shortNumber';

const chapterSelectionButtonsMap: Map<string, ItemHandle> = new Map();
let currentLastReadLabelAt: HTMLSpanElement | null = null;

function attachLastReadLabelTo(button: ItemHandle | undefined) {
  if (button === undefined) {
    return;
  }
  currentLastReadLabelAt = button.append('[上次阅读]');
}

loadChapterEvent.on(newChapterHtmlRelativePath => {
  if (currentLastReadLabelAt !== null) {
    currentLastReadLabelAt.remove();
  }
  attachLastReadLabelTo(chapterSelectionButtonsMap.get(newChapterHtmlRelativePath));
});

function getDecorationForChapterType(chapterType: ChapterType) {
  switch (chapterType) {
    case 'Markdown': return ItemDecoration.ICON_FILE;
    case 'WTCD': return ItemDecoration.ICON_GAME;
  }
}

export function isEmptyFolder(folder: Folder) {
  if (folder.chapters.length !== 0) {
    return false;
  }
  return folder.subFolders.every(isEmptyFolder);
}

export class ChaptersMenu extends Menu {
  public constructor(parent: Menu, folder?: Folder) {
    if (folder === undefined) {
      folder = data.chapterTree;
    }
    super(folder.isRoot ? '章节选择' : folder.displayName, parent);
    for (const subfolder of folder.subFolders) {
      if (isEmptyFolder(subfolder)) {
        continue;
      }
      const handle = this.addLink(new ChaptersMenu(this, subfolder), true, ItemDecoration.ICON_FOLDER);
      handle.append(`[${shortNumber(subfolder.folderCharCount)}]`, 'char-count');
    }
    for (const chapter of folder.chapters) {
      if (chapter.hidden) {
        continue;
      }
      const handle = this.addItem(chapter.displayName, {
        small: true,
        button: true,
        decoration: getDecorationForChapterType(chapter.type),
      })
        .onClick(() => {
          loadChapter(chapter.htmlRelativePath);
          updateHistory(true);
        });
      if (chapter.isEarlyAccess) {
        handle.prepend('[编写中]');
        handle.addClass('early-access');
      }
      handle.append(`[${shortNumber(chapter.chapterCharCount)}]`, 'char-count');

      const lastRead = window.localStorage.getItem('lastRead');
      if (lastRead === chapter.htmlRelativePath) {
        attachLastReadLabelTo(handle);
      }

      chapterSelectionButtonsMap.set(chapter.htmlRelativePath, handle);
    }
  }
}
