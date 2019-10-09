import { ContentOutput, Interpreter } from './Interpreter';
import { Random } from './Random';
import { WTCDRoot } from './types';

interface Data {
  random: string;
  decisions: Array<number>;
}

export class FlowInterface {
  private interpreter: Interpreter;
  private iterator: Iterator<ContentOutput, ContentOutput, number>;
  private storageKey: string;
  private data: Data;
  private target!: HTMLElement;
  private currentDecisionIndex: number = 0;
  private buttons: Array<Array<HTMLDivElement>> = [];
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
  public constructor(
    docIdentifier: string,
    wtcdRoot: any,
    private debug: boolean = false,
  ) {
    this.storageKey = `wtcd.${docIdentifier}`;
    this.data = this.parseData(window.localStorage.getItem(this.storageKey)) || {
      random: String(Math.random()),
      decisions: [],
    };
    this.interpreter = new Interpreter(
      wtcdRoot,
      new Random(this.data.random),
    );
    this.iterator = this.interpreter.start();
  }

  private decide(decision: number) {
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
    this.currentDecisionIndex++;
    this.handleOutput(this.iterator.next(decision).value);
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
      const yieldValue = this.iterator.next(decision);
      done = yieldValue.done;
      this.handleOutput(yieldValue.value);
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
