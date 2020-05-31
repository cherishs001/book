
import {MAKAI_ERROR_EMPTY_TOKEN, MAKAI_ERROR_INTERNET, MAKAI_ERROR_INVALID_EMAIL, MAKAI_ERROR_INVALID_TOKEN, MAKAI_ERROR_SUBMIT_COMMENT_INVALID_TOKEN, MAKAI_ERROR_UNKNOWN, MAKAI_ERROR_USER_EXIST, MAKAI_INFO_CONFIRM_TOKEN, MAKAI_INFO_OBTAIN_TOKEN, MAKAI_INFO_SET_TOKKEN_SUCCESS, MAKAI_MODAL_CANCEL, MAKAI_MODAL_CONTENT_COMMENT_HINT, MAKAI_MODAL_CONTENT_DEVELOPMENT_HINT, MAKAI_MODAL_CONTENT_EMAIL_INPUT_PREFIX, MAKAI_MODAL_CONTENT_MAKAI_TOKEN_IS_USED_TO_SUBMIT_COMMENTS, MAKAI_MODAL_CONTENT_NAME_INPUT_PREFIX, MAKAI_MODAL_CONTENT_THIS_IS_YOUR_MAKAI_TOKEN, MAKAI_MODAL_CONTENT_TOKEN_INPUT_PREFIX, MAKAI_MODAL_CONTENT_YOU_WILL_GET_MAKAI_TOKEN_ONCE_YOU_SUBMIT_FIRST_COMMENT, MAKAI_MODAL_OK, MAKAI_MODAL_SAVE, MAKAI_MODAL_SUBMIT, MAKAI_MODAL_TITLE_COMMENT, MAKAI_MODAL_TITLE_INFO, MAKAI_MODAL_TITLE_TOKEN, MAKAI_MODAL_TITLE_WAITING, MAKAI_SUBMIT_0, MAKAI_SUBMIT_1, MAKAI_MODAL_CONFIRM_LOSS_EDITED, MAKAI_MODAL_CONFIRM_LOSS_EDITED_YES, MAKAI_MODAL_CONFIRM_LOSS_EDITED_NO} from '../constant/messages';
import { state } from '../data/state';
import { h } from '../hs';
import { padName } from '../util/padName';
import { commentsCache, getApiUrl, loadComments } from './commentsControl';
import { ContentBlock, getCurrentContent } from './contentControl';
import { getToken, getUsername, hasToken, makaiUrl, saveToken, saveUsername } from './makaiControl';
import {Modal, confirm} from './modalControl';

export function showMessage(message: string) {
  const modal = new Modal(h('div', [
    h('h1', MAKAI_MODAL_TITLE_INFO),
    h('p', message),
    h('.button-container', [
      h('div', {
        onclick: () => {
          modal.close();
        }
      }, MAKAI_MODAL_OK),
    ]),
  ]));
  modal.setDismissible();
  modal.open();
}


export function showLoading(message: string): Modal {
  const m = new Modal(h('div', [
    h('h1', MAKAI_MODAL_TITLE_WAITING),
    h('p', message),
  ]));
  m.open();
  return m;
}


