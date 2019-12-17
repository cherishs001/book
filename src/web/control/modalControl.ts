import { animation } from '../data/settings';
import { h } from '../hs';
import { escapeKeyPressEvent } from '../input/keyboard';
import { id } from '../util/DOM';

const $modalHolder = id('modal-holder');

export class Modal {
  public readonly modal: HTMLDivElement;
  public readonly modalContainer: HTMLDivElement;
  public constructor(
    $initElement: HTMLDivElement = h('div'),
  ) {
    $initElement.classList.add('modal');
    this.modal = $initElement;
    this.modalContainer = h(
      '.modal-container.closed',
      $initElement,
    ) as HTMLDivElement;
    $modalHolder.appendChild(this.modalContainer);
  }
  public open() {
    // tslint:disable-next-line:no-unused-expression
    this.modalContainer.offsetWidth; // Force reflow
    this.modalContainer.classList.remove('closed');
  }
  public close() {
    if (animation.getValue()) {
      this.modalContainer.classList.add('closed');
      setTimeout(() => {
        this.modalContainer.remove();
      }, 400);
    } else {
      this.modalContainer.remove();
    }
    if (this.escKeyListener !== null) {
      escapeKeyPressEvent.off(this.escKeyListener);
    }
  }
  private dismissSet = false;
  private escKeyListener: (() => void) | null = null;
  public setDismissible(onDismiss: () => void = () => {
    this.close();
  }) {
    if (this.dismissSet) {
      throw new Error('Dismissible already set.');
    }
    this.dismissSet = true;
    escapeKeyPressEvent.on(onDismiss);
    this.modalContainer.addEventListener('click', event => {
      if (event.target === this.modalContainer) {
        onDismiss();
      }
    });
  }
}

export function confirm(title: string, desc: string, yes: string, no: string) {
  let resolved = false;
  return new Promise<boolean>(resolve => {
    const modal = new Modal(h('div', [
      h('h1', title),
      desc === '' ? null : h('p', desc),
      h('.button-container', [
        h('div', {
          onclick: () => {
            if (resolved) {
              return;
            }
            resolved = true;
            modal.close();
            resolve(true);
          },
        }, yes),
        h('div', {
          onclick: () => {
            if (resolved) {
              return;
            }
            resolved = true;
            modal.close();
            resolve(false);
          },
        }, no),
      ]),
    ]));
    modal.open();
  });
}
