import { binaryOperators, unaryOperators } from './operators';
import { ChoiceExpression, Expression, Section, WTCDRoot } from './types';
import { WTCDError } from './WTCDError';

// Dispatching code for the runtime of WTCD

interface SingleChoice {
  content: string;
  disabled: boolean;
}

export interface ContentOutput {
  content: HTMLElement;
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
    target: string;
  };
}
export interface ChoiceValue {
  type: 'choice';
  value: {
    text: string;
    action: ActionValue | NullValue;
  };
}

export interface SelectionValue {
  type: 'selection';
  value: {
    choices: Array<ChoiceValue>;
  };
}

export type RuntimeValue = NumberValue | BooleanValue | StringValue | NullValue | ActionValue | ChoiceValue | SelectionValue;

export type RuntimeValueType = RuntimeValue['type'];

export type RuntimeValueRaw<T extends RuntimeValueType> = Extract<RuntimeValue, { type: T }>['value'];

export type Evaluator = (expr: Expression) => RuntimeValue;

/**
 * Create a string describing a runtime value including its type and value.
 */
export function describe(rv: RuntimeValue): string {
  switch (rv.type) {
    case 'number':
    case 'boolean':
      return `a ${rv.type} ${rv.value}`;
    case 'string':
      return `a string "${rv.value}"`;
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
  private variables: Map<string, RuntimeValue> = new Map();
  public resolveVariableReference(variableName: string): RuntimeValue | null {
    return this.variables.get(variableName) || null;
  }
}

export class Interpreter {
  public constructor(
    private wtcdRoot: WTCDRoot,
  ) {}
  private scopes: Array<RuntimeScope> = [ new RuntimeScope() ];
  private resolveVariableReference = (variableName: string): RuntimeValue => {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      const variable = this.scopes[i].resolveVariableReference(variableName);
      if (variable !== null) {
        return variable;
      }
    }
    throw new WTCDError(`Cannot resolve variable reference "${variableName}". ` +
      `This is caused by WTCD compiler's error or the compiled output has been ` +
      `modified.`, null);
  }
  private evaluateChoiceExpression(expr: ChoiceExpression): ChoiceValue {
    const text = this.evaluator(expr.text);
    if (text.type !== 'string') {
      throw WTCDError.atNode(`First argument of choice is expected to be a string, ` +
        `received: ${describe(text)}`, expr);
    }
    const action = this.evaluator(expr.action);
    if (action.type !== 'action' && action.type !== 'null') {
      throw WTCDError.atNode(`First argument of choice is expected to be an action ` +
        `or null, received: ${describe(text)}`, expr);
    }
    return {
      type: 'choice',
      value: {
        text: text.value,
        action,
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
        return { type: 'boolean', value: expr.value };
      case 'numberLiteral':
        return { type: 'number', value: expr.value };
      case 'stringLiteral':
        return { type: 'string', value: expr.value };
      case 'nullLiteral':
        return { type: 'null', value: null };
      case 'choiceExpression':
        return this.evaluateChoiceExpression(expr);
      case 'conditionalExpression':
        throw new Error('TODO');
      case 'declarationExpression':
        throw new Error('TODO');
      case 'expressionSet':
        throw new Error('TODO');
      case 'gotoAction':
        throw new Error('TODO');
      case 'selection':
        throw new Error('TODO');
      case 'variableReference':
        throw new Error('TODO');
    }
  }
  public *start() {
    const currentSection: Section | null = this.wtcdRoot.sections[0];
    while (currentSection !== null) {
      if (currentSection.executes !== undefined) {
        this.evaluator(currentSection.executes);
      }

    }
  }
}
