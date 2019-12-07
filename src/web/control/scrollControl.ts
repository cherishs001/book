import { animation } from '../data/settings';
import { DebugLogger } from '../DebugLogger';
import { ArrowKey, arrowKeyPressEvent } from '../input/keyboard';
import { id } from '../util/DOM';
import { getCurrentLayout, Layout } from './layoutControl';
import { MonoDimensionTransitionControl } from './MonoDimensionTransitionControl';

const debugLogger = new DebugLogger('Scroll Control');

const $contentContainer = id('content-container');
let scrollTransition: null | MonoDimensionTransitionControl = null;
function interruptTransition() {
  if (scrollTransition !== null) {
    scrollTransition = null;
    debugLogger.log('Transition interrupted.');
  }
}
$contentContainer.addEventListener('wheel', () => {
  interruptTransition();
});
arrowKeyPressEvent.on(key => {
  if (key === ArrowKey.UP || key === ArrowKey.DOWN) {
    interruptTransition();
  }
});
function scrollAnimation() {
  if (scrollTransition === null) {
    return;
  }
  const now = Date.now();
  $contentContainer.scrollTop = scrollTransition.getValue(now);
  if (scrollTransition.isFinished(now)) {
    debugLogger.log('Transition finished.');
    scrollTransition = null;
  } else {
    requestAnimationFrame(scrollAnimation);
  }
}
export function scrollTo(target: number) {
  if (!animation.getValue() || getCurrentLayout() === Layout.OFF) {
    debugLogger.log(`Scroll to ${target}, no animation.`);
    $contentContainer.scrollTop = target;
    return;
  }
  if (scrollTransition === null) {
    debugLogger.log(`Scrolling to ${target}, new transition stared.`);
    scrollTransition = new MonoDimensionTransitionControl(
      $contentContainer.scrollTop,
      50_000,
    );
    scrollTransition.setTarget(target);
    requestAnimationFrame(scrollAnimation);
  } else {
    debugLogger.log(`Scrolling to ${target}, existing transition updated.`);
    scrollTransition.setTarget(target);
  }
}
