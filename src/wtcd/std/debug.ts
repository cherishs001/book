import { getMaybePooled } from '../constantsPool';
import { describe } from '../Interpreter';
import { NativeFunction } from '../types';
export const debugStdFunctions: Array<NativeFunction> = [
  function print(args) {
    console.group('WTCD print call');
    args.forEach((arg, index) => console.info(`[${index}] ${describe(arg)}`));
    console.groupEnd();
    return getMaybePooled('null', null);
  },
];
