import { animation } from '../data/settings';
import { id } from '../util/DOM';
import { getCurrentLayout, Layout } from './layoutControl';

const $contentContainer = id('content-container');

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

export function focusOnContainer() {
  $contentContainer.focus({
    // Why:
    // https://stackoverflow.com/questions/26782998/why-does-calling-focus-break-my-css-transition
    preventScroll: true,
  });
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
        }, 2000);
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
  public constructor() {
    const $content = document.createElement('div');
    $content.classList.add('content');
    $contentContainer.appendChild($content);
    this.element = $content;
  }
  public addBlock(
    $init: HTMLDivElement = document.createElement('div'),
    style: ContentBlockStyle = ContentBlockStyle.REGULAR,
  ) {
    const block = new ContentBlock(this, $init, style);
    this.blocks.push(block);
    return block;
  }
  public destroy() {
    this.isDestroyed = true;
    this.element.remove();
  }
}

class ContentBlock {
  public constructor(
    content: Content,
    public readonly element: HTMLDivElement,
    style: ContentBlockStyle,
  ) {
    element.classList.add('content-block');
    switch (style) {
      case ContentBlockStyle.WARNING:
        element.classList.add('warning');
        break;
    }
    content.element.appendChild(element);
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
}
