import { Menu } from './Menu';
import { CommentBlock } from './LocalStorage';

export class BlockMenu extends Menu {
  public constructor(parent: Menu, mod?: string) {
    if (mod == undefined) {
      super('屏蔽管理', parent);
      this.addLink(new BlockMenu(this, '屏蔽的用户'), true);
      this.addLink(new BlockMenu(this, '屏蔽的评论'), true);
    } else {
      super(mod, parent);
      if (mod == '屏蔽的用户') {
        for (const people of CommentBlock.GetBlockedPeople()) {
          const handle = this.addItem(people.name + '（点击以取消屏蔽）', { small: true, button: true })
            .onClick(() => {
              CommentBlock.UnblockPeople(people.id);
              const parent = handle.element.parentNode;
              if (parent != null) {
                parent.removeChild(parent);
              }
            });
        }
      } else if (mod == '屏蔽的评论') {
        for (const comment of CommentBlock.GetBlocked()) {
          const handle = this.addItem(comment.content + '（点击以取消屏蔽）', { small: true, button: true })
            .onClick(() => {
              CommentBlock.UnblockComment(comment.id);
              const parent = handle.element.parentNode;
              if (parent != null) {
                parent.removeChild(parent);
              }
            });
        }
      }
    }
  }
}
