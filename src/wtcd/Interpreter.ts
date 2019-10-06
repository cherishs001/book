import { getMaybePooled, nullValue } from './constantsPool';
import { binaryOperators, unaryOperators } from './operators';
import { Random } from './Random';
import { Action, BlockExpression, ChoiceExpression, ConditionalExpression, DeclarationStatement, Expression, RegisterName, Section, Selection, Statement, WTCDRoot } from './types';
import { WTCDError } from './WTCDError';

// Dispatching code for the runtime of WTCD

interface SingleChoice {
  content: string;
  disabled: boolean;
}

export interface ContentOutput {
  content: Array<HTMLElement>;
  choices: Array<SingleChoice>;
}

export interface NumberValue {
  type: 'number';
  value: number;
}
export interface BooleanValue {
  type: 'boolean';
  value: boolean;
}
export interface StringValue {
  type: 'string';
  value: string;
}
export interface NullValue {
  type: 'null';
  value: null;
}
export interface ActionValue {
  type: 'action';
  value: {
    action: 'goto';
    target: Array<string>;
  };
}
export interface ChoiceValue {
type: 'choice';
  value: {
    text: string;
    action: ActionValue | NullValue;
  };
}

type A = Readonly<ChoiceValue>;

export interface SelectionValue {
  type: 'selection';
  value: {
    choices: Array<ChoiceValue>;
  };
}

export type RuntimeValueMutable = NumberValue | BooleanValue | StringValue | NullValue | ActionValue | ChoiceValue | SelectionValue;
export type RuntimeValue = Readonly<RuntimeValueMutable>;

export type RuntimeValueType = RuntimeValue['type'];

export type RuntimeValueRaw<T extends RuntimeValueType> = Extract<RuntimeValue, { type: T }>['value'];

export type Evaluator = (expr: Expression) => RuntimeValue;

enum BubbleSignalType {
  YIELD,
  RETURN,
}

/**
 * Bubble signal is used for traversing upward the call stack. It is implemented
 * with JavaScript's Error. Such signal might be yield or return.
 */
class BubbleSignal extends Error {
  public constructor(
    public readonly type: BubbleSignalType,
  ) {
    super('Uncaught Bubble Signal.');
  }
}

/**
 * Create a string describing a runtime value including its type and value.
 */
export function describe(rv: RuntimeValue): string {
  switch (rv.type) {
    case 'number':
    case 'boolean':
      return `${rv.type} ${rv.value}`;
    case 'string':
      return `string "${rv.value}"`;
    case 'choice':
      return `a choice for action ${describe(rv.value.action)} with label "${rv.value.text}"`;
    case 'action':
      return `an action for goto to ${rv.value.action}`;
    case 'null':
      return 'null';
    case 'selection':
      return `a selection among the following choices: [${rv.value.choices.map(describe).join(', ')}]`;
  }
}

class RuntimeScope {
  private variables: Map<string, RuntimeValueMutable> = new Map();
  private registers: Map<string, RuntimeValue> | null = null;
  /**
   * Attempt to resolve the given variable name within this scope. If variable
   * is not found, return null.
   *
   * @param variableName
   * @returns
   */
  public resolveVariableReference(variableName: string): RuntimeValueMutable | null {
    return this.variables.get(variableName) || null;
  }
  public addVariable<T extends RuntimeValueType>(variableName: string, type: T, value: RuntimeValueRaw<T>) {
    this.variables.set(variableName, { type, value } as any);
  }
  public addRegister(registerName: RegisterName) {
    if (this.registers === null) {
      this.registers = new Map();
    }
    this.registers.set(registerName, getMaybePooled('null', null));
  }
  /**
   * If a register with given name exists on this scope, set the value of it and
   * return true. Otherwise, return false.
   *
   * @param registerName name of register
   * @param value value to set to
   * @returns whether the requested register is found
   */
  public setRegisterIfExist(registerName: RegisterName, value: RuntimeValue): boolean {
    if (this.registers === null) {
      return false;
    }
    if (!this.registers.has(registerName)) {
      return false;
    }
    this.registers.set(registerName, value);
    return true;
  }
  public getRegister(registerName: RegisterName): RuntimeValue | null {
    return this.registers && this.registers.get(registerName) || null;
  }
}

export class InvalidChoiceError extends Error {
  public constructor(
    public readonly choiceId: number,
  ) {
    super(`Invalid choice ${choiceId}.`);
  }
}

