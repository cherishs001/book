import { ContentOutput, Interpreter } from './Interpreter';
import { Random } from './Random';
import { WTCDRoot } from './types';

interface GameData {
  random: string;
  decisions: Array<number>;
}
function isGameData(data: any): data is GameData {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  if (typeof data.random !== 'string') {
    return false;
  }
  if (!Array.isArray(data.decisions)) {
    return false;
  }
  if (data.decisions.some((decision: any) => typeof decision !== 'number')) {
    return false;
  }
  return true;
}
interface SaveData extends GameData {
  date: number;
  desc: string;
}
function isSaveData(data: any): data is SaveData {
  if (!isGameData(data)) {
    return false;
  }
  if (typeof (data as any).date !== 'number') {
    return false;
  }
  if (typeof (data as any).desc !== 'string') {
    return false;
  }
  return true;
}
interface Data {
  saves: Array<SaveData | null>;
  current: GameData;
}
function isData(data: any): data is Data {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  if (!isGameData(data.current)) {
    return false;
  }
  if (!Array.isArray(data.saves)) {
    return false;
  }
  if (!data.saves.every((save: any) => save === null || isSaveData(save))) {
    return false;
  }
  return true;
}

/**
 * This is one of the possible implementations of a WTCD reader.
 *
 * This is a reader specialized for games. This reader only display one section
 * at a time. This reader also does not allow undo.
 *
 * However, this reader does support save/load. It persists data via memorizing
 * all decisions too.
 */
export class GameReader {
  private storageKey: string;
  private data: Data;
  /** The interpreter */
  private interpreter!: Interpreter;
  /** The iterator of the interpreter */
  private interpreterIterator!: Iterator<ContentOutput, ContentOutput, number>;
  /** Where to render the output */
  private target!: HTMLElement;
  private parseData(data: any): Data | null {
    if (typeof data !== 'string') {
      return null;
    }
    let obj: any;
    try {
      obj = JSON.parse(data);
    } catch (error) {
      return null;
    }
    if (!isData(obj)) {
      return null;
    }
    return obj;
  }
  private persist() {
    window.localStorage.setItem(this.storageKey, JSON.stringify(this. data));
  }
  public getSaves() {
    return this.data.saves.map(save => save === null
      ? null
      : {
        desc: save.desc,
        date: new Date(save.date),
      },
    );
  }
  public load(saveIndex: number) {
    const save = this.data.saves[saveIndex];
    if (save === undefined || save === null) {
      throw new Error(`Illegal save index: ${saveIndex}.`);
    }
    this.data.current.random = save.random;
    this.data.current.decisions = save.decisions.slice();
    this.restoreGameState();
  }
  /** Calls this.interpreterIterator.next() and handles error. */
  private next(
    decision?: number,
  ): IteratorResult<ContentOutput, ContentOutput> {
    try {
      return this.interpreterIterator.next(decision as any);
    } catch (error) {
      const $errorMessage = this.errorMessageCreator(error);
      this.target.innerHTML = '';
      this.target.appendChild($errorMessage);
      return {
        done: true,
        value: {
          choices: [],
          content: [],
        },
      };
    }
  }
  private restoreGameState() {
    this.interpreter = new Interpreter(this.wtcdRoot, new Random(
      this.data.current.random,
    ));
    this.interpreterIterator = this.interpreter.start();
    let lastOutput = this.interpreterIterator.next();
    this.data.current.decisions.forEach(decision =>
      lastOutput = this.interpreterIterator.next(decision),
    );
    this.handleOutput(lastOutput.value);
  }
  private handleOutput(output: ContentOutput) {
    this.target.innerHTML = '';
    output.content.forEach($element =>
      this.target.appendChild($element));
    this.interpreter.getPinned().forEach($element =>
      this.target.appendChild($element));
    output.choices.forEach((choice, choiceIndex) => {
      const $button = document.createElement('div');
      $button.classList.add('wtcd-button');
      $button.innerText = choice.content;
      if (choice.disabled) {
        $button.classList.add('disabled');
      } else {
        $button.classList.add('candidate');
        $button.addEventListener('click', () => {
          this.data.current.decisions.push(choiceIndex);
          this.handleOutput(this.next(choiceIndex).value);
          this.persist();
        });
      }
      this.target.appendChild($button);
    });
    this.elementPreprocessor(this.target);
  }
  private started = false;
  public constructor(
    docIdentifier: string,
    private wtcdRoot: WTCDRoot,
    private errorMessageCreator: (error: Error) => HTMLElement,
    private elementPreprocessor: ($element: HTMLElement) => void,
  ) {
    this.storageKey = `wtcd.gr.${docIdentifier}`;
    this.data = this.parseData(
      window.localStorage.getItem(this.storageKey),
    ) || {
      saves: [null, null, null],
      current: {
        random: String(Math.random()),
        decisions: [],
      },
    };
  }
  public renderTo($target: HTMLElement) {
    if (this.started) {
      throw new Error('Game reader already started.');
    }
    this.started = true;
    this.target = $target;
    this.restoreGameState();
  }
}
