import { animation } from '../data/settings';
import { h } from '../hs';
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
  public constructor() {
    const $content = document.createElement('div');
    $content.classList.add('content');
    $contentContainer.appendChild($content);
    this.element = $content;
  }
  public addBlock(opts: ContentBlockOpts = {}) {
    const block = new ContentBlock(this, opts);
    this.blocks.push(block);
    return block;
  }
  public destroy() {
    this.isDestroyed = true;
    this.element.remove();
  }
}

interface ContentBlockOpts {
  initElement?: HTMLDivElement;
  style?: ContentBlockStyle;
  slidable?: boolean;
}

class ContentBlock {
  private slideContainer: HTMLDivElement | null = null;
  private heightHolder: HTMLDivElement | null = null;
  private sliding: number = 0;
  public element: HTMLDivElement;
  public constructor(
    content: Content,
    {
      initElement = new HTMLDivElement(),
      style = ContentBlockStyle.REGULAR,
      slidable = false,
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
      content.element.appendChild(this.slideContainer);
    } else {
      content.element.appendChild(initElement);
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
  public slideReplace($newElement: HTMLDivElement = new HTMLDivElement()) {
    const $container = this.slideContainer;
    if ($container === null) {
      throw new Error('Content block is not slidable.');
    }
    this.sliding++;
    $container.classList.add('in-transition');
    $newElement.classList.add('content-block');

    const $oldElement = this.element;

    $newElement.classList.add('right');
    $container.prepend($newElement);
    const newHeight = $newElement.offsetHeight; // This also forces reflow
    $newElement.classList.remove('right');

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
