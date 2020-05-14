export interface Node {
  displayName: string;
  displayIndex: number;
  name: string;
  sourceRelativePath: string;
}

export type ChapterType =
  | 'Markdown' // Markdown based static chapter
  | 'WTCD';   // WTCD based interactive chapter

export interface ChapterBase extends Node {
  type: ChapterType;
  isEarlyAccess: boolean;
  htmlRelativePath: string;
  chapterCharCount: number;
}

export interface MarkdownChapter extends ChapterBase {
  type: 'Markdown';
}

export type WTCDReader =
  | 'flow'
  | 'game';

export interface WTCDChapter extends ChapterBase {
  type: 'WTCD';
  preferredReader: WTCDReader;
}

export type Chapter = MarkdownChapter | WTCDChapter;

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
