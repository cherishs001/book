import { data } from '../data/data';
import { ItemDecoration, Menu } from '../Menu';
import { StatsKeywordsCountMenu } from './StatsKeywordsCountMenu';

export class StatsMenu extends Menu {
  public constructor(parent: Menu) {
    super('统计', parent);
    this.addItem('访问量统计', { button: true, link: '##page/visit-count', small: true, decoration: ItemDecoration.ICON_EQUALIZER });
    this.addLink(new StatsKeywordsCountMenu(this), true, ItemDecoration.ICON_EQUALIZER);
    this.addItem(`总字数：${data.charsCount}`, { small: true });
    this.addItem(`总段落数：${data.paragraphsCount}`, { small: true });
  }
}
