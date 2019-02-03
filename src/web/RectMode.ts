import { id } from './DOM';

export enum RectMode {
  SIDE,
  MAIN,
  OFF,
}

const $rect = id('rect');

let rectMode: RectMode = RectMode.OFF;
export function setRectMode(newRectMode: RectMode) {
  // console.info(`${RectMode[rectMode]} -> ${RectMode[newRectMode]}`);
  if (rectMode === newRectMode) {
    return;
  }
  if (newRectMode === RectMode.OFF) {
    $rect.classList.remove('reading');
  } else {
    if (rectMode === RectMode.MAIN) {
      $rect.classList.remove('main');
    } else if (rectMode === RectMode.SIDE) {
      $rect.classList.remove('side');
    } else {
      $rect.classList.remove('main', 'side');
      $rect.classList.add('reading');
    }
    if (newRectMode === RectMode.MAIN) {
      $rect.classList.add('main');
    } else {
      $rect.classList.add('side');
    }
  }
  rectMode = newRectMode;
}
