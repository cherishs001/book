import { Chapter, Data, Folder } from '../../Data';
export const data = (window as any).DATA as Data;

export interface ChapterContext {
  folder: Folder;
  inFolderIndex: number;
  chapter: Chapter;
}

export const relativePathLookUpMap: Map<string, ChapterContext> = new Map();
function iterateFolder(folder: Folder) {
  folder.children.forEach((child, index) => {
    if (child.type === 'folder') {
      iterateFolder(child);
    } else {
      relativePathLookUpMap.set(child.htmlRelativePath, {
        folder,
        chapter: child,
        inFolderIndex: index,
      });
    }
  });
}
iterateFolder(data.chapterTree);
