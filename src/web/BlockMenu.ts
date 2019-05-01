import { CommentBlock } from './LocalStorage';
import { Menu } from './Menu';

export class BlockMenu extends Menu {
  public constructor(parent: Menu, mod?: string) {
    if (mod === undefined) {
      super('屏蔽管理', parent);
      this.addLink(new BlockMenu(this, '屏蔽的用户'), true);
      this.addLink(new BlockMenu(this, '屏蔽的评论'), true);
    } else {
      super(mod, parent);
      if (mod === '屏蔽的用户') {
        const blocked = CommentBlock.GetBlockedPeople();
        if (blocked.length === 0) {
          this.addItem('没有用户被屏蔽', { small: true });
        }
        for (const people of blocked) {
          const handle = this.addItem(people.name + '（点击以取消屏蔽）', { small: true, button: true })
            .onClick(() => {
              CommentBlock.UnblockPeople(people.id);
              const parent = handle.element.parentNode;
              if (parent != null) {
                parent.removeChild(handle.element);
              }
            });
        }
      } else if (mod === '屏蔽的评论') {
        const blocked = CommentBlock.GetBlocked();
        if (blocked.length === 0) {
          this.addItem('没有被屏蔽的评论', { small: true });
        }
        for (const comment of blocked) {
          const handle = this.addItem(comment.content + '（点击以取消屏蔽）', { small: true, button: true })
            .onClick(() => {
              CommentBlock.UnblockComment(comment.id);
              const parent = handle.element.parentNode;
              if (parent != null) {
                parent.removeChild(handle.element);
              }
            });
        }
      }
    }
  }
}
