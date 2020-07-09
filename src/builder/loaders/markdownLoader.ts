import { mkdirp, writeFile } from 'fs-extra';
import { dirname } from 'path';
import { ChapterFlags, ChapterFlagsMapped, MarkdownChapter, AuthorRole } from '../../Data';
import { LoaderContext } from '../LoaderContext';
import { Loader } from './Loader';
import {log, fPath} from '../indentConsole';
import { parseAuthorSpecifier } from './parseAuthorSpecifier';


const markdownFlags = new Map<string, ChapterFlags>([
  ['# 编写中', 'isEarlyAccess'],
  ['# 隐藏', 'hidden'],
]);

function readMarkdownFlags(markdown: string): [string, ChapterFlagsMapped] {
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

export const markdownLoader: Loader = {
  name: 'Markdown Loader',
  async canLoad(ctx: LoaderContext) {
    return !ctx.isDirectory && ctx.path.endsWith('.md');
  },
  async load(ctx: LoaderContext): Promise<MarkdownChapter> {
    let markdown = (await ctx.readFile()).trimLeft();
    let authors: Array<AuthorRole> = [];

    if (markdown.startsWith('作者：')) {
      const authorSpecifier = markdown.substring(3, markdown.indexOf('\n')).trim();
      markdown = markdown.substr(markdown.indexOf('\n'));
      authors = parseAuthorSpecifier(authorSpecifier);
    }

    let chapterFlagsMapped: ChapterFlagsMapped;
    [markdown, chapterFlagsMapped] = readMarkdownFlags(markdown);
    const chapterCharCount = ctx.stats.processMarkdown(markdown);

    const node = ctx.getNode();
    log(`[[green|Use display name [[yellow|${fPath(node.displayName)}]].]]`);
    ctx.setDistFileName(node.displayName + '.html');
    const mdi = ctx.createMDI();
    const output = mdi.render(markdown);

    ctx.stats.processHtml(output);

    const htmlPath = ctx.getDistFullPath();
    await mkdirp(dirname(htmlPath));
    await writeFile(htmlPath, output);
    log(`[[green|Rendered to [[yellow|${fPath(htmlPath)}]].]]`);

    return {
      ...node,
      ...chapterFlagsMapped,
      type: 'Markdown',
      htmlRelativePath: ctx.getDistRelativePath(),
      authors,
      charsCount: chapterCharCount,
    };
  }
};
