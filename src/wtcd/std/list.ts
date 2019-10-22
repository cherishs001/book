import { clone, getMaybePooled } from '../constantsPool';
import { FunctionInvocationError, invokeFunctionRaw } from '../invokeFunction';
import { NativeFunction } from '../types';
import { assertArgsLength, assertArgType, NativeFunctionError } from './utils';
import { WTCDError } from '../WTCDError';

export const listStdFunctions: Array<NativeFunction> = [
  function listSet(args) {
    assertArgsLength(args, 3);
    const list = assertArgType(args, 0, 'list');
    const index = assertArgType(args, 1, 'number');
    const value = args[2];
    if (index % 1 !== 0) {
      throw new NativeFunctionError(`Index (${index}) has to be an integer`);
    }
    if (index < 0) {
      throw new NativeFunctionError(`Index (${index}) cannot be negative`);
    }
    if (index >= list.length) {
      throw new NativeFunctionError(`Index (${index}) out of bounds. List ` +
        `length is ${list.length}`);
    }
    const newList = list.slice();
    newList[index] = value;
    return {
      type: 'list',
      value: newList,
    };
  },
  function listForEach(args, interpreterHandle) {
    assertArgsLength(args, 2);
    const list = assertArgType(args, 0, 'list');
    const fn = assertArgType(args, 1, 'function');
    list.forEach((element, index) => {
      try {
        invokeFunctionRaw(fn, [ element ], interpreterHandle);
      } catch (error) {
        if (error instanceof FunctionInvocationError) {
          throw new NativeFunctionError(`Failed to apply function to the ` +
            `${index}th element of list: ${error.message}`);
        } else if (error instanceof WTCDError) {
          error.pushWTCDStack(`listForEach (index = ${index})`);
        }
        throw error;
      }
    });
    return getMaybePooled('null', null);
  },
  function listMap(args, interpreterHandle) {
    assertArgsLength(args, 2);
    const list = assertArgType(args, 0, 'list');
    const fn = assertArgType(args, 1, 'function');
    const result = list.map((element, index) => {
      try {
        return invokeFunctionRaw(fn, [ element ], interpreterHandle);
      } catch (error) {
        if (error instanceof FunctionInvocationError) {
          throw new NativeFunctionError(`Failed to apply function to the ` +
            `${index}th element of list: ${error.message}`);
        } else if (error instanceof WTCDError) {
          error.pushWTCDStack(`listForEach (index = ${index})`);
        }
        throw error;
      }
    });
    return {
      type: 'list',
      value: result,
    };
  },
  function listCreateFilled(args) {
    assertArgsLength(args, 1, 2);
    const length = assertArgType(args, 0, 'number');
    const value = args.length === 1
      ? getMaybePooled('null', null)
      : args[1];
    if (length % 1 !== 0) {
      throw new NativeFunctionError(`Length (${length}) has to be an integer.`);
    }
    if (length < 0) {
      throw new NativeFunctionError(`Length (${length}) cannot be negative.`);
    }
    const list = new Array(length).fill(value);
    return {
      type: 'list',
      value: list,
    };
  },
];
