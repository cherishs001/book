import { Evaluator, RuntimeValue, RuntimeValueType, RuntimeValueTypeLookUp } from './Interpreter';
import { BinaryExpression, UnaryExpression } from './types';
import { WTCDError } from './WTCDError';

function describe(rv: RuntimeValue): string {
  switch (rv.type) {
    case 'number':
    case 'boolean':
      return `${rv.type} ${rv.value}`;
    case 'string':
      return `string "${rv.value}"`;
    case 'choice':
      return `choice for action ${describe(rv.value.action)} with label "${rv.value.text}"`;
    case 'action':
      return `goto to ${rv.value.action}`;
    case 'null':
      return 'null';
  }
}

export type UnaryOperator = '-' | '!';

type UnaryOperatorFn = (expr: UnaryExpression, evaluator: Evaluator) => RuntimeValue;
export const unaryOperators = new Map<string, UnaryOperatorFn>([
  ['-', (expr, evaluator) => {
    const arg = evaluator(expr.arg);
    if (arg.type !== 'number') {
      throw WTCDError.atNode(`Unary operator "-" can only be applied ` +
        `to a number. Received: ${describe(arg)}`, expr);
    }
    return { type: 'number', value: -arg.value };
  }],
  ['!', (expr, evaluator) => {
    const arg = evaluator(expr.arg);
    if (arg.type !== 'boolean') {
      throw WTCDError.atNode(`Unary operator "!" can only be applied ` +
        `to a boolean. Received: ${describe(arg)}`, expr);
    }
    return { type: 'boolean', value: !arg.value };
  }],
]);

export type BinaryOperator = '+' | '-' | '*' | '/' | '//' | '%' | '=' | '+=' | '-=' | '*=' | '/=' | '//=' | '%=';

type ResolveVariableReferenceFn = (variableName: string) => RuntimeValue;