export class Interpreter {
  public constructor(
    private wtcdRoot: WTCDRoot,
    private random: Random,
  ) {
    this.sectionStack.push(this.wtcdRoot.sections[0]);
  }
  private scopes: Array<RuntimeScope> = [ new RuntimeScope() ];
  private sectionStack: Array<Section> = [];
  private resolveVariableReference = (variableName: string): RuntimeValueMutable => {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      const variable = this.scopes[i].resolveVariableReference(variableName);
      if (variable !== null) {
        return variable;
      }
    }
    throw WTCDError.atUnknown(`Cannot resolve variable reference "${variableName}". ` +
      `This is most likely caused by WTCD compiler's error or the compiled output ` +
      `has been modified`);
  }
  /**
   * Iterate through the scopes and set the first register with registerName to
   * given value.
   *
   * @param registerName The name of register to look for
   * @param value The value to set to
   */
  private setRegister(registerName: RegisterName, value: RuntimeValue) {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].setRegisterIfExist(registerName, value)) {
        return;
      }
    }
    throw WTCDError.atUnknown(`Cannot resolve register reference "${registerName}". ` +
      `This is mostly likely caused by WTCD compiler's error or the compiled output ` +
      `has been modified.`);
  }
  private getCurrentScope(): RuntimeScope {
    return this.scopes[this.scopes.length - 1];
  }
  private pushScope(): RuntimeScope {
    const scope = new RuntimeScope();
    this.scopes.push(scope);
    return scope;
  }
  private popScope() {
    this.scopes.pop();
  }
  private evaluateChoiceExpression(expr: ChoiceExpression): ChoiceValue {
    const text = this.evaluator(expr.text);
    if (text.type !== 'string') {
      throw WTCDError.atLocation(expr, `First argument of choice is expected to be a string, ` +
        `received: ${describe(text)}`);
    }
    const action = this.evaluator(expr.action);
    if (action.type !== 'action' && action.type !== 'null') {
      throw WTCDError.atLocation(expr, `First argument of choice is expected to be an action ` +
        `or null, received: ${describe(text)}`);
    }
    return {
      type: 'choice',
      value: {
        text: text.value,
        action,
      },
    };
  }

  private evaluateConditionalExpression(expr: ConditionalExpression): RuntimeValue {
    const condition = this.evaluator(expr.condition);
    if (condition.type !== 'boolean') {
      throw WTCDError.atLocation(expr, `First argument of a conditional expression is expected to ` +
        `be a boolean, received: ${describe(condition)}`);
    }
    // Only evaluate the necessary branch
    if (condition.value) {
      return this.evaluator(expr.then);
    } else {
      return this.evaluator(expr.otherwise);
    }
  }

  private executeDeclarationStatement(expr: DeclarationStatement) {
    for (const singleDeclaration of expr.declarations) {
      const value = this.evaluator(singleDeclaration.initialValue);
      if (value.type !== singleDeclaration.variableType) {
        throw WTCDError.atLocation(expr, `The type of variable ${singleDeclaration.variableName} is ` +
          `${singleDeclaration.variableType}, thus cannot hold ${describe(value)}`);
      }
      this.getCurrentScope().addVariable(
        singleDeclaration.variableName,
        singleDeclaration.variableType,
        value.value,
      );
    }
  }

  private evaluateBlockExpression(expr: BlockExpression): RuntimeValue {
    const scope = this.pushScope();
    scope.addRegister('yield');
    try {
      for (const statement of expr.statements) {
        this.executeStatement(statement);
      }
      return scope.getRegister('yield')!;
    } catch (error) {
      if ((error instanceof BubbleSignal) && (error.type === BubbleSignalType.YIELD)) {
        return scope.getRegister('yield')!;
      }
      throw error;
    } finally {
      this.popScope();
    }
  }

  private evaluateSelectionExpression(expr: Selection): SelectionValue {
    const choices = expr.choices
      .map(choiceExpr => this.evaluator(choiceExpr))
      .filter(choice => choice.type !== 'null');
    for (let i = 0; i < choices.length; i++) {
      if (choices[i].type !== 'choice') {
        throw WTCDError.atLocation(expr.choices[i], `Choice at index ${i} is expected to be a choice, ` +
          `received ${describe(choices[i])}.`);
      }
    }
    return {
      type: 'selection',
      value: {
        choices: choices as Array<Readonly<ChoiceValue>>,
      },
    };
  }

  private evaluator: (expr: Expression) => RuntimeValue = (expr: Expression) => {
    switch (expr.type) {
      case 'unaryExpression':
        return unaryOperators.get(expr.operator)!.fn(expr, this.evaluator);
      case 'binaryExpression':
        return binaryOperators.get(expr.operator)!.fn(expr, this.evaluator, this.resolveVariableReference);
      case 'booleanLiteral':
        return getMaybePooled('boolean', expr.value);
      case 'numberLiteral':
        return getMaybePooled('number', expr.value);
      case 'stringLiteral':
        return getMaybePooled('string', expr.value);
      case 'nullLiteral':
        return getMaybePooled('null', null);
      case 'choiceExpression':
        return this.evaluateChoiceExpression(expr);
      case 'conditionalExpression':
        return this.evaluateConditionalExpression(expr);
      case 'block':
        return this.evaluateBlockExpression(expr);
      case 'gotoAction':
        return {
          type: 'action',
          value: {
            action: 'goto',
            target: expr.sections,
          },
        };
      case 'selection':
        return this.evaluateSelectionExpression(expr);
      case 'variableReference':
        // RuntimeValues are immutable by nature so we don't need to worry about
        // anything changing the values of our variables.
        return this.resolveVariableReference(expr.variableName);
    }
  }

  private executeStatement(statement: Statement) {
    switch (statement.type) {
      case 'declaration':
        this.executeDeclarationStatement(statement);
        return;
      case 'expression':
        this.evaluator(statement.expression);
        return;
      case 'yield':
        this.setRegister('yield', this.evaluator(statement.value));
        throw new BubbleSignal(BubbleSignalType.YIELD); // Bubble up
      case 'setYield':
        this.setRegister('yield', this.evaluator(statement.value));
      default:
        throw WTCDError.atLocation(statement, 'Not implemented.');
    }
  }

  private addToSectionStack(sectionName: string) {
    for (const section of this.wtcdRoot.sections) {
      if (section.name === sectionName) {
        this.sectionStack.push(section);
        return;
      }
    }
    throw WTCDError.atUnknown(`Unknown section "${sectionName}"`);
  }

  private executeAction(action: ActionValue) {
    // Always type = goto
    for (let i = action.value.target.length - 1; i >= 0; i--) {
      this.addToSectionStack(action.value.target[i]);
    }
  }

  private started = false;
  private sectionEnterTimes = new Map<string, number>();
  private currentlyBuilding: Array<HTMLElement> = [];
  public *start(): Generator<ContentOutput, ContentOutput, number> {
    if (this.started) {
      throw new Error('Interpretation has already started.');
    }
    this.started = true;

    // Initialization
    for (const statement of this.wtcdRoot.initStatements) {
      this.executeStatement(statement);
    }
    const $host = document.createElement('div');
    while (this.sectionStack.length !== 0) {
      const currentSection = this.sectionStack.pop()!;
      if (currentSection.executes !== undefined) {
        this.evaluator(currentSection.executes);
      }
      const enterTime = this.sectionEnterTimes.has(currentSection.name)
        ? this.sectionEnterTimes.get(currentSection.name)! + 1
        : 1;
      this.sectionEnterTimes.set(currentSection.name, enterTime);
      const eligibleSectionContents = currentSection.content.filter(
        content => (content.lowerBound === undefined || content.lowerBound <= enterTime) &&
          (content.upperBound === undefined || content.upperBound >= enterTime),
      );
      if (eligibleSectionContents.length !== 0) {
        const selectedContent = eligibleSectionContents[
          this.random.nextInt(0, eligibleSectionContents.length)
        ];
        $host.innerHTML = selectedContent.html;
        // Parameterize
        for (const variable of selectedContent.variables) {
          console.info(variable.variableName);
          console.info(this.resolveVariableReference(variable.variableName));
          ($host.getElementsByClassName(variable.elementClass)[0] as HTMLSpanElement)
            .innerText = String(this.resolveVariableReference(variable.variableName).value);
        }
        let $current = $host.firstChild;
        while ($current !== null) {
          if ($current instanceof HTMLElement) {
            this.currentlyBuilding.push($current);
          }
          $current = $current.nextSibling;
        }
      }
      const then = this.evaluator(currentSection.then);
      if (then.type === 'selection') {
        const choices: Array<SingleChoice> = then.value.choices.map(choice => ({
          content: choice.value.text,
          disabled: choice.value.action.type === 'null',
        }));
        const yieldValue: ContentOutput = {
          content: this.currentlyBuilding,
          choices,
        };
        this.currentlyBuilding = [];
        const playerChoiceId = yield yieldValue;
        const playerChoice = then.value.choices[playerChoiceId];
        if (playerChoice === undefined || playerChoice.value.action.type === 'null') {
          throw new InvalidChoiceError(playerChoiceId);
        }
        this.executeAction(playerChoice.value.action);
      } else if (then.type === 'action') {
        this.executeAction(then);
      } else if (then.type !== 'null') {
        throw WTCDError.atLocation(currentSection.then, `Expression after then is expected to return ` +
          `selection, action, or null. Received: ${describe(then)}.`);
      }
    }
    return {
      content: this.currentlyBuilding,
      choices: [],
    };
  }
}
