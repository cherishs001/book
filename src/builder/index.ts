import { copy, ensureDir, readFile, writeFile } from 'fs-extra';
import { join, resolve } from 'path';
import { Data, Folder } from '../Data';
import { chaptersDir, distChaptersDir, distDir, rootDir, staticDir } from './dirs';
import { fPath, log } from './indentConsole';
import { LoaderContext } from './LoaderContext';
import { load } from './loaders/Loader';
import { Stats } from './Stats';
import yargs = require('yargs');

const argv = yargs.options({
  production: { type: 'boolean', default: false },
}).argv;

(async () => {
  const startTime = Date.now();

  await ensureDir(distChaptersDir);

  // Copy static
  await copy(staticDir, distDir);
  const indexPath = resolve(distDir, 'index.html');
  const nowTime = new Date().getTime();
  let result = await readFile(indexPath, 'utf8');
  result = result.replace(new RegExp('js" defer>', 'g'), 'js?v=' + nowTime + '" defer>');
  result = result.replace(new RegExp('css">', 'g'), 'css?v=' + nowTime + '">');
  await writeFile(indexPath, result, 'utf8');
  log('[[green|Static copied.]]');

  const stats = new Stats(argv.production);

  const rootLoaderCtx = new LoaderContext(
    true,
    chaptersDir,
    '',
    stats,
    argv.production,
  );

  const data: Data = {
    chapterTree: await load(rootLoaderCtx)! as Folder,
    charsCount: argv.production ? stats.getCharsCount() : null,
    paragraphsCount: stats.getParagraphCount(),
    keywordsCount: [...stats.getKeywordsCount()].sort((a, b) => b[1] - a[1]),
    buildNumber: process.env.TRAVIS_BUILD_NUMBER || 'Unoffical',
    authorsInfo: JSON.parse(await readFile(join(rootDir, 'authors.json'), 'utf8')),
    buildError: rootLoaderCtx.getErrors().length > 0,
  };
  await writeFile(
    resolve(distDir, 'data.js'),
    `window.DATA=${JSON.stringify(data, null, argv.production ? 0 : 2)};`,
  );
  log('[[green|data.js created.]]');
  log(`[[green|Time spent: [[yellow|${Date.now() - startTime}ms]].]]`);

  if (rootLoaderCtx.getErrors().length !== 0) {
    const errors = rootLoaderCtx.getErrors();
    log();
    errors.forEach(error => {
      log(`[[red|Error caused by loader [[yellow|${error.loaderName}]] on file [[yellow|${fPath(error.path)}]]:]]`);
      console.info(error.error);
      log();
    });
    process.exit(1);
  }
})();
