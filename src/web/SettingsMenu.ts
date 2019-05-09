import { BlockMenu } from './BlockMenu';
import { Menu } from './Menu';
import { animation, BooleanSetting, debugLogging, earlyAccess, gestureSwitchChapter, useComments, warning } from './settings';

export class SettingsMenu extends Menu {
  public constructor(parent: Menu) {
    super('设置', parent);
    this.addBooleanSetting('NSFW 警告', warning);
    this.addBooleanSetting('使用动画', animation);
    this.addBooleanSetting('显示编写中章节', earlyAccess);
    this.addBooleanSetting('显示评论', useComments);
    this.addBooleanSetting('手势切换章节（仅限手机）', gestureSwitchChapter);
    this.addBooleanSetting('开发人员模式', debugLogging);
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
