import { ItemDecoration, Menu } from '../Menu';

export class ContactMenu extends Menu {
  public constructor(parent: Menu) {
    super('订阅/讨论组', parent);
    this.addItem('Telegram 更新推送频道', {
      small: true,
      button: true,
      link: 'https://t.me/joinchat/AAAAAEpkRVwZ-3s5V3YHjA',
      decoration: ItemDecoration.ICON_LINK,
    });
    this.addItem('Telegram 讨论组', {
      small: true,
      button: true,
      link: 'https://t.me/joinchat/Dt8_WlJnmEwYNbjzlnLyNA',
      decoration: ItemDecoration.ICON_LINK,
    });
    this.addItem('GitHub Repo', {
      small: true,
      button: true,
      link: 'https://github.com/SCLeoX/Wearable-Technology',
      decoration: ItemDecoration.ICON_LINK,
    });
    this.addItem('原始 Google Docs', {
      small: true,
      button: true,
      link: 'https://docs.google.com/document/d/1Pp5CtO8c77DnWGqbXg-3e7w9Q3t88P35FOl6iIJvMfo/edit?usp=sharing',
      decoration: ItemDecoration.ICON_LINK,
    });
  }
}
