import { hideComments } from './commentsControl';
import { id } from './DOM';
import { ItemDecoration, ItemHandle, Menu } from './Menu';
import { RectMode } from './RectMode';
import { stylePreviewArticle } from './stylePreviewArticle';

interface StyleDef {
  readonly rectBgColor: string;
  readonly paperBgColor: string;
  readonly textColor: string;
  readonly linkColor: string;
  readonly linkHoverColor: string;
  readonly linkActiveColor: string;
  readonly commentColor: string;

  readonly keyIsDark: boolean;

  readonly contentBlockEarlyAccessColor: string;
}

class Style {
  public static currentlyEnabled: Style | null = null;
  private styleSheet: StyleSheet | null = null;
  public itemHandle: ItemHandle;
  public constructor(
    public readonly name: string,
    public readonly def: StyleDef,
  ) {}
  private injectStyleSheet() {
    const $style = document.createElement('style');
    document.head.appendChild($style);
    const sheet = $style.sheet as CSSStyleSheet;
    sheet.disabled = true;
    sheet.insertRule(`.rect.reading { background-color: ${this.def.rectBgColor}; }`);
    sheet.insertRule(`.rect.reading>div { background-color: ${this.def.paperBgColor}; }`);
    sheet.insertRule(`.rect.reading>div { color: ${this.def.textColor}; }`);
    sheet.insertRule(`.rect.reading>.content a { color: ${this.def.linkColor}; }`);
    sheet.insertRule(`.rect.reading>.content a:visited { color: ${this.def.linkColor}; }`);
    sheet.insertRule(`.rect.reading>.content a:hover { color: ${this.def.linkHoverColor}; }`);
    sheet.insertRule(`.rect.reading>.content a:active { color: ${this.def.linkActiveColor}; }`);
    sheet.insertRule(`.rect.reading>.content>.earlyAccess.block { background-color: ${this.def.contentBlockEarlyAccessColor}; }`);
    sheet.insertRule(`.rect>.comments>div { background-color: ${this.def.commentColor}; }`);

    const key = this.def.keyIsDark ? 'black' : 'white';
    sheet.insertRule(`.rect>.comments>.create-comment::before { background-color: ${key}; }`);

    this.styleSheet = sheet;
  }
  public active() {
    if (Style.currentlyEnabled !== null) {
      const currentlyEnabled = Style.currentlyEnabled;
      if (currentlyEnabled.styleSheet !== null) {
        currentlyEnabled.styleSheet.disabled = true;
      }
      currentlyEnabled.itemHandle.setSelected(false);
    }
    if (this.styleSheet === null) {
      this.injectStyleSheet();
    }
    this.styleSheet!.disabled = false;
    this.itemHandle.setSelected(true);
    window.localStorage.setItem('style', this.name);
    Style.currentlyEnabled = this;
  }
}

const styles = [
  new Style('默认', {
    rectBgColor: '#EFEFED',
    paperBgColor: '#FFF',
    textColor: '#000',
    linkColor: '#00E',
    linkHoverColor: '#00E',
    linkActiveColor: '#00C',
    contentBlockEarlyAccessColor: '#FFE082',
    commentColor: '#F5F5F5',

    keyIsDark: true,
  }),
  new Style('夜间', {
    rectBgColor: '#272B36',
    paperBgColor: '#38404D',
    textColor: '#DDD',
    linkColor: '#55E',
    linkHoverColor: '#55E',
    linkActiveColor: '#33C',
    contentBlockEarlyAccessColor: '#E65100',
    commentColor: '#272B36',

    keyIsDark: false,
  }),
  new Style('羊皮纸', {
    rectBgColor: '#D8D4C9',
    paperBgColor: '#F8F4E9',
    textColor: '#552830',
    linkColor: '#00E',
    linkHoverColor: '#00E',
    linkActiveColor: '#00C',
    contentBlockEarlyAccessColor: '#FFE082',
    commentColor: '#F9EFD7',

    keyIsDark: true,
  }),
  new Style('可穿戴科技', {
    rectBgColor: '#444',
    paperBgColor: '#333',
    textColor: '#DDD',
    linkColor: '#66F',
    linkHoverColor: '#66F',
    linkActiveColor: '#44D',
    contentBlockEarlyAccessColor: '#E65100',
    commentColor: '#444',

    keyIsDark: false,
  }),
  new Style('巧克力', {
    rectBgColor: '#2C1C11',
    paperBgColor: '#3E2519',
    textColor: '#CD9F89',
    linkColor: '#66F',
    linkHoverColor: '#66F',
    linkActiveColor: '#44D',
    contentBlockEarlyAccessColor: '#E65100',
    commentColor: '#2C1C11',

    keyIsDark: false,
  }),
];

export class StyleMenu extends Menu {
  public constructor(parent: Menu) {
    super('阅读器样式', parent, RectMode.SIDE);
    for (const style of styles) {
      style.itemHandle = this.addItem(style.name, { small: true, button: true, decoration: ItemDecoration.SELECTABLE })
        .onClick(() => {
          style.active();
        });
    }
    const usedStyle = window.localStorage.getItem('style');
    let flag = false;
    for (const style of styles) {
      if (usedStyle === style.name) {
        style.active();
        flag = true;
        break;
      }
    }
    if (!flag) {
      styles[0].active();
    }
  }
  public onActive() {
    hideComments();
    id('content').innerHTML = stylePreviewArticle;
  }
}
