import { getMaybePooled } from '../constantsPool';
import { NativeFunction } from '../types';
import { assertArgsLength, assertArgType } from './utils';

export const stringStdFunctions: Array<NativeFunction> = [
  function stringLength(args) {
    assertArgsLength(args, 1);
    const str = assertArgType(args, 0, 'string');
    return getMaybePooled('number', str.length);
  },
];
