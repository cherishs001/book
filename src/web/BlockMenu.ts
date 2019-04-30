import { Menu } from './Menu';
import { CommentBlock } from './LocalStorage';

export class BlockMenu extends Menu {
  public constructor(parent: Menu, mod?: string) {
    if (mod == undefined) {
      super('屏蔽管理', parent);
      this.addLink(new BlockMenu(this, '屏蔽的用户'));
      this.addLink(new BlockMenu(this, '屏蔽的评论'));
    } else {
      super(mod + "（点击以取消屏蔽）", parent);
      if (mod == '屏蔽的用户') {
        for (const people of CommentBlock.GetBlockedPeople()) {
          this.addItem(people.name, { small: true, button: true })
            .onClick(() => {
              CommentBlock.UnblockPeople(people.id);
            });
        }
      } else if (mod == '屏蔽的评论') {
        for (const comment of CommentBlock.GetBlocked()) {
          this.addItem(comment.content, { small: true, button: true })
            .onClick(() => {
              CommentBlock.UnblockComment(comment.id);
            });
        }
      }
    }
  }
}
