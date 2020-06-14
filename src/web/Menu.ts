import { Layout, layoutChangeEvent, setLayout } from './control/layoutControl';
import { DebugLogger } from './DebugLogger';
import { Event } from './Event';

export enum ItemDecoration {
  SELECTABLE,
  BACK,
  ICON_FOLDER,
  ICON_LINK,
  ICON_EQUALIZER,
  ICON_FILE,
  ICON_GAME,
}

type ItemOptions = {
  small?: true;
  unclearable?: true;
} & ({
  button?: false;
} | {
  button: true;
  link?: string;
  decoration?: ItemDecoration;
});

function createSpan(text: string, ...classNames: Array<string>) {
  const $span = document.createElement('span');
  $span.innerText = text;
  $span.classList.add(...classNames);
  return $span;
}

export class ItemHandle {
  private $prependSpan: HTMLSpanElement | null = null;
  private $appendSpan: HTMLSpanElement | null = null;
  public constructor(
    private menu: Menu,
    public element: HTMLDivElement | HTMLAnchorElement,
  ) { }
  public setSelected(selected: boolean) {
    this.element.classList.toggle('selected', selected);
    return this;
  }
  public onClick(handler: (element?: any) => void) {
    this.element.addEventListener('click', () => {
      handler(this.element);
    });
    return this;
  }
  public linkTo(targetMenu: Menu) {
    this.onClick(() => {
      this.menu.navigateTo(targetMenu);
    });
    return this;
  }
  public setInnerText(innerText: string) {
    this.element.innerText = innerText;
    return this;
  }
  public addClass(className: string) {
    this.element.classList.add(className);
    return this;
  }
  public removeClass(className: string) {
    this.element.classList.remove(className);
    return this;
  }
  public prepend(text: string, className?: string) {
    if (this.$prependSpan === null) {
      this.$prependSpan = createSpan('', 'prepend');
      this.element.prepend(this.$prependSpan);
    }
    const $span = createSpan(text, 'item-side');
    if (className !== undefined) {
      $span.classList.add(className);
    }
    this.$prependSpan.prepend($span);
    return $span;
  }
  public append(text: string, className?: string) {
    if (this.$appendSpan === null) {
      this.$appendSpan = createSpan('', 'append');
      this.element.appendChild(this.$appendSpan);
    }
    const $span = createSpan(text, 'item-side');
    if (className !== undefined) {
      $span.classList.add(className);
    }
    this.$appendSpan.appendChild($span);
    return $span;
  }
}

export class Menu {
  private container: HTMLDivElement;
  private active = false;
  private fullPath: Array<string>;
  private clearableElements: Array<HTMLElement> = [];
  private debugLogger: DebugLogger;
  public constructor(
    public readonly name: string,
    private parent: Menu | null,
    public readonly layout: Layout = Layout.OFF,
  ) {
    this.debugLogger = new DebugLogger(`Menu (${name})`);

    this.fullPath = parent === null ? [] : parent.fullPath.slice();
    if (name !== '') {
      this.fullPath.push(name);
    }
    this.container = document.createElement('div');
    this.container.classList.add('menu', 'hidden');
    if (this.fullPath.length >= 1) {
      const path = document.createElement('div');
      path.classList.add('path');
      path.innerText = this.fullPath.join(' > ');
      this.container.appendChild(path);
    }
    if (parent !== null) {
      this.addItem('返回', { button: true, decoration: ItemDecoration.BACK, unclearable: true })
        .linkTo(parent);
    }
    document.body.appendChild(this.container);

    // 当显示模式变化时
    layoutChangeEvent.on(({ newLayout }) => {
      // 如果自己是当前激活的菜单并且显示模式正在变化为全屏阅读器
      if (this.active && newLayout === Layout.MAIN) {
        // 设置自己为非激活模式
        this.setActive(false);
        // 等待显示模式再次变化时
        layoutChangeEvent.expect().then(() => {
          // 设置自己为激活模式
          this.setActive(true);
        });
      }
    });
  }

  public navigateTo(targetMenu: Menu) {
    this.setActive(false);
    targetMenu.setActive(true);
    setLayout(targetMenu.layout);
  }

  protected exit() {
    if (this.parent === null) {
      throw new Error('Cannot exit the root menu.');
    }
    this.navigateTo(this.parent);
  }

  public activateEvent = new Event();
  public setActive(active: boolean) {
    this.debugLogger.log(`setActive(${active})`);

    if (!this.active && active) {
      this.activateEvent.emit();
    }
    this.active = active;
    this.container.classList.toggle('hidden', !active);
  }
  public isActive() {
    return this.active;
  }
  protected addItem(title: string, options: ItemOptions): ItemHandle {
    let $element: HTMLDivElement | HTMLAnchorElement;
    if (options.button && options.link !== undefined) {
      $element = document.createElement('a');
      $element.href = options.link;
      $element.rel = 'noopener noreferrer';
      if (!options.link.startsWith('#')) {
        $element.target = '_blank';
      }
    } else {
      $element = document.createElement('div');
    }
    $element.innerText = title;
    if (options.small) {
      $element.classList.add('small');
    }
    if (options.button) {
      $element.classList.add('button');
      switch (options.decoration) {
        case ItemDecoration.BACK:
          $element.classList.add('back');
          break;
        case ItemDecoration.SELECTABLE:
          $element.classList.add('selectable');
          break;
        case ItemDecoration.ICON_FOLDER:
          $element.classList.add('icon', 'folder');
          break;
        case ItemDecoration.ICON_LINK:
          $element.classList.add('icon', 'link');
          break;
        case ItemDecoration.ICON_EQUALIZER:
          $element.classList.add('icon', 'equalizer');
          break;
        case ItemDecoration.ICON_FILE:
          $element.classList.add('icon', 'file');
          break;
        case ItemDecoration.ICON_GAME:
          $element.classList.add('icon', 'game');
      }
    }
    this.container.appendChild($element);

    if (!options.unclearable) {
      this.clearableElements.push($element);
    }

    return new ItemHandle(this, $element);
  }
  protected clearItems() {
    this.clearableElements.forEach($element => $element.remove());
    this.clearableElements = [];
  }
  protected addLink(menu: Menu, smallButton?: true, decoration?: ItemDecoration): ItemHandle {
    return this.addItem(menu.name, { small: smallButton, button: true, decoration })
      .linkTo(menu);
  }
}
