// This file defines all infix and prefix operators in WTCD.

import { getMaybePooled } from './constantsPool';
import { describe, Evaluator, RuntimeValue, RuntimeValueMutable, RuntimeValueRaw, RuntimeValueType } from './Interpreter';
import { BinaryExpression, UnaryExpression } from './types';
import { WTCDError } from './WTCDError';

export type UnaryOperator = '-' | '!';

type UnaryOperatorFn = (expr: UnaryExpression, evaluator: Evaluator) => RuntimeValue;

export interface UnaryOperatorDefinition {
  precedence: number;
  fn: UnaryOperatorFn;
}

export const unaryOperators = new Map<string, UnaryOperatorDefinition>([
  ['-', {
    precedence: 16,
    fn: (expr, evaluator) => {
      const arg = evaluator(expr.arg);
      if (arg.type !== 'number') {
        throw WTCDError.atLocation(expr, `Unary operator "-" can only be applied ` +
          `to a number. Received: ${describe(arg)}`);
      }
      return getMaybePooled('number', -arg.value);
    },
  }],
  ['!', {
    precedence: 16,
    fn: (expr, evaluator) => {
      const arg = evaluator(expr.arg);
      if (arg.type !== 'boolean') {
        throw WTCDError.atLocation(expr, `Unary operator "!" can only be applied ` +
          `to a boolean. Received: ${describe(arg)}`);
      }
      return getMaybePooled('boolean', !arg.value);
    },
  }],
]);

export type BinaryOperator = '+' | '-' | '*' | '/' | '~/' | '%' | '=' | '+=' | '-=' | '*=' | '/=' | '~/=' | '%=';

