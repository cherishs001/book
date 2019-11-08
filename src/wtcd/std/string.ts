import { getMaybePooled } from '../constantsPool';
import { NativeFunction } from '../types';
import { assertArgsLength, assertArgType, NativeFunctionError } from './utils';

export const stringStdFunctions: Array<NativeFunction> = [
  function stringLength(args) {
    assertArgsLength(args, 1);
    const str = assertArgType(args, 0, 'string');
    return getMaybePooled('number', str.length);
  },
  function stringFormatNumberFixed(args) {
    assertArgsLength(args, 1, 2);
    const num = assertArgType(args, 0, 'number');
    const digits = assertArgType(args, 1, 'number', 0);
    if (digits < 0 || digits > 100 || digits % 1 !== 0) {
      throw new NativeFunctionError('Digits must be an integer between 0 and ' +
        `100, received: ${digits}`);
    }
    return getMaybePooled('string', num.toFixed(digits));
  },
  function stringFormatNumberPrecision(args) {
    assertArgsLength(args, 2);
    const num = assertArgType(args, 0, 'number');
    const digits = assertArgType(args, 1, 'number');
    if (digits < 1 || digits > 100 || digits % 1 !== 0) {
      throw new NativeFunctionError('Digits must be an integer between 1 and ' +
        `100, received: ${digits}`);
    }
    return getMaybePooled('string', num.toPrecision(digits));
  },
];
