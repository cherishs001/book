import { Node } from '../../Data';
import { dedent, indent, log, fPath } from '../indentConsole';
import { LoaderContext } from '../LoaderContext';
import { folderLoader } from './folderLoader';
import { markdownLoader } from './markdownLoader';
import { resourceLoader } from './resourceLoader';
import { wtcdLoader } from './wtcdLoader';

export interface Loader {
  name: string;
  canLoad(ctx: LoaderContext): Promise<boolean>;
  load(ctx: LoaderContext): Promise<Node | null>;
}

const loaders: Array<Loader> = [
  folderLoader,
  markdownLoader,
  wtcdLoader,
  resourceLoader,
];

export async function load(ctx: LoaderContext) {
  for (const loader of loaders) {
    if (await loader.canLoad(ctx)) {
      log(`[[green|Load [[yellow|${fPath(ctx.path)}]] with [[yellow|${loader.name}]].]]`);
      let result;
      indent();
      try {
        result = await loader.load(ctx);
      } catch (error) {
        ctx.pushError({
          loaderName: loader.name,
          path: ctx.path,
          error,
        });
        return null;
      } finally {
        dedent();
      }
      return result;
    }
  }
  return null;
}
