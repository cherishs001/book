import {
  COMMENTS_CREATE,
  COMMENTS_FAILED,
  COMMENTS_LOADED,
  COMMENTS_LOADING,
  COMMENTS_MENTION_LOADED,
  COMMENTS_MENTION_REPLIED_OK,
  COMMENTS_MENTION_REPLIED_TITLE,
  COMMENTS_MENTION_SECTION,
  COMMENTS_RECENT_LOADED,
  COMMENTS_RECENT_SECTION,
  COMMENTS_SECTION,
  GO_TO_MENU,
  MAKAI_BUTTON_DELETE,
  MAKAI_BUTTON_REPLY,
  MAKAI_ERROR_DELETE_COMMENT_INVALID_TOKEN,
  MAKAI_ERROR_INTERNET,
  MAKAI_ERROR_INVALID_EMAIL,
  MAKAI_ERROR_SUBMIT_COMMENT_INVALID_TOKEN,
  MAKAI_ERROR_UNKNOWN,
  MAKAI_ERROR_USER_EXIST,
  MAKAI_GENERIC_LAST_MODIFIED,
  MAKAI_GENERIC_LAST_MODIFIED_SUFFIX,
  MAKAI_INFO_CONFIRM_TOKEN,
  MAKAI_INFO_OBTAIN_TOKEN,
  MAKAI_MODAL_CANCEL,
  MAKAI_MODAL_CONFIRM,
  MAKAI_MODAL_CONFIRM_LOSS_EDITED,
  MAKAI_MODAL_CONFIRM_LOSS_EDITED_NO,
  MAKAI_MODAL_CONFIRM_LOSS_EDITED_YES,
  MAKAI_MODAL_CONTENT_COMMENT_HINT,
  MAKAI_MODAL_CONTENT_DELETION_CONFIRMATION,
  MAKAI_MODAL_CONTENT_EMAIL_INPUT_PREFIX,
  MAKAI_MODAL_CONTENT_NAME_INPUT_PREFIX,
  MAKAI_MODAL_SUBMIT,
  MAKAI_MODAL_TITLE_COMMENT,
  MAKAI_MODAL_TITLE_WARNING,
  MAKAI_SUBMITTED_0,
  MAKAI_SUBMITTED_1,
  MAKAI_SUBMIT_0,
  MAKAI_SUBMIT_1,
} from '../constant/messages';
import { AutoCache } from '../data/AutoCache';
import { useComments } from '../data/settings';
import { state } from '../data/state';
import { DebugLogger } from '../DebugLogger';
import { h } from '../hs';
import { formatTimeRelative } from '../util/formatTime';
import { padName } from '../util/padName';
import { closeChapter } from './chapterControl';
import { Content, ContentBlock } from './contentControl';
import { updateHistory } from './history';
import { getToken, getUsername, hasToken, makaiUrl, saveToken, saveUsername } from './makaiControl';
import { confirm, Modal, notify } from './modalControl';
import { showLoading, showMessage } from './userControl';

const debugLogger = new DebugLogger('Comments Control');

interface CommentData {
  user: {
    avatar_url: string,
    login: string,
    html_url: string,
    display: string;
  };
  created_at: string;
  updated_at: string;
  body: string;
  id: number;
  pageName?: string;
}

async function promptDeleteComment(pageName: string, commentId: number) {
  if (await confirm(MAKAI_MODAL_TITLE_WARNING, MAKAI_MODAL_CONTENT_DELETION_CONFIRMATION, MAKAI_MODAL_CONFIRM, MAKAI_MODAL_CANCEL)) {
    const loadingModal = showLoading(MAKAI_INFO_CONFIRM_TOKEN);
    try {
      const json = await fetch(makaiUrl + `/comment/` + commentId + `/` + getToken(), {
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: new Headers({
          'Content-Type': 'application/json'
        }),
        method: 'DELETE',
        mode: 'cors',
        redirect: 'follow',
        referrer: 'no-referrer',
      }).then(response => response.json());
      loadingModal.close();
      if (json.success) {
        commentsCache.delete(recentCommentsUrl());
        commentsCache.delete(chapterCommentsUrl(pageName));
        return true;
      } else {
        showMessage(MAKAI_ERROR_DELETE_COMMENT_INVALID_TOKEN);
        return false;
      }
    } catch (error) {
      showMessage(MAKAI_ERROR_INTERNET);
      debugLogger.error(error);
      return false;
    } finally {
      loadingModal.close();
    }
  }
  return false;
}