type BinaryOperatorFn = (
  expr: BinaryExpression,
  evaluator: Evaluator,
  resolveVariableReference: ResolveVariableReferenceFn,
) => RuntimeValue;
export interface BinaryOperatorDefinition {
  precedence: number;
  fn: BinaryOperatorFn;
}
function autoEvaluated(fn: (
  arg0: RuntimeValue,
  arg1: RuntimeValue,
  expr: BinaryExpression,
  evaluator: Evaluator,
  resolveVariableReference: ResolveVariableReferenceFn,
) => RuntimeValue): BinaryOperatorFn {
  return (expr, evaluator, resolveVariableReference) => {
    const arg0 = evaluator(expr.arg0);
    const arg1 = evaluator(expr.arg1);
    return fn(arg0, arg1, expr, evaluator, resolveVariableReference);
  };
}
function autoEvaluatedSameTypeArg<T extends RuntimeValueType>(
  type: T,
  fn: (
    arg0: RuntimeValueTypeLookUp<T>,
    arg1: RuntimeValueTypeLookUp<T>,
    expr: BinaryExpression,
    evaluator: Evaluator,
    resolveVariableReference: ResolveVariableReferenceFn,
  ) => RuntimeValue,
): BinaryOperatorFn {
  return autoEvaluated((arg0, arg1, expr, evaluator, resolveVariableReference) => {
    if (arg0.type === type && arg1.type === type) {
      // See https://github.com/microsoft/TypeScript/issues/33517
      return fn(arg0 as any, arg1 as any, expr, evaluator, resolveVariableReference);
    } else {
      throw WTCDError.atNode(`Binary operator "${expr.operator}" can only be ` +
      `applied to two ${type}s. Received: ${describe(arg0)} (left) and ` +
      `${describe(arg1)} (right)`, expr);
    }
  });
}
function opAssignment<T0 extends RuntimeValueType, T1 extends RuntimeValueType>(
  arg0Type: T0, // Type of the variable
  arg1Type: T1,
  fn: (
    arg0: RuntimeValueTypeLookUp<T0>,
    arg1: RuntimeValueTypeLookUp<T1>,
    expr: BinaryExpression,
    evaluator: Evaluator,
    resolveVariableReference: ResolveVariableReferenceFn,
  ) => RuntimeValueTypeLookUp<T0>['value'],
): BinaryOperatorFn {
  return (expr, evaluator, resolveVariableReference) => {
    if (expr.arg0.type !== 'variableReference') {
        throw WTCDError.atNode(`Left side of binary operator "${expr.operator}" ` +
          `has to be a variable reference.`, expr);
    }
    const varRef = resolveVariableReference(expr.arg0.variableName);
    if (varRef.type !== arg0Type) {
      throw WTCDError.atNode(`Left side of binary operator "${expr.operator}" has to be a ` +
        `variable of type ${arg0Type}, actual type: ${varRef.type}`, expr);
    }
    const arg1 = evaluator(expr.arg1);
    if (arg1.type !== arg1Type) {
      throw WTCDError.atNode(`Right side of binary operator "${expr.operator}" ` +
        ` has to be a ${arg1Type}. Received: ${describe(arg1)}`, expr);
    }
    const newValue = fn(varRef as any, arg1 as any, expr, evaluator, resolveVariableReference);
    varRef.value = newValue;
    return {
      type: arg0Type,
      value: newValue,
    } as RuntimeValue;
  };
}
export const binaryOperators = new Map<string, BinaryOperatorDefinition>([
  ['=', {
    precedence: 3,
    fn: (expr, evaluator, resolveVariableReference) => {
      if (expr.arg0.type !== 'variableReference') {
        throw WTCDError.atNode(`Left side of binary operator "=" has to be a ` +
          `variable reference`, expr);
      }
      const varRef = resolveVariableReference(expr.arg0.variableName);
      const arg1 = evaluator(expr.arg1);
      if (arg1.type !== varRef.type) {
        throw WTCDError.atNode(`Variable ${expr.arg0.variableName} can only hold ` +
          `values of type ${varRef.type}. Received ${describe(arg1)}`, expr);
      }
      varRef.value = arg1.value;
      return arg1;
    },
  }],
  ['+=', {
    precedence: 3,
    fn: opAssignment('number', 'number', (arg0, arg1) => arg0.value + arg1.value),
  }],
  ['-=', {
    precedence: 3,
    fn: opAssignment('number', 'number', (arg0, arg1) => arg0.value - arg1.value),
  }],
  ['*=', {
    precedence: 3,
    fn: opAssignment('number', 'number', (arg0, arg1) => arg0.value * arg1.value),
  }],
  ['/=', {
    precedence: 3,
    fn: opAssignment('number', 'number', (arg0, arg1) => arg0.value / arg1.value),
  }],
  ['//=', {
    precedence: 3,
    fn: opAssignment('number', 'number', (arg0, arg1) => Math.trunc(arg0.value / arg1.value)),
  }],
  ['%=', {
    precedence: 3,
    fn: opAssignment('number', 'number', (arg0, arg1) => arg0.value % arg1.value),
  }],
  ['+', {
    precedence: 13,
    fn: autoEvaluated((arg0, arg1, expr) => {
      if (arg0.type === 'number' && arg1.type === 'number') {
        return {
          type: 'number',
          value: arg0.value + arg1.value,
        };
      } else if (arg0.type === 'string' && arg1.type === 'string') {
        return {
          type: 'string',
          value: arg0.value + arg1.value,
        };
      } else {
        throw WTCDError.atNode(`Binary operator "+" can only be applied to two ` +
          `strings or two numbers. Received: ${describe(arg0)} (left) and ` +
          `${describe(arg1)} (right)`, expr);
      }
    }),
  }],
  ['-', {
    precedence: 13,
    fn: autoEvaluatedSameTypeArg('number', (arg0, arg1) => ({
      type: 'number',
      value: arg0.value + arg1.value,
    })),
  }],
  ['*', {
    precedence: 14,
    fn: autoEvaluatedSameTypeArg('number', (arg0, arg1) => ({
      type: 'number',
      value: arg0.value * arg1.value,
    })),
  }],
  ['/', {
    precedence: 14,
    fn: autoEvaluatedSameTypeArg('number', (arg0, arg1) => ({
      type: 'number',
      value: arg0.value / arg1.value,
    })),
  }],
  ['//', {
    precedence: 14,
    fn: autoEvaluatedSameTypeArg('number', (arg0, arg1) => ({
      type: 'number',
      value: Math.trunc(arg0.value / arg1.value),
    })),
  }],
  ['%', {
    precedence: 14,
    fn: autoEvaluatedSameTypeArg('number', (arg0, arg1) => ({
      type: 'number',
      value: Math.trunc(arg0.value / arg1.value),
    })),
  }],
]);

export const conditionalOperatorPrecedence = 4;

export const operators = new Set([...unaryOperators.keys(), ...binaryOperators.keys(), '?', ':']);
