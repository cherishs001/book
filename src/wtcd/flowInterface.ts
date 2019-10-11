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
  private currentDecisionIndex: number = 0;
  private buttons: Array<Array<HTMLDivElement>> = [];
  private contents: Array<HTMLDivElement> = [];
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
  public resetInterpreter() {
    this.interpreter = new Interpreter(JSON.parse(this.wtcdRoot), new Random(this.data.random));
    this.iterator = this.interpreter.start();
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
    this.resetInterpreter();
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

  private undecide(decisionIndex: number) {
    this.resetInterpreter();

    this.data.decisions.splice(decisionIndex);
    this.buttons.splice(decisionIndex + 1);
    this.contents.splice(decisionIndex + 1).forEach($deletedContent => $deletedContent.remove());

    // Replay
    this.iterator.next();
    for (const decision of this.data.decisions) {
      this.iterator.next(decision);
    }

    this.buttons[decisionIndex].forEach($button => {
      if (!$button.classList.contains('disabled')) {
        $button.classList.remove('selected', 'unselected');
        $button.classList.add('candidate');
      }
    });

    this.currentDecisionIndex = decisionIndex;
  }

  private handleOutput(output: ContentOutput) {
    const $container = document.createElement('div');
    output.content.forEach($element => $container.appendChild($element));
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
            this.undecide(decisionIndex);
          } else if (this.currentDecisionIndex === decisionIndex) {
            this.decide(choiceIndex);
          }
        });
      }
      $container.appendChild($button);
      return $button;
    }));

    this.contents.push($container);
    this.target.appendChild($container);
  }

  private started: boolean = false;
  public renderTo(target: HTMLElement) {
    if (this.started) {
      throw new Error('Flow Interface already started.');
    }
    this.started = true;
    this.target = target;

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
}
