import { animation } from '../data/settings';
import { DebugLogger } from '../DebugLogger';
import { Event } from '../Event';
import { h } from '../hs';
import { ArrowKey, arrowKeyPressEvent } from '../input/keyboard';
import { id } from '../util/DOM';
import { getCurrentLayout, Layout } from './layoutControl';
import { MonoDimensionTransitionControl } from './MonoDimensionTransitionControl';

const $contentContainer = id('content-container');

const debugLogger = new DebugLogger('Content Control');

export enum Side {
  LEFT,
  RIGHT,
}

function setSide($element: HTMLElement, side: Side) {
  if (side === Side.LEFT) {
    $element.classList.add('left');
    $element.classList.remove('right');
  } else {
    $element.classList.add('right');
    $element.classList.remove('left');
  }
}
function otherSide(side: Side) {
  return side === Side.LEFT ? Side.RIGHT : Side.LEFT;
}
let currentContent: Content | null = null;

export function getCurrentContent() {
  return currentContent;
}

export function focus() {
  if (currentContent !== null) {
    currentContent.element.focus({
      // Why:
      // https://stackoverflow.com/questions/26782998/why-does-calling-focus-break-my-css-transition
      preventScroll: true,
    });
  }
}

/**
 * 创建一个新的 Content 并替换之前的 Content。
 *
 * @param side 如果有动画，那么入场位置。
 * @returns 创建的 Content 对象
 */
export function newContent(side: Side): Content {
  const newContent = new Content();
  if (getCurrentLayout() === Layout.OFF) {
    if (currentContent !== null) {
      currentContent.destroy();
    }
  } else {
    if (animation.getValue()) {
      // Animation is enabled
      if (currentContent !== null) {
        setSide(currentContent.element, otherSide(side));

        // Remove the content after a timeout instead of listening for
        // transition event
        const oldContent = currentContent;
        setTimeout(() => {
          oldContent.destroy();
        }, 2500);
      }
      setSide(newContent.element, side);
      // Force reflow, so transition starts now
      // tslint:disable-next-line:no-unused-expression
      newContent.element.offsetWidth;
      newContent.element.classList.remove('left', 'right');
    } else {
      if (currentContent !== null) {
        currentContent.destroy();
      }
    }
  }
  currentContent = newContent;
  return newContent;
}

export enum ContentBlockStyle {
  REGULAR,
  WARNING,
}

export class Content {
  public readonly element: HTMLDivElement;
  public isDestroyed = false;
  private readonly blocks: Array<ContentBlock> = [];
  private scrollTransition: null | MonoDimensionTransitionControl = null;
  public constructor() {
    const $content = h('div.content', { tabIndex: -1 }) as HTMLDivElement;
    $contentContainer.appendChild($content);
    this.element = $content;

    window.addEventListener('wheel', this.interruptScrolling);
    arrowKeyPressEvent.on(this.onKeyPress);
  }
  public addBlock(opts: ContentBlockOpts = {}) {
    const block = new ContentBlock(this, opts);
    this.blocks.push(block);
    return block;
  }
  public destroy() {
    this.isDestroyed = true;
    this.element.remove();
    window.removeEventListener('wheel', this.interruptScrolling);
    arrowKeyPressEvent.off(this.onKeyPress);
  }
  private onKeyPress = (key: ArrowKey) => {
    if (key === ArrowKey.UP || key === ArrowKey.DOWN) {
      this.interruptScrolling();
    }
  }
  private interruptScrolling = () => {
    if (this.scrollTransition !== null) {
      this.scrollTransition = null;
      debugLogger.log('Transition interrupted.');
    }
  }
  private scrollAnimation = () => {
    if (this.scrollTransition === null) {
      return;
    }
    const now = Date.now();
    this.element.scrollTop = this.scrollTransition.getValue(now);
    if (this.scrollTransition.isFinished(now)) {
      debugLogger.log('Transition finished.');
      this.scrollTransition = null;
    } else {
      requestAnimationFrame(this.scrollAnimation);
    }
  }
  public scrollTo(target: number) {
    if (!animation.getValue() || getCurrentLayout() === Layout.OFF) {
      debugLogger.log(`Scroll to ${target}, no animation.`);
      this.element.scrollTop = target;
      return;
    }
    if (this.scrollTransition === null) {
      debugLogger.log(`Scrolling to ${target}, new transition stared.`);
      this.scrollTransition = new MonoDimensionTransitionControl(
        this.element.scrollTop,
        20_000,
      );
      this.scrollTransition.setTarget(target);
      requestAnimationFrame(this.scrollAnimation);
    } else {
      debugLogger.log(`Scrolling to ${target}, existing transition updated.`);
      this.scrollTransition.setTarget(target);
    }
  }
}