export function showLogin() {

  let token: HTMLInputElement;
  const modal = new Modal(h('div', [
    h('h1', MAKAI_MODAL_TITLE_TOKEN),
    h('p', MAKAI_MODAL_CONTENT_THIS_IS_YOUR_MAKAI_TOKEN),
    h('p', MAKAI_MODAL_CONTENT_MAKAI_TOKEN_IS_USED_TO_SUBMIT_COMMENTS),
    h('p', MAKAI_MODAL_CONTENT_YOU_WILL_GET_MAKAI_TOKEN_ONCE_YOU_SUBMIT_FIRST_COMMENT),
    h('i', MAKAI_MODAL_CONTENT_DEVELOPMENT_HINT),
    h('ul', [
      MAKAI_MODAL_CONTENT_TOKEN_INPUT_PREFIX,
      token = h('input.makai-token', { value: getToken() === undefined ? '' : getToken() }) as HTMLInputElement,
    ]),
    h('.button-container', [
      h('div', {
        onclick: () => {
          modal.close();
        }
      }, MAKAI_MODAL_CANCEL),
      h('div', {
        onclick: () => {
          if (token.value === '') {
            showMessage(MAKAI_ERROR_EMPTY_TOKEN);
            return;
          }
          const m = showLoading(MAKAI_INFO_CONFIRM_TOKEN);
          fetch(makaiUrl + '/username/' + token.value).then((response) => {
            return response.json();
          })
            .then((json) => {
              m.close();
              if (json.username == null) {
                showMessage(MAKAI_ERROR_INVALID_TOKEN);
              } else {
                saveToken(token.value);
                saveUsername(json.username);
                modal.close();
                showMessage(MAKAI_INFO_SET_TOKKEN_SUCCESS);
              }
            }).catch((err) => {
              m.close();
              showMessage(MAKAI_ERROR_INTERNET);
            });
        }
      }, MAKAI_MODAL_SAVE),
    ]),
  ]));
  modal.setDismissible();
  modal.open();
}

export function sendComment(textarea: string, block: ContentBlock, modal: Modal) {
  if (!hasToken()) {
    showMessage(MAKAI_ERROR_INVALID_TOKEN);
    return;
  }

  const m = showLoading(MAKAI_INFO_CONFIRM_TOKEN);
  fetch(makaiUrl + '/comment/' + getToken(), {
    body: JSON.stringify({ pageName: state.currentChapter?.chapter.htmlRelativePath.replace(/\//g, '.'), content: textarea }),
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    method: 'POST',
    mode: 'cors',
    redirect: 'follow',
    referrer: 'no-referrer',
  }).then((response) => {
    return response.json();
  })
    .then((json) => {
      m.close();
      if (!json.success) {
        showMessage(MAKAI_ERROR_SUBMIT_COMMENT_INVALID_TOKEN);
      } else {
        block.directRemove();
        commentsCache.delete(getApiUrl());
        loadComments(getCurrentContent()!);
        modal.close();
      }
    }).catch((err) => {
      m.close();
      showMessage(MAKAI_ERROR_INTERNET);
    });
}

export function showComment(block: ContentBlock) {
  const $nameInput = h('input.makai-input') as HTMLInputElement;
  const $emailInput = h('input.makai-input') as HTMLInputElement;
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
  const modal = new Modal(h('div', [
    h('h1', MAKAI_MODAL_TITLE_COMMENT),
    h('p', MAKAI_MODAL_CONTENT_COMMENT_HINT),
    $textarea,
    name,
    h('.button-container', [
      h('div', {
        onclick: () => {
          if (!hasToken()) {
            const m = showLoading(MAKAI_INFO_OBTAIN_TOKEN);
            const alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            fetch(makaiUrl + '/register/', {
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
            }).then((response) => {
              return response.json();
            }).then((json) => {
                m.close();
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
                } else if (json.accessToken == null) {
                  showMessage(MAKAI_ERROR_UNKNOWN);
                } else {
                  saveToken(json.accessToken);
                  saveUsername($nameInput.value);
                  sendComment($textarea.value, block, modal);
                }
              }).catch((_) =>{
                m.close();
                showMessage(MAKAI_ERROR_INTERNET);
              });
          } else {
            sendComment($textarea.value, block, modal);
          }

        }
      }, MAKAI_MODAL_SUBMIT),
      h('div', {
        onclick: () => {
          if ($textarea.value === '') {
            modal.close();
          } else {
            confirm(
              MAKAI_MODAL_CONFIRM_LOSS_EDITED,
              '',
              MAKAI_MODAL_CONFIRM_LOSS_EDITED_YES,
              MAKAI_MODAL_CONFIRM_LOSS_EDITED_NO
            ).then(confirmed => {
              if (confirmed) {
                modal.close();
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
}
