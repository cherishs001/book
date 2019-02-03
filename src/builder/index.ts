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
  const chapters = (await readdir(chaptersDir))
    .filter(name => name.endsWith('.md'))
    .map(name => name.substr(0, name.length - 3))
    .sort((a, b) => +a - +b);
  const earlyAccessChapters: Array<string> = [];
  let charsCount = 0;
  let paragraphsCount = 0;
  for (const chapter of chapters) {
    const path = resolve(chaptersDir, chapter + '.md');
    let content = (await readFile(path)).toString();
    if (content.startsWith(earlyAccessFlag)) {
      earlyAccessChapters.push(chapter);
      content = content.substr(earlyAccessFlag.length);
    }
    charsCount += countChars(content);
    const output = mdi.render(content);
    paragraphsCount += countParagraphs(output);
    await writeFile(resolve(distChapters, chapter + '.html'), output);
    console.info(`${chapter}.html rendered.`);
  }
  const data = {
    chapters,
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
