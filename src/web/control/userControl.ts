
import {
  MAKAI_ERROR_EMPTY_TOKEN,
  MAKAI_ERROR_INTERNET,
  MAKAI_ERROR_INVALID_EMAIL,
  MAKAI_ERROR_INVALID_TOKEN,
  MAKAI_ERROR_SUBMIT_COMMENT_INVALID_TOKEN,
  MAKAI_ERROR_UNKNOWN,
  MAKAI_ERROR_USER_EXIST,
  MAKAI_INFO_CONFIRM_TOKEN,
  MAKAI_INFO_OBTAIN_TOKEN,
  MAKAI_INFO_SET_TOKKEN_SUCCESS,
  MAKAI_MODAL_CANCEL,
  MAKAI_MODAL_CONTENT_COMMENT_HINT,
  MAKAI_MODAL_CONTENT_DEVELOPMENT_HINT,
  MAKAI_MODAL_CONTENT_EMAIL_INPUT_PREFIX,
  MAKAI_MODAL_CONTENT_MAKAI_TOKEN_IS_USED_TO_SUBMIT_COMMENTS,
  MAKAI_MODAL_CONTENT_NAME_INPUT_PREFIX,
  MAKAI_MODAL_CONTENT_THIS_IS_YOUR_MAKAI_TOKEN,
  MAKAI_MODAL_CONTENT_TOKEN_INPUT_PREFIX,
  MAKAI_MODAL_CONTENT_YOU_WILL_GET_MAKAI_TOKEN_ONCE_YOU_SUBMIT_FIRST_COMMENT,
  MAKAI_MODAL_OK,
  MAKAI_MODAL_SAVE,
  MAKAI_MODAL_SUBMIT,
  MAKAI_MODAL_TITLE_COMMENT,
  MAKAI_MODAL_TITLE_INFO,
  MAKAI_MODAL_TITLE_TOKEN,
  MAKAI_MODAL_TITLE_WAITING,
  MAKAI_SUBMIT_0,
  MAKAI_SUBMIT_1
} from '../constant/messages';
import { state } from '../data/state';
import { h } from '../hs';
import { padName } from '../util/padName';
import { commentsCache, getApiUrl, loadComments } from './commentsControl';
import { ContentBlock, getCurrentContent } from './contentControl';
import { MakaiControl } from './MakaiControl';
import { Modal } from './modalControl';


