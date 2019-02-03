import { Menu } from './Menu';
import { animation, BooleanSetting, warning } from './settings';

export class SettingsMenu extends Menu {
  public constructor(parent: Menu) {
    super('设置', parent);
    this.addBooleanSetting('NSFW 警告', warning);
    this.addBooleanSetting('使用动画', animation);
  }
  public addBooleanSetting(label: string, setting: BooleanSetting) {
    const getText = () => `${label}：${setting.getValue() ? '开' : '关'}`;
    const handle = this.addItem(getText(), { small: true, button: true })
      .onClick(() => {
        setting.toggle();
        handle.setInnerText(getText());
      });
  }
}
