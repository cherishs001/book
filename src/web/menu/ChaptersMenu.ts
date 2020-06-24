import { NodeType, Folder } from '../../Data';
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

function getDecorationForChapterType(chapterType: NodeType) {
  switch (chapterType) {
    case 'Markdown': return ItemDecoration.ICON_FILE;
    case 'WTCD': return ItemDecoration.ICON_GAME;
  }
}

export function isEmptyFolder(folder: Folder): boolean {
  return folder.children.every(child => child.type === 'folder' && isEmptyFolder(child));
}

export class ChaptersMenu extends Menu {
  public constructor(parent: Menu, folder?: Folder) {
    if (folder === undefined) {
      folder = data.chapterTree;
    }
    super(folder.sourceRelativePath === '' ? '章节选择' : folder.displayName, parent);
    for (const child of folder.children) {
      if (child.type === 'folder') {
        if (isEmptyFolder(child)) {
          continue;
        }
        const handle = this.addLink(new ChaptersMenu(this, child), true, ItemDecoration.ICON_FOLDER);
        if (child.charsCount !== null) {
          handle.append(`[${shortNumber(child.charsCount)}]`, 'char-count');
        }
      } else {
        if (child.hidden) {
          continue;
        }
        const handle = this.addItem(child.displayName, {
          small: true,
          button: true,
          decoration: getDecorationForChapterType(child.type),
        })
          .onClick(() => {
            loadChapter(child.htmlRelativePath);
            updateHistory(true);
          });
        if (child.isEarlyAccess) {
          handle.prepend('[编写中]');
          handle.addClass('early-access');
        }
        if (child.charsCount !== null) {
          handle.append(`[${shortNumber(child.charsCount)}]`, 'char-count');
        }

        const lastRead = window.localStorage.getItem('lastRead');
        if (lastRead === child.htmlRelativePath) {
          attachLastReadLabelTo(handle);
        }

        chapterSelectionButtonsMap.set(child.htmlRelativePath, handle);
      }
    }
  }
}
