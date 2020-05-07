import { stylePreviewArticle } from '../constant/stylePreviewArticle';
import { newContent, Side } from '../control/contentControl';
import { Layout } from '../control/layoutControl';
import { animation, BooleanSetting, charCount, developerMode, earlyAccess, EnumSetting, fontFamily, gestureSwitchChapter, useComments, warning, wtcdGameQuickLoadConfirm } from '../data/settings';
import { ItemDecoration, ItemHandle, Menu } from '../Menu';
import { BlockMenu } from './BlockMenu';
import { UserControl } from '../control/userControl';
import { EnumSettingMenu } from './SettingsMenu';

export class MakaiMenu extends Menu {
  public constructor(parent: Menu) {
    super('Makai 评论系统管理', parent);

    this.addItem('Makai 令牌', {
      small: true,
      button: true,
    }).onClick(() => {
      UserControl.showLogin();
    });
  }

  public addBooleanSetting(label: string, setting: BooleanSetting) {
    const getText = () => `${label}：${setting.getValue() ? '开' : '关'}`;
    const handle = this.addItem(getText(), { small: true, button: true })
      .onClick(() => {
        setting.toggle();
        handle.setInnerText(getText());
      });
  }
  public addEnumSetting(label: string, setting: EnumSetting, usePreview?: true) {
    const getText = () => `${label}：${setting.getValueName()}`;
    const handle = this.addItem(getText(), { small: true, button: true });
    const enumSettingMenu = new EnumSettingMenu(this, label, setting, usePreview === true);
    handle.linkTo(enumSettingMenu).onClick(() => {
      this.activateEvent.once(() => {
        handle.setInnerText(getText());
      });
    });
  }
}
