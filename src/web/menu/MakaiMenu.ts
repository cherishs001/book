import { showLogin } from '../control/userControl';
import { Side, newContent } from '../control/contentControl';
import { loadRecentComments } from '../control/commentsControl';
import { Layout, setLayout } from '../control/layoutControl';
import { Menu } from '../Menu';

export class MakaiMenu extends Menu {
  public constructor(parent: Menu) {
    super('Makai 评论系统管理', parent);

    this.addItem('Makai 令牌', {
      small: true,
      button: true,
    }).onClick(() => {
      showLogin();
    });
    this.addItem('最新评论', {
      small: true,
      button: true,
    }).onClick(() => {
      const content = newContent(Side.RIGHT);
      setLayout(Layout.MAIN);
      loadRecentComments(content);
    });
  }
}
