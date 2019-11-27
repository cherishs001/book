import { DebugLogger } from '../DebugLogger';
import { Event } from '../Event';
import { id } from '../util/DOM';

export enum Layout {
  SIDE,
  MAIN,
  OFF,
}

const $rect = id('rect');

const debugLogger = new DebugLogger('Layout');

export const layoutChangeEvent = new Event<{
  previousLayout: Layout,
  newLayout: Layout,
}>();

let layout: Layout = Layout.OFF;
export function setLayout(newLayout: Layout) {
  debugLogger.log(`${Layout[layout]} -> ${Layout[newLayout]}`);

  if (layout === newLayout) {
    return;
  }

  if (newLayout === Layout.OFF) {
    $rect.classList.remove('reading');
  } else {
    if (layout === Layout.MAIN) {
      $rect.classList.remove('main');
    } else if (layout === Layout.SIDE) {
      $rect.classList.remove('side');
    } else {
      $rect.classList.remove('main', 'side');
      $rect.classList.add('reading');
    }
    if (newLayout === Layout.MAIN) {
      $rect.classList.add('main');
    } else {
      $rect.classList.add('side');
    }
  }
  layoutChangeEvent.emit({
    previousLayout: layout,
    newLayout,
  });
  layout = newLayout;
}
