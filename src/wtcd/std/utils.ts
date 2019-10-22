import { getMaybePooled } from '../constantsPool';
import {describe, RuntimeValue, RuntimeValueRaw, RuntimeValueType} from '../Interpreter';

export class NativeFunctionError extends Error {
  public constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function assertArgsLength(
  args: Array<RuntimeValue>,
  min: number,
  max: number = min,
) {
  if (args.length < min) {
    throw new NativeFunctionError(`Too many arguments are provided. ` +
    `Minimum number of arguments: ${min}. Received: ${args.length}`);
  }
  if (args.length > max) {
    throw new NativeFunctionError(`Too many arguments are provided. ` +
    `Maximum number of arguments: ${max}. Received: ${args.length}`);
  }
}

/** Turn undefined to null value */
export function nullify(
  args: Array<RuntimeValue>,
  index: number,
) {
  const value = args[index];
  if (value === undefined) {
    return getMaybePooled('null', null);
  }
  return value;
}

export function assertArgType<T extends RuntimeValueType>(
  args: Array<RuntimeValue>,
  index: number,
  type: T,
  defaultValue?: RuntimeValueRaw<T>,
): RuntimeValueRaw<T> {
  const value = nullify(args, index);
  if (value.type === 'null' && defaultValue !== undefined) {
    return defaultValue;
  }
  if (value.type !== type) {
    throw new NativeFunctionError(`The ${index}th argument of ` +
      `invocation has wrong type. Expected: ${type}. Received: ` +
      `${describe(value)}`);
  }
  return value.value as any;
}
