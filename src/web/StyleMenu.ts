import { hideComments } from './commentsControl';
import { DebugLogger } from './DebugLogger';
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
  private debugLogger: DebugLogger;
  public itemHandle!: ItemHandle;
  public constructor(
    public readonly name: string,
    public readonly def: StyleDef,
  ) {
    this.debugLogger = new DebugLogger('Style', { name });
  }
  private injectStyleSheet() {
    const $style = document.createElement('style');
    document.head.appendChild($style);
    const sheet = $style.sheet as CSSStyleSheet;
    sheet.disabled = true;

    const attemptInsertRule = (rule: string) => {
      try {
        sheet.insertRule(rule);
      } catch (error) {
        this.debugLogger.error(`Failed to inject rule "${rule}".`, error);
      }
    };

    attemptInsertRule(`.container { color: ${this.def.textColor}; }`);
    attemptInsertRule(`.menu { color: ${this.def.textColor}; }`);
    attemptInsertRule(`.menu .button:active::after { background-color: ${this.def.textColor}; }`);
    attemptInsertRule(`.button::after { background-color: ${this.def.textColor}; }`);
    attemptInsertRule(`body { background-color: ${this.def.paperBgColor}; }`);
    attemptInsertRule(`.rect { background-color: ${this.def.rectBgColor}; }`);

    attemptInsertRule(`.rect.reading>div { background-color: ${this.def.paperBgColor}; }`);
    attemptInsertRule(`.rect.reading>div { color: ${this.def.textColor}; }`);
    attemptInsertRule(`.rect.reading>.content a { color: ${this.def.linkColor}; }`);
    attemptInsertRule(`.rect.reading>.content a:hover { color: ${this.def.linkHoverColor}; }`);
    attemptInsertRule(`.rect.reading>.content a:active { color: ${this.def.linkActiveColor}; }`);
    attemptInsertRule(`.rect.reading>.content>.earlyAccess.block { background-color: ${this.def.contentBlockEarlyAccessColor}; }`);
    attemptInsertRule(`.rect>.comments>div { background-color: ${this.def.commentColor}; }`);
    attemptInsertRule(`@media (min-width: 901px) { ::-webkit-scrollbar-thumb { background-color: ${this.def.paperBgColor}; } }`);

    const key = this.def.keyIsDark ? 'black' : 'white';
    const keyComponent = this.def.keyIsDark ? 0 : 255;
    attemptInsertRule(`.rect>.comments>.create-comment::before { background-color: ${key}; }`);
    attemptInsertRule(`:root { --key-opacity-01: rgba(${keyComponent},${keyComponent},${keyComponent},0.1); } `);
    attemptInsertRule(`:root { --key-opacity-05: rgba(${keyComponent},${keyComponent},${keyComponent},0.5); } `);
    attemptInsertRule(`:root { --key-opacity-007: rgba(${keyComponent},${keyComponent},${keyComponent},0.07); } `);

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

const darkKeyLinkColors = {
  linkColor: '#00E',
  linkHoverColor: '#F00',
  linkActiveColor: '#00E',
};
const lightKeyLinkColors = {
  linkColor: '#88F',
  linkHoverColor: '#F33',
  linkActiveColor: '#88F',
};

const styles = [
  new Style('可穿戴科技（默认）', {
    rectBgColor: '#444',
    paperBgColor: '#333',
    textColor: '#DDD',
    ...lightKeyLinkColors,
    contentBlockEarlyAccessColor: '#E65100',
    commentColor: '#444',

    keyIsDark: false,
  }),
  new Style('白纸', {
    rectBgColor: '#EFEFED',
    paperBgColor: '#FFF',
    textColor: '#000',
    ...darkKeyLinkColors,
    contentBlockEarlyAccessColor: '#FFE082',
    commentColor: '#F5F5F5',

    keyIsDark: true,
  }),
  new Style('夜间', {
    rectBgColor: '#272B36',
    paperBgColor: '#38404D',
    textColor: '#DDD',
    ...lightKeyLinkColors,
    contentBlockEarlyAccessColor: '#E65100',
    commentColor: '#272B36',

    keyIsDark: false,
  }),
  new Style('羊皮纸', {
    rectBgColor: '#D8D4C9',
    paperBgColor: '#F8F4E9',
    textColor: '#552830',
    ...darkKeyLinkColors,
    contentBlockEarlyAccessColor: '#FFE082',
    commentColor: '#F9EFD7',

    keyIsDark: true,
  }),
  new Style('巧克力', {
    rectBgColor: '#2E1C11',
    paperBgColor: '#3A2519',
    textColor: '#DDAF99',
    ...lightKeyLinkColors,
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

    this.activateEvent.on(() => {
      hideComments();
      id('content').innerHTML = stylePreviewArticle;
    });
  }
}
