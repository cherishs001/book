import {
  COMMENTS_CREATE,
  COMMENTS_FAILED,
  COMMENTS_LOADED,
  COMMENTS_LOADING,
  COMMENTS_SECTION,
  MAKAI_BUTTON_BLOCK,
  MAKAI_BUTTON_DELETE,
  MAKAI_ERROR_DELETE_COMMENT_INVALID_TOKEN,
  MAKAI_ERROR_INTERNET,
  MAKAI_GENERIC_LAST_MODIFIED,
  MAKAI_GENERIC_LAST_MODIFIED_SUFFIX,
  MAKAI_INFO_CONFIRM_TOKEN,
  MAKAI_MODAL_CANCEL,
  MAKAI_MODAL_CONFIRM,
  MAKAI_MODAL_CONTENT_DELETION_CONFIRMATION,
  MAKAI_MODAL_TITLE_WARNING,
  MAKAI_SUBMITTED_0,
  MAKAI_SUBMITTED_1
} from '../constant/messages';
import { AutoCache } from '../data/AutoCache';
import { useComments } from '../data/settings';
import { state } from '../data/state';
import { DebugLogger } from '../DebugLogger';
import { h } from '../hs';
import { formatTimeRelative } from '../util/formatTime';
import { padName } from '../util/padName';
import { blockUser, isUserBlocked } from './commentBlockControl';
import { Content, ContentBlock, getCurrentContent } from './contentControl';
import { getToken, getUsername, makaiUrl } from './makaiControl';
import { confirm } from './modalControl';
import { showComment, showLoading, showMessage } from './userControl';

const debugLogger = new DebugLogger('Comments Control');
// const getApiUrlRegExp = /^https:\/\/github\.com\/([a-zA-Z0-9-_]+)\/([a-zA-Z0-9-_]+)\/issues\/([1-9][0-9]*)$/;
// Input sample: https://github.com/SCLeoX/Wearable-Technology/issues/1
// Output sample: https://api.github.com/repos/SCLeoX/Wearable-Technology/issues/1/comments
export function getApiUrl() {
  return makaiUrl + '/comment/github/' + state.currentChapter?.chapter.htmlRelativePath.replace(/\//g, '.') + '/';
}

function createCommentElement(
  userAvatarUrl: string,
  userName: string,
  userUrl: string,
  createTime: string,
  updateTime: string,
  content: string,
  id: number,
  block: ContentBlock,
  display: string,
) {
  const deleteButton = userName === getUsername()?.toLowerCase() ? h('a.block-user', {
    onclick: () => {
      confirm(MAKAI_MODAL_TITLE_WARNING, MAKAI_MODAL_CONTENT_DELETION_CONFIRMATION, MAKAI_MODAL_CONFIRM, MAKAI_MODAL_CANCEL).then((result) => {
        if (result) {
          const m = showLoading(MAKAI_INFO_CONFIRM_TOKEN);
          fetch(makaiUrl + `/comment/` + id + `/` + getToken(), {
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: new Headers({
              'Content-Type': 'application/json'
            }),
            method: 'DELETE',
            mode: 'cors',
            redirect: 'follow',
            referrer: 'no-referrer',
          }).then((response) => {
            return response.json();
          })
            .then((json) => {
              m.close();
              if (!json.success) {
                showMessage(MAKAI_ERROR_DELETE_COMMENT_INVALID_TOKEN);
              } else {
                $comment.remove();
              }
            }).catch((err) => {
              m.close();
              showMessage(MAKAI_ERROR_INTERNET);
            });
        }
      });
    },
  }, MAKAI_BUTTON_DELETE) : null;

  const $comment = h('.comment', [
    h('img.avatar', { src: userAvatarUrl }),
    h('a.author', {
      target: '_blank',
      href: userUrl,
      rel: 'noopener noreferrer',
    }, display),
    h('.time', MAKAI_SUBMITTED_0 + padName(userName) + MAKAI_SUBMITTED_1 + ((createTime === updateTime)
      ? formatTimeRelative(new Date(createTime))
      : `${formatTimeRelative(new Date(createTime))}` +
      MAKAI_GENERIC_LAST_MODIFIED + `${formatTimeRelative(new Date(updateTime))}` + MAKAI_GENERIC_LAST_MODIFIED_SUFFIX)), deleteButton === null ?
      h('a.block-user', {
        onclick: () => {
          blockUser(userName);
          block.directRemove();
          loadComments(getCurrentContent()!);
        },
      }, MAKAI_BUTTON_BLOCK) : deleteButton,
    ...content.split('\n\n').map(paragraph => h('p', paragraph)),
  ]);
  return $comment;
}

export const commentsCache = new AutoCache<string, any>(
  apiUrl => {
    debugLogger.log(`Loading comments from ${apiUrl}.`);
    return fetch(apiUrl).then(response => response.json());
  },
  new DebugLogger('Comments Cache'),
);
export function loadComments(content: Content) {
  if (useComments.getValue() === false) {
    return;
  }
  const $commentsStatus = h('p', COMMENTS_LOADING);
  const $comments = h('.comments', [
    h('h1', COMMENTS_SECTION),
    $commentsStatus,
  ]) as HTMLDivElement;
  const block = content.addBlock({
    initElement: $comments,
  });

  block.onEnteringView(() => {
    const apiUrl = getApiUrl();
    commentsCache.get(apiUrl).then(data => {
      if (content.isDestroyed) {
        debugLogger.log('Comments loaded, but abandoned since the original ' +
          'content page is already destroyed.');
        return;
      }
      debugLogger.log('Comments loaded.');
      $commentsStatus.innerText = COMMENTS_LOADED;
      data.forEach((comment: any) => {
        if (isUserBlocked(comment.user.login)) {
          return;
        }
        $comments.appendChild(createCommentElement(
          comment.user.avatar_url,
          comment.user.login,
          comment.user.html_url,
          comment.created_at,
          comment.updated_at,
          comment.body,
          comment.id,
          block,
          comment.user.display
        ));
      });
      $comments.appendChild(
        h('.create-comment', {
          onclick: () => {
            showComment(block);
          },
        }, COMMENTS_CREATE),
      );
    })
      .catch(() => {
        $commentsStatus.innerText = COMMENTS_FAILED;
      });
  });
}
