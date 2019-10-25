import { autoEvaluated } from './autoEvaluated';
import { BubbleSignal, BubbleSignalType, describe, InterpreterHandle, RuntimeValue, RuntimeValueRaw } from './Interpreter';
import { NativeFunctionError } from './std/utils';
import { BinaryExpression } from './types';
import { WTCDError } from './WTCDError';

export class FunctionInvocationError extends Error {
  public constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function invokeFunctionRaw(
  functionValue: RuntimeValueRaw<'function'>,
  args: Array<RuntimeValue>,
  interpreterHandle: InterpreterHandle,
): RuntimeValue {
  const {
    evaluator,
    pushScope,
    popScope,
  } = interpreterHandle;
  if (functionValue.builtIn) {
    try {
      return functionValue.nativeFn(args, interpreterHandle);
    } catch (error) {
      if (error instanceof NativeFunctionError) {
        // Wrap up native function errors
        throw new FunctionInvocationError(`Failed to call native function ` +
          `"${functionValue.nativeFn.name}". Reason: ${error.message}`);
      } else {
        throw error;
      }
    }
  }
  const scope = pushScope();
  try {
    scope.addRegister('return');
    // Check and add arguments to the scope
    functionValue.expr.arguments.forEach((argument, index) => {
      let value = args[index];
      if (value === undefined || value.type === 'null') {
        // Use default
        if (argument.defaultValue !== null) {
          value = evaluator(argument.defaultValue);
        } else {
          throw new FunctionInvocationError(`The ${index + 1}th argument of ` +
            `invocation is omitted, but it does not have a default value`);
        }
      }
      if (value.type !== argument.type) {
        throw new FunctionInvocationError(`The ${index + 1}th argument of ` +
          `invocation has wrong type. Expected: ${argument.type}, received: ` +
          `${describe(value)}`);
      }
      scope.addVariable(
        argument.name,
        {
          type: value.type,
          value: value.value,
        } as any,
      );
    });
    // Rest arg
    if (functionValue.expr.restArgName !== null) {
      scope.addVariable(
        functionValue.expr.restArgName,
        {
          type: 'list',
          value: args.slice(functionValue.expr.arguments.length),
        },
      );
    }
    // Restore captured variables
    functionValue.captured.forEach(captured => {
      scope.addVariable(
        captured.name,
        captured.value,
      );
    });
    // Invoke function
    const evaluatedValue = evaluator(functionValue.expr.expression);
    const registerValue = scope.getRegister('return')!;
    // Prioritize register value
    if (registerValue.type === 'null') {
      // Only use evaluated value if no return or setReturn statement is
      // executed.
      return evaluatedValue;
    } else {
      return registerValue;
    }
  } catch (error) {
    if (
      (error instanceof BubbleSignal) &&
      (error.type === BubbleSignalType.RETURN)
    ) {
      return scope.getRegister('return')!;
    }
    throw error;
  } finally {
    popScope();
  }
}

function handleError(expr: BinaryExpression, error: any): never {
  if (error instanceof FunctionInvocationError) {
    throw WTCDError.atLocation(expr, error.message);
  } else if (error instanceof WTCDError) {
    error.pushWTCDStack(`"${expr.operator}" invocation`, expr);
  }
  throw error;
}

export const regularInvocation = autoEvaluated((
  arg0,
  arg1,
  expr,
  interpreterHandle,
) => {
  if (arg0.type !== 'function') {
    throw WTCDError.atLocation(expr, `Left side of function invocation "::" ` +
      `is expected to be a function, received: ${describe(arg0)}`);
  }
  if (arg1.type !== 'list') {
    throw WTCDError.atLocation(expr, `Right side of function invocation "::" ` +
      `is expected to be a list, received: ${describe(arg1)}`);
  }
  try {
    return invokeFunctionRaw(arg0.value, arg1.value, interpreterHandle);
  } catch (error) {
    return handleError(expr, error);
  }
});

export const pipelineInvocation = autoEvaluated((
  arg0,
  arg1,
  expr,
  interpreterHandle,
) => {
  if (arg1.type !== 'function') {
    throw WTCDError.atLocation(expr, `Left side of pipeline invocation "|>" ` +
      `is expected to be a function, received: ${describe(arg1)}`);
  }
  try {
    return invokeFunctionRaw(arg1.value, [ arg0 ], interpreterHandle);
  } catch (error) {
    return handleError(expr, error);
  }
});

export const reverseInvocation = autoEvaluated((
  arg0,
  arg1,
  expr,
  interpreterHandle,
) => {
  if (arg0.type !== 'list') {
    throw WTCDError.atLocation(expr, `Left side of reverse invocation "|::" ` +
      `is expected to be a list, received: ${describe(arg0)}`);
  }
  if (arg1.type !== 'function') {
    throw WTCDError.atLocation(expr, `Right side of reverse invocation "|::" ` +
      `is expected to be a function, received: ${describe(arg1)}`);
  }
  try {
    return invokeFunctionRaw(arg1.value, arg0.value, interpreterHandle);
  } catch (error) {
    return handleError(expr, error);
  }
});
