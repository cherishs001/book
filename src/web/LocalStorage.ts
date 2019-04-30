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
    let blockPeoples: any = localStorage.getItem('CommentBlockedPeople');
    if (blockPeoples == null) {
      blockPeoples = [
        {
          id: id,
          name: username
        }
      ];
      localStorage.setItem('CommentBlockedPeople', JSON.stringify(blockPeoples));
    } else {
      blockPeoples = JSON.parse(blockPeoples);
      blockPeoples.push({
        id: id,
        name: username
      });
      localStorage.setItem('CommentBlockedPeople', JSON.stringify(blockPeoples));
    }
  },
  BlockComment: function (id: number, content: string) {
    let blockComments: any = localStorage.getItem('CommentBlocked');
    if (blockComments == null) {
      blockComments = [
        {
          id: id,
          content: content
        }
      ];
      localStorage.setItem('CommentBlocked', JSON.stringify(blockComments));
    } else {
      blockComments = JSON.parse(blockComments);
      blockComments.push({
        id: id,
        content: content
      });
      localStorage.setItem('CommentBlocked', JSON.stringify(blockComments));
    }
  },
  UnblockPeople: function (id: number) {
    let blockPeoples: any = localStorage.getItem('CommentBlockedPeople');
    if (blockPeoples != null) {
      blockPeoples = JSON.parse(blockPeoples);
      for (const blockPeople of blockPeoples) {
        if (blockPeople.id == id) {
          blockPeoples.splice(blockPeoples.indexOf(blockPeople), 1);
          localStorage.setItem('CommentBlockedPeople', JSON.stringify(blockPeoples));
          return;
        }
      }
    }
  },
  UnblockComment: function (id: number) {
    let blockComments: any = localStorage.getItem('CommentBlocked');
    if (blockComments != null) {
      blockComments = JSON.parse(blockComments);
      for (const blockComment of blockComments) {
        if (blockComment.id == id) {
          blockComments.splice(blockComments.indexOf(blockComment), 1);
          localStorage.setItem('CommentBlocked', JSON.stringify(blockComments));
          return;
        }
      }
    }
  },
  GetBlockedPeople: function () {
    const blocked = localStorage.getItem('CommentBlockedPeople');
    return blocked == null ? [] : JSON.parse(blocked);
  },
  GetBlocked: function () {
    const blocked = localStorage.getItem('CommentBlocked');
    return blocked == null ? [] : JSON.parse(blocked);
  },
  IsCommentBlocked: function (id: number) {
    const blockedComments = localStorage.getItem('CommentBlocked');
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
    const blockedPeoples = localStorage.getItem('CommentBlocked');
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