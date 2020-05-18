import { NativeFunction } from '../types';
import { getMaybePooled } from '../constantsPool';
import { assertArgsLength, assertArgType, NativeFunctionError } from './utils';
import { ChainedCanvas } from '../ChainedCanvas';

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
    canvas.updatePromise(async () => {
      try {
        const image = await interpreterHandle.featureProvider.loadImage(path);
        canvas.ctx.drawImage(image, x, y);
      } catch (error) {
        console.error(`WTCD failed to load image with path="${path}".`, error);
      }
    });
    return getMaybePooled('null', null);
  },
];
