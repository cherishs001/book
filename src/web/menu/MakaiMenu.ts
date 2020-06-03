import { showLogin } from '../control/userControl';
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
  }
}
