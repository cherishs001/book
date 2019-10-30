import { InterpreterHandle, RuntimeValue } from './Interpreter';
import { BinaryOperator, UnaryOperator } from './operators';

/**
 * Nodes that may include location info (for debugging) when sourceMap is
 * enabled can extend this interface.
 */
export interface OptionalLocationInfo {
  line?: number;
  column?: number;
}

export interface SingleSectionContent {
  /** Earliest time this content will be used */
  lowerBound?: number;
  /** Latest time this content will be used */
  upperBound?: number;
  /** The compiled html for this content */
  html: string;
  /** Variables used in the html */
  variables: Array<{
    elementClass: string,
    variableName: string,
  }>;
}

/** e.g. 42 */
export interface NumberLiteral extends OptionalLocationInfo {
  type: 'numberLiteral';
  value: number;
}

/** e.g. true */
export interface BooleanLiteral extends OptionalLocationInfo {
  type: 'booleanLiteral';
  value: boolean;
}

/** e.g. "Rin <3" */
export interface StringLiteral extends OptionalLocationInfo {
  type: 'stringLiteral';
  value: string;
}

/** e.g. null */
export interface NullLiteral extends OptionalLocationInfo {
  type: 'nullLiteral';
}

/** e.g. choice "do it" goto doIt */
export interface ChoiceExpression extends OptionalLocationInfo {
  type: 'choiceExpression';
  text: Expression;
  action: Expression;
}

/** e.g. 5 + 3, true && false, a += 4 */
export interface BinaryExpression extends OptionalLocationInfo {
  type: 'binaryExpression';
  operator: BinaryOperator;
  arg0: Expression;
  arg1: Expression;
}

/** e.g. !false, -100 */
export interface UnaryExpression extends OptionalLocationInfo {
  type: 'unaryExpression';
  operator: UnaryOperator;
  arg: Expression;
}

/** e.g. true ? 1 : 2 */
export interface ConditionalExpression extends OptionalLocationInfo {
  type: 'conditionalExpression';
  condition: Expression;
  then: Expression;
  otherwise: Expression;
}

/** e.g. goto eat */
export interface GotoAction extends OptionalLocationInfo {
  type: 'gotoAction';
  sections: Array<string>;
}

/** e.g. exit */
export interface ExitAction extends OptionalLocationInfo {
  type: 'exitAction';
}

/** e.g.
 * selection [
 *   choice "A" goto a
 *   choice "B" goto b
 * ]
 */
export interface SelectionAction extends OptionalLocationInfo {
  type: 'selection';
  choices: Expression;
}

/** e.g. { a += 3 b -= 10 } */
export interface BlockExpression extends OptionalLocationInfo {
  type: 'block';
  statements: Array<Statement>;
}

/** e.g. hello */
export interface VariableReference extends OptionalLocationInfo {
  type: 'variableReference';
  variableName: string;
}

/** e.g.
 * declare [
 *   number a = 100
 *   boolean b = false
 * ]
 */
export interface DeclarationStatement extends OptionalLocationInfo {
  type: 'declaration';
  declarations: Array<OneVariableDeclaration>;
}

/** return 5 */
export interface ReturnStatement extends OptionalLocationInfo {
  type: 'return';
  value: Expression;
}

/** return = 5 */
export interface SetReturnStatement extends OptionalLocationInfo {
  type: 'setReturn';
  value: Expression;
}

export interface YieldStatement extends OptionalLocationInfo {
  type: 'yield';
  value: Expression;
}

export interface SetYieldStatement extends OptionalLocationInfo {
  type: 'setYield';
  value: Expression;
}

export interface ExpressionStatement extends OptionalLocationInfo {
  type: 'expression';
  expression: Expression;
}

export interface FunctionArgument extends OptionalLocationInfo {
  name: string;
  type: VariableType;
  defaultValue: Expression | null;
}

export interface FunctionExpression extends OptionalLocationInfo {
  type: 'function';
  arguments: Array<FunctionArgument>;
  restArgName: string | null;
  captures: Array<string>;
  expression: Expression;
}

// NOTE: This is not an expression
export interface SpreadExpression extends OptionalLocationInfo {
  type: 'spread';
  expression: Expression;
}

export interface ListExpression extends OptionalLocationInfo {
  type: 'list';
  elements: Array<Expression | SpreadExpression>;
}

export interface SwitchCase extends OptionalLocationInfo {
  matches: Expression;
  returns: Expression;
}

export interface SwitchExpression extends OptionalLocationInfo {
  type: 'switch';
  expression: Expression;
  cases: Array<SwitchCase>;
  defaultCase: Expression | null;
}

export type Literal
  = NumberLiteral
  | BooleanLiteral
  | StringLiteral
  | NullLiteral;

export type OperatorExpression
  = BinaryExpression
  | UnaryExpression
  | ConditionalExpression;

export type Action = GotoAction | ExitAction | SelectionAction;

export type Expression
  = Literal
  | OperatorExpression
  | Action
  | BlockExpression
  | ChoiceExpression
  | VariableReference
  | FunctionExpression
  | ListExpression
  | SwitchExpression;

export type Statement
  = DeclarationStatement
  | ReturnStatement
  | SetReturnStatement
  | YieldStatement
  | SetYieldStatement
  | ExpressionStatement;

export interface Section extends OptionalLocationInfo {
  name: string;
  content: Array<SingleSectionContent>;
  executes: Expression | null;
  then: Expression;
}

export type VariableType
  = 'number'
  | 'boolean'
  | 'string'
  | 'action'
  | 'choice'
  | 'selection'
  | 'list'
  | 'function';

export interface OneVariableDeclaration extends OptionalLocationInfo {
  variableName: string;
  variableType: VariableType;
  initialValue: Expression | null;
}

export interface WTCDRoot {
  initStatements: Array<Statement>;
  sections: Array<Section>;
}

export type WTCDParseResult = {
  error: false;
  wtcdRoot: WTCDRoot;
} | {
  error: true;
  message: string;
  internalStack: string;
};

export type RegisterName = 'yield' | 'return';

export type NativeFunction = (
  args: ReadonlyArray<RuntimeValue>,
  interpreterHandle: InterpreterHandle,
) => RuntimeValue;
