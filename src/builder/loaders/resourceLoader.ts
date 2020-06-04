import { copyFile, mkdirp } from 'fs-extra';
import { basename, dirname, resolve } from 'path';
import { distChaptersDir } from '../dirs';
import { isAttachment } from '../fileExtensions';
import { fPath, log } from '../indentConsole';
import { LoaderContext } from '../LoaderContext';
import { Loader } from './Loader';

export const resourceLoader: Loader = {
  name: 'Resource Loader',
  async canLoad(ctx: LoaderContext) {
    return !ctx.isDirectory && isAttachment(ctx.path);
  },
  async load(ctx: LoaderContext): Promise<null> {
    ctx.setDistFileName(basename(ctx.path));
    const targetRelativePath = ctx.getDistRelativePath();
    const targetPath = resolve(distChaptersDir, targetRelativePath);
    await mkdirp(dirname(targetPath));
    await copyFile(ctx.path, targetPath);

    log(`[[green|Copied to [[yellow|${fPath(targetPath)}]].]]`);
    return null;
  },
};
