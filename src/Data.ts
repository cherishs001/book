export interface Node {
  displayName: string;
  displayIndex: number;
  name: string;
  sourceRelativePath: string;
}

export interface Chapter extends Node {
  isEarlyAccess: boolean;
  htmlRelativePath: string;
}

export interface Folder extends Node {
  chapters: Array<Chapter>;
  subfolders: Array<Folder>;
  isRoot: boolean;
}

export interface Data {
  chapterTree: Folder;
  charsCount: number;
  paragraphsCount: number;
  keywordsCount: Array<[string, number]>;
  buildNumber: string;
}
