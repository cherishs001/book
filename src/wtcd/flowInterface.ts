import { ContentOutput, Interpreter } from './Interpreter';
import { Random } from './Random';
import { WTCDRoot } from './types';

interface Data {
  random: string;
  decisions: Array<number>;
}

export class FlowInterface {
  private interpreter!: Interpreter;
  private iterator!: Iterator<ContentOutput, ContentOutput, number>;
  private storageKey: string;
  private data: Data;
  private target!: HTMLElement;
  private currentDecisionIndex!: number;
  private buttons!: Array<Array<HTMLDivElement>>;
  /**
   * Verify and parse data stored in localStorage.
   */
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
    if (typeof obj.random !== 'string') {
      return null;
    }
    if (!Array.isArray(obj.decisions)) {
      return null;
    }
    if (obj.decisions.some((decision: any) => typeof decision !== 'number')) {
      return null;
    }
    return obj;
  }
  /** Fancy name for "save" */
  private persist() {
    window.localStorage.setItem(this.storageKey, JSON.stringify(this.data));
  }
  public reset() {
    this.interpreter = new Interpreter(JSON.parse(this.wtcdRoot), new Random(this.data.random));
    this.iterator = this.interpreter.start();
    this.currentDecisionIndex = 0;
    this.buttons = [];
    if (this.target !== undefined) {
      this.target.innerHTML = '';
    }
  }
  public constructor(
    docIdentifier: string,
    private wtcdRoot: string,
    private debug: boolean = false,
  ) {
    this.storageKey = `wtcd.${docIdentifier}`;
    this.data = this.parseData(window.localStorage.getItem(this.storageKey)) || {
      random: String(Math.random()),
      decisions: [],
    };
    this.reset();
  }

  private decide(decision: number, replay: boolean = false) {
    this.buttons[this.currentDecisionIndex].forEach(($button, choiceIndex) => {
      if ($button.classList.contains('disabled')) {
        return;
      }
      $button.classList.remove('candidate');
      if (choiceIndex === decision) {
        $button.classList.add('selected');
      } else {
        $button.classList.add('unselected');
      }
    });
    if (!replay) {
      this.data.decisions.push(decision);
    }
    this.currentDecisionIndex++;
    const yieldValue = this.iterator.next(decision);
    this.handleOutput(yieldValue.value);
    return yieldValue.done;
  }

  private handleOutput(output: ContentOutput) {
    output.content.forEach($element => this.target.appendChild($element));
    const decisionIndex = this.currentDecisionIndex;
    this.buttons.push(output.choices.map((choice, choiceIndex) => {
      const $button = document.createElement('div');
      $button.classList.add('wtcd-button');
      $button.innerText = choice.content;
      if (choice.disabled) {
        $button.classList.add('disabled');
      } else {
        $button.classList.add('candidate');
        $button.addEventListener('click', () => {
          if (this.data.decisions[decisionIndex] === choiceIndex) {
            this.reset();
            this.data.decisions = this.data.decisions.slice(0, decisionIndex);
            this.replay();
            return;
          }
          if (this.currentDecisionIndex !== decisionIndex) {
            return;
          }
          this.decide(choiceIndex);
        });
      }
      this.target.appendChild($button);
      return $button;
    }));
  }

  /** Replay all decisions stored in data */
  private replay() {
    const init  = this.iterator.next();
    let done = init.done;
    this.handleOutput(init.value);
    for (const decision of this.data.decisions) {
      if (done) {
        throw new Error('Replay failed: WTCD ended before decisions are all executed.');
      }
      done = this.decide(decision, true);
    }
  }

  private started: boolean = false;
  public renderTo(target: HTMLElement) {
    if (this.started) {
      throw new Error('Flow Interface already started.');
    }
    this.started = true;
    this.target = target;
    this.replay();
  }
}
