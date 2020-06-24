import { data } from '../data/data';
import { ItemDecoration, Menu } from '../Menu';
import { shortNumber } from '../util/shortNumber';

export class StatsKeywordsCountMenu extends Menu {
  public constructor(parent: Menu) {
    super('关键词统计', parent);
    this.addItem('添加其他关键词', {
      small: true,
      button: true,
      link: 'https://github.com/SCLeoX/Wearable-Technology/edit/master/src/builder/keywords.ts',
      decoration: ItemDecoration.ICON_LINK,
    });
    data.keywordsCount.forEach(([keyword, count]) => {
      this.addItem(`${keyword}：${shortNumber(count, 2)}`, { small: true });
    });
  }
}
