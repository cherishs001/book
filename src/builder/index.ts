import { copy, ensureDir, mkdirp, readdir, readFile, stat, writeFile } from 'fs-extra';
import * as MDI from 'markdown-it';
import { basename, dirname, relative, resolve } from 'path';
import { Chapter, Data, Folder, Node } from '../Data';
import { countCertainWord } from './countCertainWord';
import { countChars } from './countChars';
import { countParagraphs } from './countParagraphs';
import { keywords } from './keywords';

const earlyAccessFlag = '# 编写中';

(async () => {
  const rootDir = resolve(__dirname, '../..');
  const staticDir = resolve(rootDir, 'static');
  const chaptersDir = resolve(rootDir, 'chapters');
  const distDir = resolve(rootDir, 'dist');
  const distChapters = resolve(distDir, 'chapters');

  await ensureDir(distChapters);

  // Copy static
  await copy(staticDir, distDir);
  console.info('Static copied.');

  // Render chapters
  const mdi = new MDI();

  const chapterDefaultNamer = (displayIndex: number) => `第 ${displayIndex} 章`;
  const folderDefaultNamer = (displayIndex: number) => `新建文件夹（${displayIndex}）`;

  // Get basic displayName, displayIndex, name, relativePath from a full path
  function destructPath(fullPath: string, isFolder: boolean): Node {
    const relativePath = relative(chaptersDir, fullPath);
    let name = basename(relativePath);
    // Remove extension
    if (!isFolder) {
      name = name.substr(0, name.lastIndexOf('.'));
    }
    const split = name.split(' - ');
    const displayIndex = +split[0];
    let displayName: string;
    if (split.length === 1) {
      // No specified display name
      displayName = (isFolder ? folderDefaultNamer : chapterDefaultNamer)(displayIndex);
    } else {
      displayName = split[1];
    }
    return {
      displayName,
      displayIndex,
      name,
      sourceRelativePath: relativePath,
    };
  }

  let charsCount = 0;
  let paragraphsCount = 0;
  const keywordsCount: Map<string, number> = new Map();
  keywords.forEach(keyword => {
    keywordsCount.set(keyword, 0);
  });

  async function loadChapter(path: string, parentHtmlRelativePath: string): Promise<Chapter> {
    let markdown = (await readFile(path)).toString();
    let isEarlyAccess = false;
    if (markdown.startsWith(earlyAccessFlag)) {
      isEarlyAccess = true;
      markdown = markdown.substr(earlyAccessFlag.length);
    }
    charsCount += countChars(markdown);

    keywords.forEach(keyword => {
      const count = countCertainWord(markdown, keyword);
      if (count !== 0) {
        keywordsCount.set(keyword, keywordsCount.get(keyword)! + count);
      }
    });

    const output = mdi.render(markdown);
    paragraphsCount += countParagraphs(output);

    const node = destructPath(path, false);

    const htmlRelativePath = ((parentHtmlRelativePath + '/').substr(1) /* Remove "/" in the beginning */ + node.displayName + '.html').split(' ').join('-');

    const htmlPath = resolve(distChapters, htmlRelativePath);

    await mkdirp(dirname(htmlPath));

    await writeFile(htmlPath, output);
    console.info(`${node.sourceRelativePath} (${node.displayName}) rendered to ${htmlPath}.`);

    return {
      ...node,
      isEarlyAccess,
      htmlRelativePath,
    };
  }

  interface HasDisplayIndex {
    displayIndex: number;
  }
  function byDisplayIndex(a: HasDisplayIndex, b: HasDisplayIndex) {
    return a.displayIndex - b.displayIndex;
  }

  async function loadFolder(path: string, parentHtmlRelativePath: string, isRoot: boolean): Promise<Folder> {
    const node = destructPath(path, true);
    const htmlRelativePath = isRoot ? '' : (parentHtmlRelativePath + '/' + node.displayName);
    const names = await readdir(path);
    // Collect all promises created for loading subdirs
    const subDirsLoadingPromises: Array<Promise<Folder>> = [];
    const chaptersLoadingPromises: Array<Promise<Chapter>> = [];
    for (const name of names) {
      const subpath = resolve(path, name);
      const isDirectory = (await stat(subpath)).isDirectory();
      if (isDirectory) {
        subDirsLoadingPromises.push(loadFolder(subpath, htmlRelativePath, false));
      } else {
        // Ignore backup files created by text editors
        if (!subpath.endsWith('.md')) {
          continue;
        }
        chaptersLoadingPromises.push(loadChapter(subpath, htmlRelativePath));
      }
    }

    return {
      ...node,
      isRoot,
      chapters: (await Promise.all(chaptersLoadingPromises)).sort(byDisplayIndex),
      subfolders: (await Promise.all(subDirsLoadingPromises)).sort(byDisplayIndex),
    };
  }

  const data: Data = {
    chapterTree: await loadFolder(chaptersDir, '', true),
    charsCount,
    paragraphsCount,
    keywordsCount: [...keywordsCount].sort((a, b) => b[1] - a[1]),
    buildNumber: process.env.TRAVIS_BUILD_NUMBER || 'Unoffical',
  };
  await writeFile(
    resolve(distDir, 'data.js'),
    `window.DATA=${JSON.stringify(data, null, 2)};`,
  );
  console.info('data.js created.');
})();