interface ContentBlockOpts {
  initElement?: HTMLDivElement;
  style?: ContentBlockStyle;
  slidable?: boolean;
  prepend?: boolean;
}

export class ContentBlock {
  private slideContainer: HTMLDivElement | null = null;
  private heightHolder: HTMLDivElement | null = null;
  private sliding: number = 0;
  public element: HTMLDivElement;
  public constructor(
    content: Content,
    {
      initElement = h('div'),
      style = ContentBlockStyle.REGULAR,
      slidable = false,
      prepend = false,
    }: ContentBlockOpts,
  ) {
    this.element = initElement;
    initElement.classList.add('content-block');
    switch (style) {
      case ContentBlockStyle.WARNING:
        initElement.classList.add('warning');
        break;
    }
    if (slidable) {
      this.slideContainer = h('.slide-container', initElement) as HTMLDivElement;
      if (prepend) {
        content.element.prepend(this.slideContainer);
      } else {
        content.element.append(this.slideContainer);
      }
    } else {
      if (prepend) {
        content.element.prepend(initElement);
      } else {
        content.element.append(initElement);
      }
    }
  }
  public onEnteringView(callback: () => void) {
    const observer = new IntersectionObserver(entries => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        observer.disconnect();
        callback();
      }
    }, {
      root: $contentContainer,
      threshold: 0,
    });
    observer.observe(this.element);
  }
  public directRemove() {
    if (this.slideContainer !== null) {
      this.slideContainer.remove();
    } else {
      this.element.remove();
    }
  }
  public directReplace($newElement: HTMLDivElement = h('div')) {
    $newElement.classList.add('content-block');
    this.element.parentElement!.replaceChild(
      $newElement,
      this.element,
    );
    this.element = $newElement;
  }
  public slideReplace($newElement: HTMLDivElement = h('div')) {
    if (!animation.getValue()) {
      this.directReplace($newElement);
      return;
    }
    const $container = this.slideContainer;
    if ($container === null) {
      throw new Error('Content block is not slidable.');
    }
    this.sliding++;
    $container.classList.add('in-transition');
    $newElement.classList.add('content-block');
    const $oldElement = this.element;

    $newElement.classList.add('right');
    // $newElement.style.top = `${$contentContainer.scrollTop - $container.offsetTop + 30}px`;
    $container.prepend($newElement);
    const newHeight = $newElement.offsetHeight; // This also forces reflow
    $newElement.classList.remove('right');
    // $newElement.style.top = null;

    if (this.heightHolder === null) {
      this.heightHolder = h('.height-holder') as HTMLDivElement;
      this.heightHolder.style.height = `${$oldElement.offsetHeight}px`;
      $container.appendChild(this.heightHolder);
      // tslint:disable-next-line:no-unused-expression
      this.heightHolder.offsetWidth; // Forces reflow
    }
    this.heightHolder.style.height = `${newHeight}px`;

    $oldElement.classList.add('left');

    this.element = $newElement;
    setTimeout(() => {
      $oldElement.remove();
      this.sliding--;
      if (this.sliding === 0) {
        $container.classList.remove('in-transition');
        if (this.heightHolder !== null) {
          this.heightHolder.remove();
          this.heightHolder = null;
        }
      }
    }, 2500);
  }
}
