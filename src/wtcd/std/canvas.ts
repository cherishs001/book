import { NativeFunction } from '../types';
import { getMaybePooled } from '../constantsPool';
import { assertArgsLength, assertArgType, NativeFunctionError } from './utils';
import { ChainedCanvas } from '../ChainedCanvas';

class ImageCache {
  private map = new Map<string, Promise<HTMLImageElement>>();
  private loader(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = document.createElement('img');
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Failed to load ${url}.`));
      image.src = url;
    });

  }
  public delete(key: string) {
    this.map.delete(key);
  }
  public get(key: string): Promise<HTMLImageElement> {
    let value = this.map.get(key);
    if (value === undefined) {
      value = this.loader(key);
      this.map.set(key, value);
      value.catch(() => {
        this.map.delete(key);
      });
    }
    return value;
  }
}

const imageCache = new ImageCache();

export const canvasStdFunctions: Array<NativeFunction> = [
  function canvasCreate(args, interpreterHandle) {
    assertArgsLength(args, 3);
    const id = assertArgType(args, 0, 'string');
    const width = assertArgType(args, 1, 'number');
    const height = assertArgType(args, 2, 'number');
    if (interpreterHandle.canvases.has(id)) {
      throw new NativeFunctionError(`Canvas with id="${id}" already exists`);
    }
    if (width % 1 !== 0) {
      throw new NativeFunctionError(`Width (${width}) has to be an integer`);
    }
    if (width <= 0) {
      throw new NativeFunctionError(`Width (${width}) must be positive`);
    }
    if (height % 1 !== 0) {
      throw new NativeFunctionError(`Height (${height}) has to be an integer`);
    }
    if (height <= 0) {
      throw new NativeFunctionError(`Height (${height}) must be positive`);
    }
    interpreterHandle.canvases.set(id, new ChainedCanvas(width, height));
    return getMaybePooled('null', null);
  },
  function canvasOutput(args, interpreterHandle) {
    const id = assertArgType(args, 0, 'string');
    const canvas = interpreterHandle.canvases.get(id);
    if (canvas === undefined) {
      throw new NativeFunctionError(`Canvas with id="${id}" does not exist.`);
    }
    const $newCanvas = document.createElement('canvas');
    $newCanvas.width = canvas.getWidth();
    $newCanvas.height = canvas.getHeight();
    interpreterHandle.pushContent($newCanvas);
    canvas.onResolve(() => {
      if (document.body.contains($newCanvas)) {
        $newCanvas.getContext('2d')!.drawImage(canvas.canvas, 0, 0);
      }
    });
    return getMaybePooled('null', null);
  },
  function canvasClear(args, interpreterHandle) {
    const id = assertArgType(args, 0, 'string');
    const canvas = interpreterHandle.canvases.get(id);
    if (canvas === undefined) {
      throw new NativeFunctionError(`Canvas with id="${id}" does not exist.`);
    }
    canvas.updatePromise(async () => {
      canvas.ctx.clearRect(0, 0, canvas.getWidth(), canvas.getHeight());
    });
    return getMaybePooled('null', null);
  },
  function canvasPutImage(args, interpreterHandle) {
    assertArgsLength(args, 4);
    const id = assertArgType(args, 0, 'string');
    const path = assertArgType(args, 1, 'string');
    const x = assertArgType(args, 2, 'number');
    const y = assertArgType(args, 3, 'number');
    const canvas = interpreterHandle.canvases.get(id)!;
    if (canvas === undefined) {
      throw new NativeFunctionError(`Canvas with id="${id}" does not exist.`);
    }
    const url = interpreterHandle.networkController.redirect(path);
    if (url === null) {
      throw new NativeFunctionError(`Path (${path}) is not allowed.`);
    }
    const imagePromise = imageCache.get(url);
    canvas.updatePromise(async () => {
      const image = await imagePromise;
      canvas.ctx.drawImage(image, x, y);
    });
    return getMaybePooled('null', null);
  },
];
