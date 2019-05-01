import { ChaptersMenu } from './ChaptersMenu';
import { ContactMenu } from './ContactMenu';
import { id } from './DOM';
import { Menu } from './Menu';
import { SettingsMenu } from './SettingsMenu';
import { StatsMenu } from './StatsMenu';
import { StyleMenu } from './StyleMenu';
import { ThanksMenu } from './ThanksMenu';

export class MainMenu extends Menu {
  public constructor() {
    super('', null);
    this.addLink(new ChaptersMenu(this));
    this.addLink(new ThanksMenu(this));
    this.addLink(new StyleMenu(this))
    .onClick(() => {
      const $rect = id('rect');
      const $header = id('header');
      const $me = document.querySelector('.menu:not(.hidden)');
      $rect.style.zIndex = '-1';
      $header.style.opacity = '0';
      $header.style.pointerEvents = 'none';
      if ($me != null) {
        ($me as HTMLElement).style.backgroundColor = 'rgba(0,0,0,0.5)';
      }
    });
    this.addLink(new ContactMenu(this));
    this.addItem('源代码', { button: true, link: 'https://github.com/SCLeoX/Wearable-Technology' });
    this.addLink(new SettingsMenu(this));
    this.addLink(new StatsMenu(this));
  }
}
