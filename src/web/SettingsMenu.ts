import { Menu } from './Menu';
import { animation, BooleanSetting, earlyAccess, useComments, warning } from './settings';
import { BlockMenu } from './BlockMenu';

export class SettingsMenu extends Menu {
  public constructor(parent: Menu) {
    super('设置', parent);
    this.addBooleanSetting('NSFW 警告', warning);
    this.addBooleanSetting('使用动画', animation);
    this.addBooleanSetting('显示编写中章节', earlyAccess);
    this.addBooleanSetting('显示评论', useComments);
    this.addLink(new BlockMenu(this), true);
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
