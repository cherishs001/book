import { copy, ensureDir, readdir, readFile, writeFile } from 'fs-extra';
import * as MDI from 'markdown-it';
import { resolve } from 'path';
import { countChars } from './countChars';
import { countParagraphs } from './countParagraphs';

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
  const splitStr = ' - ';
  const nameSplitter = (fileName: string) => {
    if (fileName.includes(splitStr)) {
      return [fileName, fileName.split(splitStr) as [string, string]];
    }
    return [fileName, [fileName, '章节 ' + fileName]];
  };
  const chapters = (await readdir(chaptersDir))
    .filter(name => name.endsWith('.md'))
    .map(name => name.substr(0, name.length - 3))
    .map(nameSplitter)
    .sort((a, b) => +a[1][0] - +b[1][0]);
  const earlyAccessChapters: Array<string> = [];
  let charsCount = 0;
  let paragraphsCount = 0;
  for (const chapter of chapters) {
    const path = resolve(chaptersDir, chapter[0] + '.md');
    let content = (await readFile(path)).toString();
    if (content.startsWith(earlyAccessFlag)) {
      earlyAccessChapters.push(chapter[1][1]);
      content = content.substr(earlyAccessFlag.length);
    }
    charsCount += countChars(content);
    const output = mdi.render(content);
    paragraphsCount += countParagraphs(output);
    await writeFile(resolve(distChapters, chapter[1][1] + '.html'), output);
    console.info(`${chapter[1][1]}.html rendered.`);
  }
  const data = {
    chapters: chapters.map(info => info[1][1]),
    earlyAccessChapters,
    charsCount,
    paragraphsCount,
    buildNumber: process.env.TRAVIS_BUILD_NUMBER || 'Unoffical',
  };
  await writeFile(
    resolve(distDir, 'data.js'),
    `window.DATA=${JSON.stringify(data)};`,
  );
  console.info('data.js created.');
})();