type ResolveVariableReferenceFn = (variableName: string) => RuntimeValueMutable;

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
function autoEvaluatedSameTypeArg<TArg extends RuntimeValueType, TReturn extends RuntimeValueType>(
  argType: TArg,
  returnType: TReturn,
  fn: (
    arg0Raw: RuntimeValueRaw<TArg>,
    arg1Raw: RuntimeValueRaw<TArg>,
    expr: BinaryExpression,
    evaluator: Evaluator,
    resolveVariableReference: ResolveVariableReferenceFn,
  ) => RuntimeValueRaw<TReturn>,
): BinaryOperatorFn {
  return autoEvaluated((arg0, arg1, expr, evaluator, resolveVariableReference) => {
    if (arg0.type === argType && arg1.type === argType) {
      // TypeScript is not smart enough to do the conversion here
      return getMaybePooled(
        returnType,
        fn(
          arg0.value as RuntimeValueRaw<TArg>,
          arg1.value as RuntimeValueRaw<TArg>,
          expr,
          evaluator,
          resolveVariableReference,
        ),
      );
    } else {
      throw WTCDError.atLocation(expr, `Binary operator "${expr.operator}" can only be ` +
        `applied to two ${argType}s. Received: ${describe(arg0)} (left) and ` +
        `${describe(arg1)} (right)`);
    }
  });
}
function opAssignment<T0 extends RuntimeValueType, T1 extends RuntimeValueType>(
  arg0Type: T0, // Type of the variable
  arg1Type: T1,
  fn: (
    arg0Raw: RuntimeValueRaw<T0>,
    arg1Raw: RuntimeValueRaw<T1>,
    expr: BinaryExpression,
    evaluator: Evaluator,
    resolveVariableReference: ResolveVariableReferenceFn,
  ) => RuntimeValueRaw<T0>,
): BinaryOperatorFn {
  return (expr, evaluator, resolveVariableReference) => {
    if (expr.arg0.type !== 'variableReference') {
        throw WTCDError.atLocation(expr, `Left side of binary operator "${expr.operator}" ` +
          `has to be a variable reference`);
    }
    const varRef = resolveVariableReference(expr.arg0.variableName);
    if (varRef.type !== arg0Type) {
      throw WTCDError.atLocation(expr, `Left side of binary operator "${expr.operator}" has to be a ` +
        `variable of type ${arg0Type}, actual type: ${varRef.type}`);
    }
    const arg1 = evaluator(expr.arg1);
    if (arg1.type !== arg1Type) {
      throw WTCDError.atLocation(expr, `Right side of binary operator "${expr.operator}" ` +
        ` has to be a ${arg1Type}. Received: ${describe(arg1)}`);
    }
    const newValue = fn(
      varRef.value as RuntimeValueRaw<T0>,
      arg1.value as RuntimeValueRaw<T1>,
      expr,
      evaluator,
      resolveVariableReference,
    );
    varRef.value = newValue;
    return getMaybePooled(arg0Type, newValue);
  };
}
export const binaryOperators = new Map<string, BinaryOperatorDefinition>([
  ['=', {
    precedence: 3,
    fn: (expr, evaluator, resolveVariableReference) => {
      if (expr.arg0.type !== 'variableReference') {
        throw WTCDError.atLocation(expr, `Left side of binary operator "=" has to be a ` +
          `variable reference`);
      }
      const varRef = resolveVariableReference(expr.arg0.variableName);
      const arg1 = evaluator(expr.arg1);
      if (arg1.type !== varRef.type) {
        throw WTCDError.atLocation(expr, `Variable "${expr.arg0.variableName}" can only hold ` +
          `values of type ${varRef.type}. Received ${describe(arg1)}`);
      }
      varRef.value = arg1.value;
      return arg1;
    },
  }],
  ['+=', {
    precedence: 3,
    fn: (expr, evaluator, resolveVariableReference) => {
      if (expr.arg0.type !== 'variableReference') {
        throw WTCDError.atLocation(expr, `Left side of binary operator "+=" ` +
          `has to be a variable reference`);
      }
      const varRef = resolveVariableReference(expr.arg0.variableName);
      if (varRef.type !== 'string' && varRef.type !== 'number') {
        throw WTCDError.atLocation(expr, `Left side of binary operator "+=" has to be a ` +
          `variable of type number or string, actual type: ${varRef.type}`);
      }
      const arg1 = evaluator(expr.arg1);
      if (arg1.type !== varRef.type) {
        throw WTCDError.atLocation(expr, `Right side of binary operator "+=" has to ` +
          ` be a ${varRef.type}. Received: ${describe(arg1)}`);
      }
      const newValue = (varRef.value as any) + arg1.value;
      varRef.value = newValue;
      return getMaybePooled(varRef.type, newValue);
    },
  }],
  ['-=', {
    precedence: 3,
    fn: opAssignment('number', 'number', (arg0Raw, arg1Raw) => arg0Raw - arg1Raw),
  }],
  ['*=', {
    precedence: 3,
    fn: opAssignment('number', 'number', (arg0Raw, arg1Raw) => arg0Raw * arg1Raw),
  }],
  ['/=', {
    precedence: 3,
    fn: opAssignment('number', 'number', (arg0Raw, arg1Raw) => arg0Raw / arg1Raw),
  }],
  ['~/=', {
    precedence: 3,
    fn: opAssignment('number', 'number', (arg0Raw, arg1Raw) => Math.trunc(arg0Raw / arg1Raw)),
  }],
  ['%=', {
    precedence: 3,
    fn: opAssignment('number', 'number', (arg0Raw, arg1Raw) => arg0Raw % arg1Raw),
  }],
  ['||', {
    precedence: 5,
    fn: (expr, evaluator) => {
      const arg0 = evaluator(expr.arg0);
      if (arg0.type !== 'boolean') {
        throw WTCDError.atLocation(expr, `Left side of binary operator "||" has to be a boolean. ` +
          `Received ${describe(arg0)}`);
      }
      if (arg0.value === true) {
        return getMaybePooled('boolean', true);
      }
      const arg1 = evaluator(expr.arg1); // Short-circuit evaluation
      if (arg1.type !== 'boolean') {
        throw WTCDError.atLocation(expr, `Right side of binary operator "||" has to be a boolean. ` +
          `Received ${describe(arg1)}`);
      }
      return getMaybePooled('boolean', arg1.value);
    },
  }],
  ['&&', {
    precedence: 6,
    fn: (expr, evaluator) => {
      const arg0 = evaluator(expr.arg0);
      if (arg0.type !== 'boolean') {
        throw WTCDError.atLocation(expr, `Left side of binary operator "&&" has to be a boolean. ` +
          `Received ${describe(arg0)}`);
      }
      if (arg0.value === false) {
        return getMaybePooled('boolean', false);
      }
      const arg1 = evaluator(expr.arg1); // Short-circuit evaluation
      if (arg1.type !== 'boolean') {
        throw WTCDError.atLocation(expr, `Right side of binary operator "&&" has to be a boolean. ` +
          `Received ${describe(arg1)}`);
      }
      return getMaybePooled('boolean', arg1.value);
    },
  }],
  ['==', {
    precedence: 10,
    fn: autoEvaluated((arg0, arg1) => (getMaybePooled(
      'boolean',
      (arg0.type === arg1.type) && (arg0.value === arg1.value),
    ))),
  }],
  ['!=', {
    precedence: 10,
    fn: autoEvaluated((arg0, arg1) => (getMaybePooled(
      'boolean',
      (arg0.type !== arg1.type) || (arg0.value !== arg1.value),
    ))),
  }],
  ['<', {
    precedence: 11,
    fn: autoEvaluatedSameTypeArg('number', 'boolean', (arg0Raw, arg1Raw) => arg0Raw < arg1Raw),
  }],
  ['<=', {
    precedence: 11,
    fn: autoEvaluatedSameTypeArg('number', 'boolean', (arg0Raw, arg1Raw) => arg0Raw <= arg1Raw),
  }],
  ['>', {
    precedence: 11,
    fn: autoEvaluatedSameTypeArg('number', 'boolean', (arg0Raw, arg1Raw) => arg0Raw > arg1Raw),
  }],
  ['>=', {
    precedence: 11,
    fn: autoEvaluatedSameTypeArg('number', 'boolean', (arg0Raw, arg1Raw) => arg0Raw >= arg1Raw),
  }],
  ['+', {
    precedence: 13,
    fn: autoEvaluated((arg0, arg1, expr) => {
      if (arg0.type === 'number' && arg1.type === 'number') {
        return getMaybePooled(
          'number',
          arg0.value + arg1.value,
        );
      } else if (arg0.type === 'string' && arg1.type === 'string') {
        return getMaybePooled(
          'string',
          arg0.value + arg1.value,
        );
      } else {
        throw WTCDError.atLocation(expr, `Binary operator "+" can only be applied to two ` +
          `strings or two numbers. Received: ${describe(arg0)} (left) and ` +
          `${describe(arg1)} (right)`);
      }
    }),
  }],
  ['-', {
    precedence: 13,
    fn: autoEvaluatedSameTypeArg('number', 'number', (arg0Raw, arg1Raw) => arg0Raw + arg1Raw),
  }],
  ['*', {
    precedence: 14,
    fn: autoEvaluatedSameTypeArg('number', 'number', (arg0Raw, arg1Raw) => arg0Raw * arg1Raw),
  }],
  ['/', {
    precedence: 14,
    fn: autoEvaluatedSameTypeArg('number', 'number', (arg0Raw, arg1Raw) => arg0Raw / arg1Raw),
  }],
  ['~/', {
    precedence: 14,
    fn: autoEvaluatedSameTypeArg('number', 'number', (arg0Raw, arg1Raw) => Math.trunc(arg0Raw / arg1Raw)),
  }],
  ['%', {
    precedence: 14,
    fn: autoEvaluatedSameTypeArg('number', 'number', (arg0Raw, arg1Raw) => arg0Raw % arg1Raw),
  }],
]);

export const conditionalOperatorPrecedence = 4;

export const operators = new Set([...unaryOperators.keys(), ...binaryOperators.keys(), '?', ':']);
