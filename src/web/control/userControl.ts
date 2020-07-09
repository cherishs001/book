
import {
  MAKAI_ERROR_EMPTY_TOKEN,
  MAKAI_ERROR_INTERNET,
  MAKAI_ERROR_INVALID_TOKEN,
  MAKAI_INFO_CONFIRM_TOKEN,
  MAKAI_INFO_SET_TOKKEN_SUCCESS,
  MAKAI_MODAL_CANCEL,
  MAKAI_MODAL_CONTENT_DEVELOPMENT_HINT,
  MAKAI_MODAL_CONTENT_MAKAI_TOKEN_DESC,
  MAKAI_MODAL_CONTENT_TOKEN_INPUT_PREFIX,
  MAKAI_MODAL_OK,
  MAKAI_MODAL_SAVE,
  MAKAI_MODAL_TITLE_INFO,
  MAKAI_MODAL_TITLE_TOKEN,
  MAKAI_MODAL_TITLE_WAITING
} from '../constant/messages';
import { h } from '../hs';
import { getToken, makaiUrl, saveToken, saveUsername } from './makaiControl';
import { Modal } from './modalControl';

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
  const $token: HTMLInputElement = h('input', {
    value: getToken() === undefined ? '' : getToken()
  }) as HTMLInputElement;
  const modal = new Modal(h('div', [
    h('h1', MAKAI_MODAL_TITLE_TOKEN),
    ...MAKAI_MODAL_CONTENT_MAKAI_TOKEN_DESC.split('\n').map(p => h('p', p)),
    h('i', MAKAI_MODAL_CONTENT_DEVELOPMENT_HINT),
    h('.input-group', [
      h('span', MAKAI_MODAL_CONTENT_TOKEN_INPUT_PREFIX),
      $token,
    ]),
    h('.button-container', [
      h('div', {
        onclick: () => {
          if ($token.value === '') {
            showMessage(MAKAI_ERROR_EMPTY_TOKEN);
            return;
          }
          const m = showLoading(MAKAI_INFO_CONFIRM_TOKEN);
          fetch(makaiUrl + '/username/' + $token.value).then((response) => {
            return response.json();
          })
            .then((json) => {
              m.close();
              if (json.username === null) {
                showMessage(MAKAI_ERROR_INVALID_TOKEN);
              } else {
                saveToken($token.value);
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
      h('div', {
        onclick: () => {
          modal.close();
        }
      }, MAKAI_MODAL_CANCEL),
    ]),
  ]));
  modal.setDismissible();
  modal.open();
}
