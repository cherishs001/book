import { readdir } from 'fs-extra';
import { resolve } from 'path';
import { Folder, Node } from '../../Data';
import { LoaderContext } from '../LoaderContext';
import { load, Loader } from './Loader';

function byDisplayIndex(a: Node, b: Node) {
  const largestCommonIndex = Math.min(a.displayIndex.length, b.displayIndex.length);
  for (let i = 0; i < largestCommonIndex; i++) {
    const diff = a.displayIndex[i] - b.displayIndex[i];
    if (diff !== 0) {
      return diff;
    }
  }
  return a.displayIndex.length - b.displayIndex.length;
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
    let charsCount: number | null = 0;
    for (const child of children) {
      if (child.charsCount === null) {
        charsCount = null;
        break;
      }
      charsCount += child.charsCount;
    }
    return {
      ...node,
      type: 'folder',
      children,
      charsCount,
    };
  },
};
