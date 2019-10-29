import { clone, getMaybePooled } from './constantsPool';
import { binaryOperators, unaryOperators } from './operators';
import { Random } from './Random';
import { stdFunctions } from './std';
import {
  BlockExpression,
  ChoiceExpression,
  ConditionalExpression,
  DeclarationStatement,
  Expression,
  FunctionExpression,
  ListExpression,
  NativeFunction,
  RegisterName,
  Section,
  SelectionAction,
  Statement,
  SwitchExpression,
  WTCDRoot,
} from './types';
import { arrayEquals, flat } from './utils';
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

export interface ListValue {
  type: 'list';
  value: Array<RuntimeValue>;
}

export interface ActionValue {
  type: 'action';
  value: {
    action: 'goto';
    target: Array<string>;
  } | {
    action: 'exit';
  } | {
    action: 'selection';
    choices: Array<ChoiceValue>;
  };
}
export interface ChoiceValue {
type: 'choice';
  value: {
    text: string;
    action: ActionValue | NullValue;
  };
}

// export interface SelectionValue {
//   type: 'selection';
//   value: {
//     choices: Array<ChoiceValue>;
//   };
// }

export interface FunctionValue {
  type: 'function';
  value: ({
    builtIn: false;
    expr: FunctionExpression;
    captured: Array<{
      name: string,
      value: RuntimeValueMutable,
    }>;
  } | {
    builtIn: true,
    nativeFn: NativeFunction,
  });
}

export type RuntimeValueMutable
  = NumberValue
  | BooleanValue
  | StringValue
  | NullValue
  | ActionValue
  | ChoiceValue
  | ListValue
  | FunctionValue;
export type RuntimeValue = Readonly<RuntimeValueMutable>;

export type RuntimeValueType = RuntimeValue['type'];

export type RuntimeValueRaw<T extends RuntimeValueType> = Extract<
  RuntimeValue,
  { type: T }
>['value'];

export function isEqual(v0: RuntimeValue, v1: RuntimeValue): boolean {
  if (v0.type !== v1.type) {
    return false;
  }
  switch (v0.type) {
    case 'null':
      return true;
    case 'number':
    case 'boolean':
    case 'string':
      return v0.value === v1.value;
    case 'action':
      if (v0.value.action !== (v1 as any).value.action) {
        return false;
      }
      switch (v0.value.action) {
        case 'exit':
          return true;
        case 'goto':
          return arrayEquals(v0.value.target, (v1 as any).value.target);
        case 'selection':
          return (v0.value.choices.length
            === (v1 as any).value.choices.length) &&
            (v0.value.choices.every((choice, index) => isEqual(
              choice,
              (v1 as any).value.choices[index]),
            ));
      }
      throw new Error('Shouldn\'t fall through.');
    case 'choice':
      return (
        (v0.value.text === (v1 as any).value.text) &&
        (isEqual(v0.value.action, (v1 as any).value.action))
      );
    case 'function':
      if (v0.value.builtIn !== (v1 as FunctionValue).value.builtIn) {
        return false;
      }
      if (v0.value.builtIn === true) {
        return (v0.value.nativeFn === (v1 as any).value.nativeFn);
      } else {
        return (
          // They refer to same expression
          (v0.value.expr === (v1 as any).value.expr) &&
          (v0.value.captured.every((v0Cap, index) => {
            const v1Cap = (v1 as any).value.captured[index];
            return (
              (v0Cap.name === v1Cap.name) &&
              // Reference equality to make sure they captured the same
              // variable
              (v0Cap.value === v1Cap.value)
            );
          }))
        );
      }
    case 'list':
      return (
        (v0.value.length === (v1 as ListValue).value.length) &&
        (v0.value.every((element, index) => isEqual(
          element,
          (v1 as ListValue).value[index]),
        ))
      );
  }
}

export type Evaluator = (expr: Expression) => RuntimeValue;

export enum BubbleSignalType {
  YIELD,
  RETURN,
}

/**
 * Bubble signal is used for traversing upward the call stack. It is implemented
 * with JavaScript's Error. Such signal might be yield or return.
 */
