import { readdir } from 'fs-extra';
import { resolve } from 'path';
import { Folder, Node } from '../../Data';
import { LoaderContext } from '../LoaderContext';
import { load, Loader } from './Loader';

interface HasDisplayIndex {
  displayIndex: number;
}
function byDisplayIndex(a: HasDisplayIndex, b: HasDisplayIndex) {
  return a.displayIndex - b.displayIndex;
}

export const folderLoader: Loader = {
  name: 'Folder Loader',
  async canLoad(ctx: LoaderContext) {
    return ctx.isDirectory;
  },
  async load(ctx: LoaderContext): Promise<Folder> {
    const node = ctx.getNode();
    ctx.setDistFileName(node.displayName);
    const names = await readdir(ctx.path);
    const children: Array<Node> = [];
    for (const name of names) {
      const child = await load(await ctx.derive(resolve(ctx.path, name)));
      if (child !== null) {
        children.push(child);
      }
    }
    children.sort(byDisplayIndex);
    return {
      ...node,
      type: 'folder',
      children,
      charsCount: children.reduce((count, node) => count += node.charsCount, 0),
    };
  },
};