function createCommentElement(comment: CommentData, onComment: () => void, pageName?: string) {
  pageName = pageName ?? comment.pageName;
  if (pageName === undefined) {
    debugLogger.warn('Unknown page name.');
  }
  const actionButton = (comment.user.login === getUsername()?.toLowerCase())
    ? h('a.action', { // 删除按钮
      onclick: () => {
        promptDeleteComment(pageName!, comment.id).then(deleted => {
          if (deleted) {
            $comment.remove();
          }
        });
      },
    }, MAKAI_BUTTON_DELETE)
    : pageName && h('a.action', { // 回复按钮
      onclick: () => {
        promptComment(pageName!, '@' + comment.user.login + ' ').then(replied => {
          if (replied) {
            onComment();
          }
        });
      },
    }, MAKAI_BUTTON_REPLY);

  const $comment = h('.comment', [
    h('img.avatar', { src: comment.user.avatar_url }),
    h('a.author', {
      target: '_blank',
      href: comment.user.html_url,
      rel: 'noopener noreferrer',
    }, comment.user.display),
    h('.time', MAKAI_SUBMITTED_0 + padName(comment.user.login) + MAKAI_SUBMITTED_1 + ((comment.created_at === comment.updated_at)
      ? formatTimeRelative(new Date(comment.created_at))
      : `${formatTimeRelative(new Date(comment.created_at))}` +
      MAKAI_GENERIC_LAST_MODIFIED + `${formatTimeRelative(new Date(comment.updated_at))}` + MAKAI_GENERIC_LAST_MODIFIED_SUFFIX)
    ),
    actionButton,
    ...comment.body.split('\n\n').map(paragraph => h('p', paragraph)),
    comment.pageName === undefined ? null : h('p', h('a.page-name', {
      href: `#${comment.pageName}`,
    }, `发表于${padName(comment.pageName.replace(/\//g, ' > ').replace(/-/g, ' ').replace(/\.html$/, ''))}`)),
  ]);
  return $comment;
}

export const commentsCache = new AutoCache<string, any>(
  apiUrl => {
    debugLogger.log(`Loading comments from ${apiUrl}.`);
    return fetch(apiUrl)
      .then(response => response.json());
  },
  new DebugLogger('Comments Cache'),
);

function loadComments(
  content: Content,
  apiUrl: string,
  title: string,
  desc: string,
  onComment: () => void,
  backButton: boolean = true,
  commentingPageName?: string,
) {
  const $commentsStatus = h('p', COMMENTS_LOADING);
  const $comments = h('.comments', [
    h('h1', title),
    $commentsStatus,
  ]) as HTMLDivElement;
  const block = content.addBlock({
    initElement: $comments,
  });

  block.onEnteringView(() => {
    commentsCache.get(apiUrl).then(data => {
      if (content.isDestroyed) {
        debugLogger.log('Comments loaded, but abandoned since the original ' +
          'content page is already destroyed.');
        return;
      }
      debugLogger.log('Comments loaded.');
      $commentsStatus.innerText = desc;
      const appendCreateComment = (commentingPageName: string) => {
        $comments.appendChild(
          h('.create-comment', {
            onclick: () => {
              promptComment(commentingPageName).then(commented => {
                if (commented) {
                  onComment();
                }
              });
            },
          }, COMMENTS_CREATE),
        );
      };
      if (commentingPageName !== undefined && data.length >= 6) {
        appendCreateComment(commentingPageName);
      }
      data.forEach((comment: any) => {
        $comments.appendChild(createCommentElement(comment, onComment, commentingPageName));
      });
      if (commentingPageName !== undefined) {
        appendCreateComment(commentingPageName);
      }
    }).catch(error => {
      $commentsStatus.innerText = COMMENTS_FAILED;
      debugLogger.error('Failed to load comments.', error);
    }).then(() => {
      if (backButton) {
        $comments.appendChild(createToMenuButton());
      }
    });
  });

  return block;
}

export function createToMenuButton() {
  return h('div.page-switcher', [
    h('a.to-menu', {
      href: window.location.pathname,
      onclick: (event: MouseEvent) => {
        event.preventDefault();
        closeChapter();
        updateHistory(true);
      },
    }, GO_TO_MENU),
  ]);
}

export async function sendComment(token: string, pageName: string, textarea: string) {
  const loadingModal = showLoading(MAKAI_INFO_CONFIRM_TOKEN);
  try {
    const json = await fetch(makaiUrl + '/comment/' + token, {
      body: JSON.stringify({ pageName, content: textarea }),
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      method: 'POST',
      mode: 'cors',
      redirect: 'follow',
      referrer: 'no-referrer',
    }).then(response => response.json());
    if (!json.success) {
      showMessage(MAKAI_ERROR_SUBMIT_COMMENT_INVALID_TOKEN);
      return false;
    } else {
      // Cache invalidation
      commentsCache.delete(recentCommentsUrl());
      commentsCache.delete(chapterCommentsUrl(pageName));
      return true;
    }
  } catch (error) {
    showMessage(MAKAI_ERROR_INTERNET);
    debugLogger.error(error);
    return false;
  } finally {
    loadingModal.close();
  }
}

