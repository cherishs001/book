import {
  COMMENTS_CREATE,
  COMMENTS_FAILED,
  COMMENTS_LOADED,
  COMMENTS_LOADING,
  COMMENTS_SECTION,
  COMMENTS_UNAVAILABLE,
} from '../constant/messages';
import { AutoCache } from '../data/AutoCache';
import { useComments } from '../data/settings';
import { DebugLogger } from '../DebugLogger';
import { h } from '../hs';
import { formatTime } from '../util/formatTime';
import { blockUser, isUserBlocked } from './commentBlockControl';
import { Content } from './contentControl';

const debugLogger = new DebugLogger('Comments Control');
const getApiUrlRegExp = /^https:\/\/github\.com\/([a-zA-Z0-9-_]+)\/([a-zA-Z0-9-_]+)\/issues\/([1-9][0-9]*)$/;
// Input sample: https://github.com/SCLeoX/Wearable-Technology/issues/1
// Output sample: https://api.github.com/repos/SCLeoX/Wearable-Technology/issues/1/comments
function getApiUrl(issueUrl: string) {
  const result = getApiUrlRegExp.exec(issueUrl);
  if (result === null) {
    throw new Error(`Bad issue url: ${issueUrl}.`);
  }
  return `https://api.github.com/repos/${result[1]}/${result[2]}/issues/${result[3]}/comments`;
}

function createCommentElement(
  userAvatarUrl: string,
  userName: string,
  userUrl: string,
  createTime: string,
  updateTime: string,
  content: string,
) {
  const $comment = h('.comment', [
    h('img.avatar', { src: userAvatarUrl }),
    h('a.author', {
      target: '_blank',
      href: userUrl,
    }, userName),
    h('.time', createTime === updateTime
      ? formatTime(new Date(createTime))
      : `${formatTime(new Date(createTime))}` +
        `（最后修改于 ${formatTime(new Date(updateTime))}）`),
    h('a.block-user', {
      onclick: () => {
        blockUser(userName);
        $comment.remove();
      },
    }, '屏蔽此人'),
    ...content.split('\n\n').map(paragraph => h('p', paragraph)),
  ]);
  return $comment;
}

const commentsCache = new AutoCache<string, any>(
  apiUrl => {
    debugLogger.log(`Loading comments from ${apiUrl}.`);
    return fetch(apiUrl).then(response => response.json());
  },
  new DebugLogger('Comments Cache'),
);
export function loadComments(
  content: Content,
  issueUrl: string | null,
) {
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

  if (issueUrl === null) {
    $commentsStatus.innerText = COMMENTS_UNAVAILABLE;
    return;
  }

  block.onEnteringView(() => {
    const apiUrl = getApiUrl(issueUrl);
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
        ));
      });
      $comments.appendChild(
        h('.create-comment', {
          onclick: () => {
            window.open(issueUrl, '_blank');
          },
        }, COMMENTS_CREATE),
      );
    })
    .catch(() => {
      $commentsStatus.innerText = COMMENTS_FAILED;
    });
  });
}
