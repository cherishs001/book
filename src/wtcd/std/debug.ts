import { getMaybePooled } from '../constantsPool';
import { describe } from '../Interpreter';
import { NativeFunction } from '../types';
import { assertArgsLength, assertArgType, NativeFunctionError } from './utils';
export const debugStdFunctions: Array<NativeFunction> = [
  function print(args) {
    console.group('WTCD print call');
    args.forEach((arg, index) => console.info(`[${index}] ${describe(arg)}`));
    console.groupEnd();
    return getMaybePooled('null', null);
  },
  function assert(args) {
    assertArgsLength(args, 1);
    const result = assertArgType(args, 0, 'boolean');
    if (!result) {
      throw new NativeFunctionError('Assertion failed');
    }
    return getMaybePooled('null', null);
  },
  function timeStart(args, interpreterHandle) {
    assertArgsLength(args, 0, 1);
    const name = assertArgType(args, 0, 'string', 'default');
    if (interpreterHandle.timers.has(name)) {
      throw new NativeFunctionError(`Timer "${name}" already existed.`);
    }
    interpreterHandle.timers.set(name, Date.now());
    return getMaybePooled('null', null);
  },
  function timeEnd(args, interpreterHandle) {
    assertArgsLength(args, 0, 1);
    const name = assertArgType(args, 0, 'string', 'default');
    if (!interpreterHandle.timers.has(name)) {
      throw new NativeFunctionError(`Cannot find timer "${name}".`);
    }
    const startTime = interpreterHandle.timers.get(name)!;
    interpreterHandle.timers.delete(name);
    const endTime = Date.now();
    console.group('WTCD timeEnd call');
    console.info(`Timer        : ${name}`);
    console.info(`Start time   : ${startTime}`);
    console.info(`End time     : ${endTime}`);
    console.info(`Time elapsed : ${endTime - startTime}ms`);
    console.groupEnd();
    return getMaybePooled('null', null);
  },
];
