export interface Node {
  displayName: string;
  displayIndex: number;
  name: string;
  sourceRelativePath: string;
}

export type ChapterType
  = 'Markdown' // Markdown based static chapter
  | 'WTCD';   // WTCD based interactive chapter

export interface Chapter extends Node {
  type: ChapterType;
  isEarlyAccess: boolean;
  commentsUrl: string | null;
  htmlRelativePath: string;
  chapterCharCount: number;
}

export interface Folder extends Node {
  chapters: Array<Chapter>;
  subFolders: Array<Folder>;
  isRoot: boolean;
  folderCharCount: number;
}

export interface Data {
  chapterTree: Folder;
  charsCount: number;
  paragraphsCount: number;
  keywordsCount: Array<[string, number]>;
  buildNumber: string;
}
