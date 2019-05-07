import { blockedUserUpdateEvent, getBlockedUsers, unblockUser } from './commentBlockControl';
import { Menu } from './Menu';
import { CLICK_TO_UNBLOCK, NO_BLOCKED_USERS } from './messages';

export class BlockMenu extends Menu {
  private update() {
    this.clearItems();
    const blockedUsers = getBlockedUsers();
    if (blockedUsers.length === 0) {
      this.addItem(NO_BLOCKED_USERS, { small: true });
    } else {
      this.addItem(CLICK_TO_UNBLOCK, { small: true });
    }
    blockedUsers.forEach(userName => {
      this.addItem(userName, { small: true, button: true })
        .onClick(() => {
          unblockUser(userName);
        });
    });
  }
  public constructor(parent: Menu) {
    super('屏蔽用户评论管理', parent);
    this.update();
    blockedUserUpdateEvent.on(this.update.bind(this));
  }

  /*
    if (mod === undefined) {
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
  */
}
