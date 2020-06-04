export interface NodeBase {
  type: NodeType;
  displayName: string;
  displayIndex: number;
  sourceRelativePath: string;
  charsCount: number;
}

export type NodeType =
  | 'folder'   // Folder
  | 'Markdown' // Markdown based static chapter
  | 'WTCD';    // WTCD based interactive chapter

export interface ChapterFlagsMapped {
  isEarlyAccess: boolean;
  hidden: boolean;
}

export type ChapterFlags = keyof ChapterFlagsMapped;

export interface ChapterBase extends NodeBase, ChapterFlagsMapped {
  htmlRelativePath: string;
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

export interface Folder extends NodeBase {
  type: 'folder';
  children: Array<Node>;
}

export type Node = Folder | Chapter;

export interface Data {
  chapterTree: Folder;
  charsCount: number;
  paragraphsCount: number;
  keywordsCount: Array<[string, number]>;
  buildNumber: string;
  buildError: boolean;
}