export function promptComment(pageName: string, preFilled?: string) {
  return new Promise<boolean>((resolve, reject) => {
    const $nameInput = h('input') as HTMLInputElement;
    const $emailInput = h('input') as HTMLInputElement;
    const name = hasToken()
      ? h('p', [MAKAI_SUBMIT_0 + padName(getUsername()!) + MAKAI_SUBMIT_1])
      : [
        h('.input-group', [
          h('span', MAKAI_MODAL_CONTENT_NAME_INPUT_PREFIX),
          $nameInput,
        ]),
        h('.input-group', [
          h('span', MAKAI_MODAL_CONTENT_EMAIL_INPUT_PREFIX),
          $emailInput,
        ]),
      ];
    const $textarea = h('textarea.makai-comment') as HTMLTextAreaElement;
    if (preFilled !== undefined) {
      $textarea.value = preFilled;
    }

    const onSubmit = async () => {
      if (!hasToken()) {
        const loadingModal = showLoading(MAKAI_INFO_OBTAIN_TOKEN);
        const alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        try {
          const response = await fetch(makaiUrl + '/register/', {
            body: JSON.stringify({
              username: $nameInput.value,
              email: $emailInput.value,
              encodedPassword: new Array(20).fill(undefined).map(() => alpha[Math.floor(Math.random() * alpha.length)]).join('')
            }),
            cache: 'no-cache',
            headers: new Headers({
              'Content-Type': 'application/json'
            }),
            credentials: 'same-origin',
            method: 'POST',
            mode: 'cors',
            redirect: 'follow',
            referrer: 'no-referrer',
          });
          const json = await response.json();
          if (!json.success) {
            switch (json.errorMessage) {
              case 'Illegal email format.':
                showMessage(MAKAI_ERROR_INVALID_EMAIL);
                break;
              case 'User exist.':
                showMessage(MAKAI_ERROR_USER_EXIST);
                break;
              default:
                showMessage(MAKAI_ERROR_UNKNOWN);
                break;
            }
          } else if (json.accessToken === null) {
            showMessage(MAKAI_ERROR_UNKNOWN);
            return false;
          } else {
            saveToken(json.accessToken);
            saveUsername($nameInput.value);
          }
        } catch (error) {
          showMessage(MAKAI_ERROR_INTERNET);
          debugLogger.error(error);
          return false;
        } finally {
          loadingModal.close();
        }
      }
      return sendComment(getToken()!, pageName, $textarea.value);
    };

    const modal = new Modal(h('div', [
      h('h1', MAKAI_MODAL_TITLE_COMMENT),
      h('p', MAKAI_MODAL_CONTENT_COMMENT_HINT),
      $textarea,
      name,
      h('.button-container', [
        h('div', { // Submit
          onclick: () => {
            onSubmit().then(commented => {
              if (commented) {
                modal.close();
              }
              return commented;
            }).then(resolve, reject);
          }
        }, MAKAI_MODAL_SUBMIT),
        h('div', {
          onclick: () => {
            if ($textarea.value === '') {
              modal.close();
              resolve(false);
            } else {
              confirm(
                MAKAI_MODAL_CONFIRM_LOSS_EDITED,
                '',
                MAKAI_MODAL_CONFIRM_LOSS_EDITED_YES,
                MAKAI_MODAL_CONFIRM_LOSS_EDITED_NO
              ).then(confirmed => {
                if (confirmed) {
                  modal.close();
                  resolve(false);
                }
              });
            }
          }
        }, MAKAI_MODAL_CANCEL),
      ]),
    ]));
    modal.open();
    $textarea.focus();
    $textarea.addEventListener('input', () => {
      $textarea.style.height = `auto`;
      $textarea.style.height = `${Math.max(120, $textarea.scrollHeight)}px`;
    }, false);
  });
}

export function chapterCommentsUrl(pageName: string) {
  return makaiUrl + '/comment/github/' + encodeURIComponent(pageName) + '/';
}

export function recentCommentsUrl() {
  return 'https://c.makai.city/comment/recent/github/50';
}

export function loadChapterComments(content: Content) {
  if (useComments.getValue() === false) {
    return;
  }
  let block: ContentBlock | null = null;
  const pageName = state.currentChapter!.chapter.htmlRelativePath;
  function load() {
    if (block !== null) {
      block.directRemove();
    }
    block = loadComments(
      content,
      chapterCommentsUrl(pageName),
      COMMENTS_SECTION,
      COMMENTS_LOADED,
      load,
      false,
      state.currentChapter!.chapter.htmlRelativePath,
    );
  }
  load();
}

export function loadRecentComments(content: Content) {
  let block: ContentBlock | null = null;
  function load() {
    if (block !== null) {
      block.directRemove();
    }
    block = loadComments(
      content,
      recentCommentsUrl(),
      COMMENTS_RECENT_SECTION,
      COMMENTS_RECENT_LOADED,
      load,
    );
  }
  load();
}

export function loadRecentMentions(content: Content, token: string) {
  loadComments(
    content,
    `https://c.makai.city/mentions?token=${token}`,
    COMMENTS_MENTION_SECTION,
    COMMENTS_MENTION_LOADED,
    () => {
      notify(COMMENTS_MENTION_REPLIED_TITLE, '', COMMENTS_MENTION_REPLIED_OK);
    },
  );
}
