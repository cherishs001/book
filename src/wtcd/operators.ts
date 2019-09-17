import { VariablesTypesMapping, VariableType, VariableValue } from './types';

function is(target: any) {
  return (other: any) => target === other;
}
function are(target0: any, target1: any) {
  return (other0: any, other1: any) => (other0 === target0) && (other1 === target1);
}
export type UnaryOperatorDefinition = Array<{
  test: (argType: VariableType) => boolean;
  return: VariableType;
  fn: (arg: any) => any;
}>;
export const unaryOperators = new Map<string, UnaryOperatorDefinition>([
  ['-', [{
    test: is('number'),
    return: 'number',
    fn: arg => -arg,
  }]],
  ['!', [{
    test: is('boolean'),
    return: 'boolean',
    fn: arg => !arg,
  }]],
]);

export interface BinaryOperatorDefinition {
  precedence: number;
  signatures: binaryOperatorSignatures;
}
export type binaryOperatorSignatures = Array<{
  test: (arg0Type: VariableType, arg1Type: VariableType) => boolean;
  return: VariableType;
  fn: (arg0: any, arg1: any) => VariableValue;
}>;
export const binaryOperators = new Map<string, BinaryOperatorDefinition>([
  ['+', {
    precedence: 13,
    signatures: [{
      test: are('number', 'number'),
      return: 'number',
      fn: (arg0, arg1) => arg0 + arg1,
    }, {
      test: (arg0, arg1) => arg0 === 'string' || arg1 === 'string',
      return: 'string',
      fn: (arg0, arg1) => arg0 + arg1,
    }],
  }],
  ['-', {
    precedence: 13,
    signatures: [{
      test: are('number', 'number'),
      return: 'number',
      fn: (arg0, arg1) => arg0 - arg1,
    }],
  }],
  ['*', {
    precedence: 14,
    signatures: [{
      test: are('number', 'number'),
      return: 'number',
      fn: (arg0, arg1) => arg0 * arg1,
    }],
  }]
]);

export const conditionalOperatorPrecedence = 4;
