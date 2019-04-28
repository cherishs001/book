import { id } from './DOM';
import { formatTime } from './formatTime';
import { COMMENTS_LOADED, COMMENTS_LOADING, COMMENTS_UNAVAILABLE } from './messages';
import { useComments } from './settings';

const $comments = id('comments');
const $commentsStatus = id('comments-status');
const $createComment = id('create-comment');

const getApiUrlRegExp = /^https:\/\/github\.com\/([a-zA-Z0-9-_]+)\/([a-zA-Z0-9-_]+)\/issues\/([1-9][0-9]*)$/;
function getApiUrl(issueUrl: string) {
  // Input sample: https://github.com/SCLeoX/Wearable-Technology/issues/1
  // Output sample: https://api.github.com/repos/SCLeoX/Wearable-Technology/issues/1/comments
  const result = getApiUrlRegExp.exec(issueUrl);
  if (result === null) {
    throw new Error(`Bad issue url: ${issueUrl}.`);
  }
  return `https://api.github.com/repos/${result[1]}/${result[2]}/issues/${result[3]}/comments`;
}

let nextRequestId = 1;
let currentRequestId = 0;
let currentCreateCommentLinkUrl = '';

$createComment.addEventListener('click', () => {
  window.open(currentCreateCommentLinkUrl, '_blank');
});

function createCommentElement(
  userAvatarUrl: string,
  userName: string,
  userUrl: string,
  createTime: string,
  updateTime: string,
  content: string,
) {
  const $comment = document.createElement('div');
  $comment.classList.add('comment');
  const $avatar = document.createElement('img');
  $avatar.classList.add('avatar');
  $avatar.src = userAvatarUrl;
  $comment.appendChild($avatar);
  const $author = document.createElement('a');
  $author.classList.add('author');
  $author.innerText = userName;
  $author.target = '_blank';
  $author.href = userUrl;
  $comment.appendChild($author);
  const $time = document.createElement('div');
  $time.classList.add('time');
  $time.innerText = createTime === updateTime
    ? formatTime(new Date(createTime))
    : `${formatTime(new Date(createTime))}（最后修改于 ${formatTime(new Date(updateTime))}）`;
  $comment.appendChild($time);
  content.split('\n\n').forEach(paragraph => {
    const $p = document.createElement('p');
    $p.innerText = paragraph;
    $comment.appendChild($p);
  });
  return $comment;
}

// 为了确保 comments 在离场动画中存在，hideComments 和 showComments 应该只在入场动画前使用。
export function hideComments() {
  $comments.classList.toggle('display-none', true);
  currentRequestId = 0;
}
export function loadComments(issueUrl: string | null) {
  if (useComments.getValue() === false) {
    hideComments();
    return;
  }

  Array.from($comments.getElementsByClassName('comment')).forEach($element => $element.remove());

  $comments.classList.toggle('display-none', false);

  if (issueUrl === null) {
    $commentsStatus.innerText = COMMENTS_UNAVAILABLE;
    $createComment.classList.toggle('display-none', true);
    return;
  }

  $createComment.classList.toggle('display-none', false);
  currentCreateCommentLinkUrl = issueUrl;

  const requestId = currentRequestId = nextRequestId++;
  const apiUrl = getApiUrl(issueUrl);
  $commentsStatus.innerText = COMMENTS_LOADING;
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      if (requestId !== currentRequestId) {
        return;
      }
      $commentsStatus.innerText = COMMENTS_LOADED;
      data.forEach((comment: any) => {
        $comments.appendChild(createCommentElement(
          comment.user.avatar_url,
          comment.user.login,
          comment.user.html_url,
          comment.created_at,
          comment.updated_at,
          comment.body,
        ));
      });
    });
}
