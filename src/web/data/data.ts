import { Chapter, Data, Folder, AuthorInfo } from '../../Data';
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

export const authorInfoMap: Map<string, AuthorInfo> = new Map();
for (const authorInfo of data.authorsInfo) {
  authorInfoMap.set(authorInfo.name, authorInfo);
}
