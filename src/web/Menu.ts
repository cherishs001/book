import { DebugLogger } from './DebugLogger';
import { Event } from './Event';
import { RectMode, rectModeChangeEvent, setRectMode } from './RectMode';

export enum ItemDecoration {
  SELECTABLE,
  BACK,
}

type ItemOptions = {
  small?: true;
} & {
  html?: boolean;
} & ({
  button?: false;
} | {
  button: true;
  link?: string;
  decoration?: ItemDecoration;
});

export class ItemHandle {
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
      if (!this.menu.isActive()) {
        return;
      }
      handler(this.element);
    });
    return this;
  }
  public linkTo(targetMenu: Menu) {
    this.onClick(() => {
      this.menu.setActive(false);
      targetMenu.setActive(true);
      setRectMode(targetMenu.rectMode);
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
}

export class Menu {
  private container: HTMLDivElement;
  private active: boolean;
  private fullPath: Array<string>;
  private debugLogger: DebugLogger;
  public constructor(
    public readonly name: string,
    parent: Menu | null,
    public readonly rectMode: RectMode = RectMode.OFF,
    public readonly ignoreRectModeChange?: boolean,
  ) {
    this.debugLogger = new DebugLogger('Menu', { name });

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
      this.addItem('返回', { button: true, decoration: ItemDecoration.BACK })
        .linkTo(parent);
    }
    document.body.appendChild(this.container);

    if (!ignoreRectModeChange) {
      // 当显示模式变化时
      rectModeChangeEvent.on(({ newRectMode }) => {
        // 如果自己是当前激活的菜单并且显示模式正在变化为全屏阅读器
        if (this.active && newRectMode === RectMode.MAIN) {
          // 设置自己为非激活模式
          this.setActive(false);
          // 等待显示模式再次变化时
          rectModeChangeEvent.expect().then(() => {
            // 设置自己为激活模式
            this.setActive(true);
          });
        }
      });
    }
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
      $element.target = '_blank';
    } else {
      $element = document.createElement('div');
    }
    if (options.html) {
      $element.innerHTML = title;
    } else {
      $element.innerText = title;
    }
    if (options.small) {
      $element.classList.add('small');
    }
    if (options.button) {
      $element.classList.add('button');
      if (options.decoration === ItemDecoration.BACK) {
        $element.classList.add('back');
      } else if (options.decoration === ItemDecoration.SELECTABLE) {
        $element.classList.add('selectable');
      }
    }
    this.container.appendChild($element);
    return new ItemHandle(this, $element);
  }
  protected addLink(menu: Menu, smallButton?: true): ItemHandle {
    return this.addItem(menu.name, { small: smallButton, button: true })
      .linkTo(menu);
  }
}
