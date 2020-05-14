import { ChapterFlags, ChapterFlagsMapped } from '../Data';

const markdownFlags = new Map<string, ChapterFlags>([
  ['# 编写中', 'isEarlyAccess'],
  ['# 隐藏', 'hidden'],
]);

export function readMarkdownFlags(markdown: string): [string, ChapterFlagsMapped] {
  const flagsMapped: ChapterFlagsMapped = {} as ChapterFlagsMapped;
  for (const flag of markdownFlags.values()) {
    flagsMapped[flag] = false;
  }
  let changed;
  do {
    changed = false;
    markdown = markdown.trimLeft();
    for (const [keyword, flag] of markdownFlags) {
      if (markdown.startsWith(keyword)) {
        changed = true;
        flagsMapped[flag] = true;
        markdown = markdown.substr(keyword.length);
      }
    }
  } while (changed);
  return [markdown, flagsMapped];
}
