import { ItemDecoration, Menu } from '../Menu';
export class LinkExchangeMenu extends Menu {
  public constructor(parent: Menu) {
    super('友情链接', parent);
    this.addItem('艾利浩斯学院 图书馆', {
      small: true,
      button: true,
      link: 'http://ailihaosi.xyz/',
      decoration: ItemDecoration.ICON_LINK,
    });
  }
}