import { RectMode, setRectMode } from './RectMode';

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
    private element: HTMLDivElement | HTMLAnchorElement,
  ) {}
  public setSelected(selected: boolean) {
    this.element.classList.toggle('selected', selected);
    return this;
  }
  public onClick(handler: () => void) {
    this.element.addEventListener('click', () => {
      if (!this.menu.isActive()) {
        return;
      }
      handler();
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
  public constructor(
    public readonly name: string,
    parent: Menu | null,
    public readonly rectMode: RectMode = RectMode.OFF,
  ) {
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
  }
  public onActive() { /* Override */ }
  public setActive(active: boolean) {
    if (!this.active && active) {
      this.onActive();
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