export class BubbleSignal extends Error {
  public constructor(
    public readonly type: BubbleSignalType,
  ) {
    super('Uncaught Bubble Signal.');
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Create a string describing a runtime value including its type and value.
 */
export function describe(rv: RuntimeValue): string {
  switch (rv.type) {
    case 'number':
    case 'boolean':
      return `${rv.type} (value = ${rv.value})`;
    case 'string':
      return `string (value = "${rv.value}")`;
    case 'choice':
      return `choice (action = ${describe(rv.value.action)}, label = ` +
        `"${rv.value.text}")`;
    case 'action':
      switch (rv.value.action) {
        case 'goto':
          return `action (type = goto, target = ${rv.value.target})`;
        case 'exit':
          return `action (type = exit)`;
        case 'selection':
          return `action (type = selection, choices = [${rv.value.choices
            .map(describe).join(', ')}])`;
      }
    case 'null':
      return 'null';
    case 'list':
      return `list (elements = [${rv.value.map(describe).join(', ')}])`;
    case 'function':
      if (rv.value.builtIn) {
        return `function (native ${rv.value.nativeFn.name})`;
      } else {
        return `function (arguments = [${rv.value.expr.arguments
          .map(arg => arg.name)
          .join(', ')
        }])`;
      }
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
  public addVariable(variableName: string, value: RuntimeValue) {
    this.variables.set(variableName, value);
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

export interface InterpreterHandle {
  evaluator(expr: Expression): RuntimeValue;
  pushScope(): RuntimeScope;
  popScope(): RuntimeScope | undefined;
  resolveVariableReference(variableName: string): RuntimeValueMutable;
  getRandom(): Random;
  pushContent($element: HTMLElement): void;
  readonly timers: Map<string, number>;
}

export class Interpreter {
  private timers: Map<string, number> = new Map();
  private interpreterHandle: InterpreterHandle = {
    evaluator: this.evaluator.bind(this),
    pushScope: this.pushScope.bind(this),
    popScope: this.popScope.bind(this),
    resolveVariableReference: this.resolveVariableReference.bind(this),
    getRandom: () => this.random,
    pushContent: this.pushContent.bind(this),
    timers: this.timers,
  };
  public constructor(
    private wtcdRoot: WTCDRoot,
    private random: Random,
  ) {
    this.sectionStack.push(this.wtcdRoot.sections[0]);
  }
  private scopes: Array<RuntimeScope> = [];
  private sectionStack: Array<Section> = [];
  private resolveVariableReference(variableName: string): RuntimeValueMutable {
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
      `has been modified`);
  }
  private getCurrentScope(): RuntimeScope {
    return this.scopes[this.scopes.length - 1];
  }
  private pushScope() {
    const scope = new RuntimeScope();
    this.scopes.push(scope);
    return scope;
  }
  private popScope() {
    return this.scopes.pop();
  }
  private evaluateChoiceExpression(expr: ChoiceExpression): ChoiceValue {
    const text = this.evaluator(expr.text);
    if (text.type !== 'string') {
      throw WTCDError.atLocation(expr, `First argument of choice is expected to be a string, ` +
        `received: ${describe(text)}`);
    }
    const action = this.evaluator(expr.action);
    if (action.type !== 'action' && action.type !== 'null') {
      throw WTCDError.atLocation(expr, `Second argument of choice is expected to be an action ` +
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
      let value: RuntimeValue;
      if (singleDeclaration.initialValue !== null) {
        value = this.evaluator(singleDeclaration.initialValue);
      } else {
        switch (singleDeclaration.variableType) {
          case 'boolean':
            value = getMaybePooled('boolean', false);
            break;
          case 'number':
            value = getMaybePooled('number', 0);
            break;
          case 'string':
            value = getMaybePooled('string', '');
            break;
          case 'list':
            value = { type: 'list', value: [] };
            break;
          default:
            throw WTCDError.atLocation(expr, `Variable type ${singleDeclaration.variableType} ` +
              `does not have a default initial value`);
        }
      }
      if (value.type !== singleDeclaration.variableType) {
        throw WTCDError.atLocation(expr, `The type of variable ${singleDeclaration.variableName} is ` +
          `${singleDeclaration.variableType}, thus cannot hold ${describe(value)}`);
      }
      this.getCurrentScope().addVariable(
        singleDeclaration.variableName,
        { type: singleDeclaration.variableType, value: value.value } as any,
      );
    }
  }

  private evaluateBlockExpression(expr: BlockExpression): RuntimeValue {
    const scope = this.pushScope();
    try {
      scope.addRegister('yield');
      for (const statement of expr.statements) {
        this.executeStatement(statement);
      }
      return scope.getRegister('yield')!;
    } catch (error) {
      if (
        (error instanceof BubbleSignal) &&
        (error.type === BubbleSignalType.YIELD)
      ) {
        return scope.getRegister('yield')!;
      }
      throw error;
    } finally {
      this.popScope();
    }
  }

  private evaluateSelectionExpression(expr: SelectionAction): ActionValue {
    const choicesList = this.evaluator(expr.choices);
    if (choicesList.type !== 'list') {
      throw WTCDError.atLocation(expr, `Expression after selection is ` +
        `expected to be a list of choices, received: ` +
        `${describe(choicesList)}`);
    }
    const choices = choicesList.value
      .filter(choice => choice.type !== 'null');
    for (let i = 0; i < choices.length; i++) {
      if (choices[i].type !== 'choice') {
        throw WTCDError.atLocation(expr, `Choice at index ${i} is expected ` +
          `to be a choice, received: ${describe(choices[i])}`);
      }
    }
    return {
      type: 'action',
      value: {
        action: 'selection',
        choices: choices as Array<Readonly<ChoiceValue>>,
      },
    };
  }

  private evaluateListExpression(expr: ListExpression): ListValue {
    return {
      type: 'list',
      value: flat(expr.elements.map(expr => {
        if (expr.type !== 'spread') {
          return this.evaluator(expr);
        }
        const list = this.evaluator(expr.expression);
        if (list.type !== 'list') {
          throw WTCDError.atLocation(expr, `Spread operator "..." can only ` +
            `be used before a list, received: ${describe(list)}`);
        }
        return list.value;
      })),
    };
  }

  private evaluateFunctionExpression(expr: FunctionExpression): FunctionValue {
    return {
      type: 'function',
      value: {
        builtIn: false,
        expr,
        captured: expr.captures.map(variableName => ({
          name: variableName,
          value: this.resolveVariableReference(variableName),
        })),
      },
    };
  }

  private evaluateSwitchExpression(expr: SwitchExpression): RuntimeValue {
    const switchValue = this.evaluator(expr.expression);
    for (const switchCase of expr.cases) {
      const matches = this.evaluator(switchCase.matches);
      if (matches.type !== 'list') {
        throw WTCDError.atLocation(switchCase.matches, `Value to match for ` +
          `each case is expected to be a list, received: ` +
          `${describe(matches)}`);
      }
      if (matches.value.some(oneMatch => isEqual(oneMatch, switchValue))) {
        // Matched
        return this.evaluator(switchCase.returns);
      }
    }
    // Default
    if (expr.defaultCase === null) {
      throw WTCDError.atLocation(expr, `None of the cases matched and no ` +
        `default case is provided`);
    } else {
      return this.evaluator(expr.defaultCase);
    }
  }

  private evaluator(expr: Expression): RuntimeValue {
    switch (expr.type) {
      case 'unaryExpression':
        return unaryOperators.get(expr.operator)!.fn(
          expr,
          this.interpreterHandle,
        );
      case 'binaryExpression':
        return binaryOperators.get(expr.operator)!.fn(
          expr,
          this.interpreterHandle,
        );
      case 'booleanLiteral':
        return getMaybePooled('boolean', expr.value);
      case 'numberLiteral':
        return getMaybePooled('number', expr.value);
      case 'stringLiteral':
        return getMaybePooled('string', expr.value);
      case 'nullLiteral':
        return getMaybePooled('null', null);
      case 'list':
        return this.evaluateListExpression(expr);
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
      case 'exitAction':
        return {
          type: 'action',
          value: {
            action: 'exit',
          },
        };
      case 'selection':
        return this.evaluateSelectionExpression(expr);
      case 'variableReference':
        return clone(this.resolveVariableReference(expr.variableName));
      case 'function':
        return this.evaluateFunctionExpression(expr);
      case 'switch':
        return this.evaluateSwitchExpression(expr);
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
        return;
      case 'return':
        this.setRegister('return', this.evaluator(statement.value));
        throw new BubbleSignal(BubbleSignalType.RETURN);
      case 'setReturn':
        this.setRegister('return', this.evaluator(statement.value));
        return;
      default:
        throw WTCDError.atLocation(statement, 'Not implemented');
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

  private *executeAction(action: ActionValue): Generator<ContentOutput, void, number> {
    switch (action.value.action) {
      case 'goto':
        for (let i = action.value.target.length - 1; i >= 0; i--) {
          this.addToSectionStack(action.value.target[i]);
        }
        break;
      case 'exit':
        // Clears the section stack so the scripts end immediately
        this.sectionStack.length = 0;
        break;
      case 'selection': {
        const choicesRaw = action.value.choices;
        const choices: Array<SingleChoice> = choicesRaw.map(choice => ({
          content: choice.value.text,
          disabled: choice.value.action.type === 'null',
        }));
        const yieldValue: ContentOutput = {
          content: this.currentlyBuilding,
          choices,
        };
        this.currentlyBuilding = [];
        // Hands over control so player can make a decision
        const playerChoiceIndex = yield yieldValue;
        const playerChoice = choicesRaw[playerChoiceIndex];
        if (playerChoice === undefined || playerChoice.value.action.type === 'null') {
          throw new InvalidChoiceError(playerChoiceIndex);
        }
        yield* this.executeAction(playerChoice.value.action);
        break;
      }
    }
  }

  private started = false;
  private sectionEnterTimes = new Map<string, number>();
  private currentlyBuilding: Array<HTMLElement> = [];
  private pushContent($element: HTMLElement) {
    this.currentlyBuilding.push($element);
  }
  public *start(): Generator<ContentOutput, ContentOutput, number> {
    const stdScope = this.pushScope();
    for (const stdFunction of stdFunctions) {
      stdScope.addVariable(stdFunction.name, {
        type: 'function',
        value: {
          builtIn: true,
          nativeFn: stdFunction,
        },
      });
    }

    // Global scope
    this.pushScope();

    if (this.started) {
      throw new Error('Interpretation has already started.');
    }
    this.started = true;

    let lastSection: Section | null = null;

    try {
      // Initialization
      for (const statement of this.wtcdRoot.initStatements) {
        this.executeStatement(statement);
      }
      const $host = document.createElement('div');
      while (this.sectionStack.length !== 0) {
        const currentSection = this.sectionStack.pop()!;
        lastSection = currentSection;

        // Evaluate the executes clause
        if (currentSection.executes !== null) {
          this.evaluator(currentSection.executes);
        }

        /** Times this section has been entered including this time */
        const enterTime = this.sectionEnterTimes.has(currentSection.name)
          ? this.sectionEnterTimes.get(currentSection.name)! + 1
          : 1;
        this.sectionEnterTimes.set(currentSection.name, enterTime);

        /** Content that fits within the bounds */
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
            ($host.getElementsByClassName(variable.elementClass)[0] as HTMLSpanElement)
              .innerText = String(this.resolveVariableReference(variable.variableName).value);
          }
          let $current = $host.firstChild;
          while ($current !== null) {
            if ($current instanceof HTMLElement) {
              this.pushContent($current);
            }
            $current = $current.nextSibling;
          }
        }
        const then = this.evaluator(currentSection.then);
        if (then.type === 'action') {
          yield* this.executeAction(then);
        } else if (then.type !== 'null') {
          throw WTCDError.atLocation(currentSection.then, `Expression after ` +
            `then is expected to return an action, or null, ` +
            `received: ${describe(then)}`);
        }
      }
    } catch (error) {
      if (error instanceof BubbleSignal) {
        throw WTCDError.atUnknown(`Uncaught BubbleSignal with type "${error.type}".`);
      }
      if (error instanceof WTCDError) {
        if (lastSection === null) {
          error.pushWTCDStack(`initialization`);
        } else {
          error.pushWTCDStack(`section "${lastSection.name}"`, lastSection);
        }
      }
      throw error;
    }
    return {
      content: this.currentlyBuilding,
      choices: [],
    };
  }
}