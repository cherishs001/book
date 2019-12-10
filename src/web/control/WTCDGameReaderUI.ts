import { GameReader } from '../../wtcd/GameReader';
import { WTCDRoot } from '../../wtcd/types';
import {
  WTCD_GAME_LOAD,
  WTCD_GAME_NO_DESC,
  WTCD_GAME_QUICK_LOAD,
  WTCD_GAME_QUICK_SAVE,
  WTCD_GAME_RESTART,
  WTCD_GAME_RESTART_ALL,
  WTCD_GAME_RESTART_ALL_DESC,
  WTCD_GAME_RESTART_CANCEL,
  WTCD_GAME_RESTART_DECISION_ONLY,
  WTCD_GAME_RESTART_DECISION_ONLY_DESC,
  WTCD_GAME_RESTART_DESC,
  WTCD_GAME_RESTART_TITLE,
  WTCD_GAME_SAVE,
  WTCD_GAME_SAVE_CANCEL,
  WTCD_GAME_SAVE_NEW,
  WTCD_GAME_SAVE_OVERWRITE_CANCEL,
  WTCD_GAME_SAVE_OVERWRITE_CONFIRM,
  WTCD_GAME_SAVE_OVERWRITE_TITLE,
  WTCD_GAME_SAVE_TITLE,
} from '../constant/messages';
import { DebugLogger } from '../DebugLogger';
import { h } from '../hs';
import { formatTimeSimple } from '../util/formatTime';
import { Content, ContentBlock } from './contentControl';
import { createWTCDErrorMessageFromError } from './createWTCDErrorMessageFromError';
import { confirm, Modal } from './modalControl';

const debugLogger = new DebugLogger('WTCD Game Reader UI');

export class WTCDGameReaderUI {
  private reader: GameReader;
  private controlsBlock!: ContentBlock;
  private mainBlock: ContentBlock | null = null;
  public constructor(
    private content: Content,
    docIdentifier: string,
    wtcdRoot: WTCDRoot,
  ) {
    this.reader = new GameReader(
      docIdentifier,
      wtcdRoot,
      this.onOutput,
      this.onError,
    );
  }
  private started = false;
  public start() {
    if (this.started) {
      throw new Error('Already started.');
    }
    this.started = true;
    this.controlsBlock = this.content.addBlock({
      initElement: h('div.wtcd-game-control',
        h('.button-container', [
          h('div', { onclick: this.onClickRestart }, WTCD_GAME_RESTART),
          h('div', { onclick: this.onClickSave }, WTCD_GAME_SAVE),
          h('div', { onclick: this.onClickLoad }, WTCD_GAME_LOAD),
          h('div', { onclick: this.onClickQuickSave }, WTCD_GAME_QUICK_SAVE),
          h('div', { onclick: this.onClickQuickLoad }, WTCD_GAME_QUICK_LOAD),
        ]),
      ) as HTMLDivElement,
    });
    const startTime = Date.now();
    this.reader.start();
    debugLogger.log(`Game loaded in ${Date.now() - startTime}ms.`);
  }
  private onClickRestart = () => {
    const modal = new Modal(h('div', [
      h('h1', WTCD_GAME_RESTART_TITLE),
      h('p', WTCD_GAME_RESTART_DESC),
      h('ul', [
        h('li', WTCD_GAME_RESTART_ALL_DESC),
        h('li', WTCD_GAME_RESTART_DECISION_ONLY_DESC),
      ]),
      h('.button-container', [
        h('div', { onclick: () => {
          this.reader.reset(true);
          modal.close();
        }}, WTCD_GAME_RESTART_ALL),
        h('div', { onclick: () => {
          this.reader.reset(false);
          modal.close();
        }}, WTCD_GAME_RESTART_DECISION_ONLY),
        h('div', { onclick: () => modal.close() }, WTCD_GAME_RESTART_CANCEL),
      ]),
    ]));
    modal.open();
  }
  private onClickSave = () => {
    const modal = new Modal(h('div', [
      h('h1', WTCD_GAME_SAVE_TITLE),
      h('.wtcd-save-button-list', this.reader.getSaves().map(
        (save, saveIndex) => {
          if (saveIndex === 0) {
            return null; // quick save
          }
          if (save === null) {
            return h('.new', {
              onclick: () => {
                this.reader.save(saveIndex);
                modal.close();
              },
            }, WTCD_GAME_SAVE_NEW);
          } else {
            return h('.save', {
              onclick: () => {
                confirm(
                  WTCD_GAME_SAVE_OVERWRITE_TITLE,
                  '',
                  WTCD_GAME_SAVE_OVERWRITE_CONFIRM,
                  WTCD_GAME_SAVE_OVERWRITE_CANCEL,
                ).then(result => {
                  if (result) {
                    this.reader.save(saveIndex);
                    modal.close();
                  }
                });
              },
            }, [
              h('.id', String(saveIndex)),
              h('.info', [
                h('.state-desc', save.desc === ''
                  ? WTCD_GAME_NO_DESC
                  : save.desc),
                h('.date', formatTimeSimple(save.date)),
              ]),
            ]);
          }
        },
      )),
      h('.button-container', { style: { 'margin-top': '1.2vh' } }, [
        h('div', { onclick: () => modal.close() }, WTCD_GAME_SAVE_CANCEL),
      ]),
    ]));
    modal.open();
  }
  private onClickLoad = () => {
    new Modal().open();
  }
  private onClickQuickSave = () => {
    this.reader.save(0);
  }
  private onClickQuickLoad = () => {
    this.reader.load(0);
  }
  private onOutput = (content: HTMLDivElement) => {
    if (this.mainBlock === null) {
      debugLogger.log('Initialize main block.');
      this.mainBlock = this.content.addBlock({
        initElement: content,
        slidable: true,
      });
    } else {
      debugLogger.log('Updating main block.');
      this.content.scrollTo(this.controlsBlock.element.offsetTop);
      this.mainBlock.slideReplace(content);
    }
  }
  private onError = (error: Error) => {
    debugLogger.warn('Game reader reported error.');
    this.content.addBlock({
      initElement: createWTCDErrorMessageFromError(error),
    });
  }
}
