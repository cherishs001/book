import { getMaybePooled } from '../constantsPool';
import { NativeFunction } from '../types';
import { assertArgsLength, assertArgType } from './utils';

export const numberStdFunctions: Array<NativeFunction> = [
  function min(args) {
    assertArgsLength(args, 1, Infinity);
    let min = Infinity;
    for (let i = 0; i < args.length; i++) {
      const value = assertArgType(args, i, 'number');
      if (value < min) {
        min = value;
      }
    }
    return getMaybePooled('number', min);
  },
  function max(args) {
    assertArgsLength(args, 1, Infinity);
    let max = -Infinity;
    for (let i = 0; i < args.length; i++) {
      const value = assertArgType(args, i, 'number');
      if (value > max) {
        max = value;
      }
    }
    return getMaybePooled('number', max);
  },
];
