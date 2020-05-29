export interface Node {
  displayName: string;
  displayIndex: number;
  name: string;
  sourceRelativePath: string;
}

export type ChapterType =
  | 'Markdown' // Markdown based static chapter
  | 'WTCD';   // WTCD based interactive chapter

export interface ChapterFlagsMapped {
  isEarlyAccess: boolean;
  hidden: boolean;
}

export type ChapterFlags = keyof ChapterFlagsMapped;

export interface ChapterBase extends Node, ChapterFlagsMapped {
  type: ChapterType;
  htmlRelativePath: string;
  chapterCharCount: number;
}

export interface MarkdownChapter extends ChapterBase {
  type: 'Markdown';
}

export type WTCDReader =
  | 'flow'
  | 'game';

export interface WTCDChapterBase extends ChapterBase {
  type: 'WTCD';
  preferredReader: WTCDReader;
}

export interface WTCDChapterFlow extends WTCDChapterBase {
  preferredReader: 'flow';
}

export interface WTCDChapterGame extends WTCDChapterBase {
  preferredReader: 'game';
  slideAnimation: boolean;
}

export type WTCDChapter = WTCDChapterFlow | WTCDChapterGame;

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
