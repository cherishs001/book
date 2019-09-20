import { binaryOperators, unaryOperators } from './operators';
import { Action, Expression, VariableType, WTCDRoot, Section } from './types';
import { WTCDError } from './WTCDError';

interface SingleChoice {
  content: string;
  disabled: boolean;
}

export interface ContentOutput {
  content: HTMLElement;
  choices: Array<SingleChoice>;
}

interface NumberValue {
  type: 'number';
  value: number;
}
interface BooleanValue {
  type: 'boolean';
  value: boolean;
}
interface StringValue {
  type: 'string';
  value: string;
}
interface NullValue {
  type: 'null';
  value: null;
}
interface ActionValue {
  type: 'action';
  value: {
    action: 'goto';
    target: string;
  };
}
interface ChoiceValue {
  type: 'choice';
  value: {
    text: string;
    action: ActionValue | NullValue;
  };
}

export type RuntimeValueType = 'number' | 'boolean' | 'string' | 'null' | 'action' | 'choice';

export type RuntimeValue = NumberValue | BooleanValue | StringValue | NullValue | ActionValue | ChoiceValue;

export type RuntimeValueRaw<T extends RuntimeValueType> = Extract<RuntimeValue, { type: T }>['value'];

export type Evaluator = (expr: Expression) => RuntimeValue;

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
  private evaluator = (expr: Expression) => {
    if (expr.type === 'unaryExpression') {
      return unaryOperators.get(expr.operator)!(expr, this.evaluator);
    }
  }
  public *start() {
    let currentSection: Section | null = this.wtcdRoot.sections[0];
    while (currentSection !== null) {
      if (currentSection.executes !== undefined) {
        this.evaluator(currentSection.executes);
      }
      
    }
  }
}