export class UserControl {
  public static showMessage(message: string) {
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


  public static showLoading(message: string): Modal {
    const m = new Modal(h('div', [
      h('h1', MAKAI_MODAL_TITLE_WAITING),
      h('p', message),
    ]));
    m.open();
    return m;
  }


  public static showLogin() {

    let token: HTMLInputElement;
    const modal = new Modal(h('div', [
      h('h1', MAKAI_MODAL_TITLE_TOKEN),
      h('p', MAKAI_MODAL_CONTENT_THIS_IS_YOUR_MAKAI_TOKEN),
      h('p', MAKAI_MODAL_CONTENT_MAKAI_TOKEN_IS_USED_TO_SUBMIT_COMMENTS),
      h('p', MAKAI_MODAL_CONTENT_YOU_WILL_GET_MAKAI_TOKEN_ONCE_YOU_SUBMIT_FIRST_COMMENT),
      h('i', MAKAI_MODAL_CONTENT_DEVELOPMENT_HINT),
      h('ul', [
        MAKAI_MODAL_CONTENT_TOKEN_INPUT_PREFIX,
        token = h('input.makai-token', { value: MakaiControl.getToken() === undefined ? '' : MakaiControl.getToken() }) as HTMLInputElement,
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
              UserControl.showMessage(MAKAI_ERROR_EMPTY_TOKEN);
              return;
            }
            const m = UserControl.showLoading(MAKAI_INFO_CONFIRM_TOKEN);
            fetch(MakaiControl.url + '/username/' + token.value).then((response) => {
              return response.json();
            })
              .then((json) => {
                m.close();
                if (json.username == null) {
                  UserControl.showMessage(MAKAI_ERROR_INVALID_TOKEN);
                } else {
                  MakaiControl.saveToken(token.value);
                  MakaiControl.saveUsername(json.username);
                  modal.close();
                  UserControl.showMessage(MAKAI_INFO_SET_TOKKEN_SUCCESS);
                }
              }).catch((err) => {
                m.close();
                UserControl.showMessage(MAKAI_ERROR_INTERNET);
              });
          }
        }, MAKAI_MODAL_SAVE),
      ]),
    ]));
    modal.setDismissible();
    modal.open();
  }

  public static sendComment(textarea: string, block: ContentBlock, modal: Modal) {
    if (!MakaiControl.hasToken()) {
      UserControl.showMessage(MAKAI_ERROR_INVALID_TOKEN);
      return;
    }

    const m = UserControl.showLoading(MAKAI_INFO_CONFIRM_TOKEN);
    fetch(MakaiControl.url + '/comment/' + MakaiControl.getToken(), {
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
          UserControl.showMessage(MAKAI_ERROR_SUBMIT_COMMENT_INVALID_TOKEN);
        } else {
          block.directRemove();
          commentsCache.delete(getApiUrl());
          loadComments(getCurrentContent()!);
          modal.close();
        }
      }).catch((err) => {
        m.close();
        UserControl.showMessage(MAKAI_ERROR_INTERNET);
      });
  }

  public static showComment(block: ContentBlock) {
    const nameInput = h('input.makai-input') as HTMLInputElement;
    const emailInput = h('input.makai-input') as HTMLInputElement;
    const name = MakaiControl.hasToken()
      ? h('ul', [MAKAI_SUBMIT_0 + padName(MakaiControl.getUsername()!) + MAKAI_SUBMIT_1])
      : h('ul', [
        MAKAI_MODAL_CONTENT_NAME_INPUT_PREFIX,
        nameInput,
        h('br'),
        MAKAI_MODAL_CONTENT_EMAIL_INPUT_PREFIX,
        emailInput,
      ]);
    const textarea = h('textarea.makai-comment') as HTMLTextAreaElement;
    const modal = new Modal(h('div', [
      h('h1', MAKAI_MODAL_TITLE_COMMENT),
      h('p', MAKAI_MODAL_CONTENT_COMMENT_HINT),
      textarea,
      name,
      h('.button-container', [
        h('div', {
          onclick: () => {
            modal.close();
          }
        }, MAKAI_MODAL_CANCEL),
        h('div', {
          onclick: () => {
            if (!MakaiControl.hasToken()) {
              const m = UserControl.showLoading(MAKAI_INFO_OBTAIN_TOKEN);
              const alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
              fetch(MakaiControl.url + '/register/', {
                body: JSON.stringify({
                  username: nameInput.value,
                  email: emailInput.value,
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
                        UserControl.showMessage(MAKAI_ERROR_INVALID_EMAIL);
                        break;
                      case 'User exist.':
                        UserControl.showMessage(MAKAI_ERROR_USER_EXIST);
                        break;
                      default:
                        UserControl.showMessage(MAKAI_ERROR_UNKNOWN);
                        break;
                    }
                  } else if (json.accessToken == null) {
                    UserControl.showMessage(MAKAI_ERROR_UNKNOWN);
                  } else {
                    MakaiControl.saveToken(json.accessToken);
                    MakaiControl.saveUsername(nameInput.value);
                    UserControl.sendComment(textarea.value, block, modal);
                  }
                }).catch((_) =>{
                  m.close();
                  UserControl.showMessage(MAKAI_ERROR_INTERNET);
                });
            } else {
              this.sendComment(textarea.value, block, modal);
            }

          }
        }, MAKAI_MODAL_SUBMIT),
      ]),
    ]));
    modal.setDismissible();
    modal.open();
  }
}