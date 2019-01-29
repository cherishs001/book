// export enum Style {
//   BRIGHT,
//   DARK,
//   PARCHMENT,
// }
// export const styleClassNames: Map<Style, string> = new Map();
// styleClassNames.set(Style.BRIGHT, 'style-bright');
// styleClassNames.set(Style.DARK, 'style-dark');
// styleClassNames.set(Style.PARCHMENT, 'style-parchment');

interface StyleDef {
  readonly rectBgColor: string;
  readonly paperBgColor: string;
  readonly textColor: string;
  readonly linkColor: string;
  readonly linkHoverColor: string;
  readonly linkActiveColor: string;
}

class Style {
  public static currentlyEnabled: Style | null = null;
  private styleSheet: StyleSheet | null = null;
  public selectionButton: HTMLDivElement;
  public constructor(
    public readonly name: string,
    public readonly def: StyleDef,
  ) {
    const selectionButton = document.createElement('div');
    selectionButton.classList.add('selectable', 'small', 'button');
    selectionButton.innerText = name;
    selectionButton.addEventListener('click', this.active.bind(this));
    this.selectionButton = selectionButton;
  }
  private injectStyleSheet() {
    const $style = document.createElement('style');
    document.head.appendChild($style);
    const sheet = $style.sheet as CSSStyleSheet;
    sheet.disabled = true;
    sheet.insertRule(`.rect.reading { background-color: ${this.def.rectBgColor}; }`);
    sheet.insertRule(`.rect.reading>.content { background-color: ${this.def.paperBgColor}; }`);
    sheet.insertRule(`.rect.reading>.content { color: ${this.def.textColor}; }`);
    sheet.insertRule(`.rect.reading>.content a { color: ${this.def.linkColor}; }`);
    sheet.insertRule(`.rect.reading>.content a:visited { color: ${this.def.linkColor}; }`);
    sheet.insertRule(`.rect.reading>.content a:hover { color: ${this.def.linkHoverColor}; }`);
    sheet.insertRule(`.rect.reading>.content a:active { color: ${this.def.linkActiveColor}; }`);
    this.styleSheet = sheet;
  }
  public active() {
    if (Style.currentlyEnabled !== null) {
      const currentlyEnabled = Style.currentlyEnabled;
      if (currentlyEnabled.styleSheet !== null) {
        currentlyEnabled.styleSheet.disabled = true;
      }
      currentlyEnabled.selectionButton.classList.remove('selected');
    }
    if (this.styleSheet === null) {
      this.injectStyleSheet();
    }
    this.styleSheet!.disabled = false;
    this.selectionButton.classList.add('selected');
    window.localStorage.setItem('style', this.name);
    Style.currentlyEnabled = this;
  }
}

export function load(buttonsParent: HTMLElement) {
  const styles = [
    new Style('默认', {
      rectBgColor: '#EFEFED',
      paperBgColor: '#FFF',
      textColor: '#000',
      linkColor: '#00E',
      linkHoverColor: '#00E',
      linkActiveColor: '#00C',
    }),
    new Style('夜间', {
      rectBgColor: '#272B36',
      paperBgColor: '#38404D',
      textColor: '#DDD',
      linkColor: '#55E',
      linkHoverColor: '#55E',
      linkActiveColor: '#33C',
    }),
    new Style('羊皮纸', {
      rectBgColor: '#D8D4C9',
      paperBgColor: '#F8F4E9',
      textColor: '#552830',
      linkColor: '#00E',
      linkHoverColor: '#00E',
      linkActiveColor: '#00C',
    }),
    new Style('可穿戴科技', {
      rectBgColor: '#444',
      paperBgColor: '#333',
      textColor: '#DDD',
      linkColor: '#66F',
      linkHoverColor: '#66F',
      linkActiveColor: '#44D',
    }),
    new Style('巧克力', {
      rectBgColor: '#2C1C11',
      paperBgColor: '#3E2519',
      textColor: '#CD9F89',
      linkColor: '#66F',
      linkHoverColor: '#66F',
      linkActiveColor: '#44D',
    }),
  ];
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
  styles.forEach(style => buttonsParent.appendChild(style.selectionButton));
}
