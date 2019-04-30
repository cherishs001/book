export const LastRead = {
  UpdateLastRead: function (element?: Element) {
    for (const $element of Array.from(document.getElementsByClassName('last-read'))) {
      $element.classList.remove('last-read');
    }
    if (element !== undefined) {
      element.classList.add('last-read');
    }
  }
}

export const CommentBlock = {
  BlockPeople: function (id: number, username: string) {
    const blockPeople = localStorage.getItem('commentBlockedPeople');
    if (blockPeople == null) {
      const blockPeople = [
        {
          id: id,
          name: username
        }
      ];
      localStorage.setItem('commentBlockedPeople', JSON.stringify(blockPeople));
    } else {
      const $blockPeople = JSON.parse(blockPeople);
      $blockPeople.push({
        id: id,
        name: username
      });
      localStorage.setItem('commentBlockedPeople', JSON.stringify($blockPeople));
    }
  },
  BlockComment: function (id: number, content: string) {
    const blockComments = localStorage.getItem('commentBlocked');
    if (blockComments == null) {
      const blockComments = [
        {
          id: id,
          content: content
        }
      ];
      localStorage.setItem('commentBlocked', JSON.stringify(blockComments));
    } else {
      const $blockComments = JSON.parse(blockComments);
      $blockComments.push({
        id: id,
        content: content
      });
      localStorage.setItem('commentBlocked', JSON.stringify($blockComments));
    }
  },
  UnblockPeople: function (id: number) {
    const _blockPeople = localStorage.getItem('commentBlockedPeople');
    if (_blockPeople != null) {
      const blockPeople = JSON.parse(_blockPeople);
      for (const $blockPeople of blockPeople) {
        if ($blockPeople.id == id) {
          $blockPeople.splice($blockPeople.indexOf(blockPeople), 1);
          localStorage.setItem('commentBlockedPeople', JSON.stringify(blockPeople));
          return;
        }
      }
    }
  },
  UnblockComment: function (id: number) {
    const blockComments = localStorage.getItem('commentBlocked');
    if (blockComments != null) {
      const $blockComments = JSON.parse(blockComments);
      for (const blockComment of $blockComments) {
        if (blockComment.id == id) {
          $blockComments.splice(blockComments.indexOf(blockComment), 1);
          localStorage.setItem('commentBlocked', JSON.stringify($blockComments));
          return;
        }
      }
    }
  },
  GetBlockedPeople: function () {
    const blocked = localStorage.getItem('commentBlockedPeople');
    return blocked == null ? [] : JSON.parse(blocked);
  },
  GetBlocked: function () {
    const blocked = localStorage.getItem('commentBlocked');
    return blocked == null ? [] : JSON.parse(blocked);
  },
  IsCommentBlocked: function (id: number) {
    const blockedComments = localStorage.getItem('commentBlocked');
    if (blockedComments == null) {
      return false;
    } else {
      for (const blockedComment of JSON.parse(blockedComments)) {
        if (blockedComment.id == id) {
          return true;
        }
      }
    }
    return false;
  },
  IsPeopleCommentBlocked: function (id: number) {
    const blockedPeoples = localStorage.getItem('commentBlockedPeople');
    if (blockedPeoples == null) {
      return false;
    } else {
      for (const blockedPeople of JSON.parse(blockedPeoples)) {
        if (blockedPeople.id == id) {
          return true;
        }
      }
    }
    return false;
  }
}