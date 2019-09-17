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

export interface NumberLiteral extends OptionalLocationInfo {
  type: 'numberLiteral';
  value: number;
}

export interface BooleanLiteral extends OptionalLocationInfo {
  type: 'booleanLiteral';
  value: boolean;
}

export interface StringLiteral extends OptionalLocationInfo {
  type: 'stringLiteral';
  value: string;
}

export interface NullLiteral {
  type: 'null';
}

export interface ChoiceExpression extends OptionalLocationInfo {
  type: 'choiceExpression';
  text: Expression;
  result: Expression;
}

export type BinaryOperator = '+' | '-' | '*' | '/' | '^' | '&&' | '||' | '==' | '>' | '<' | '>=' | '<=' | '!=' | '=' | '+=' | '-=' | '*=' | '/=';

export interface BinaryExpression extends OptionalLocationInfo {
  type: 'binaryExpression';
  operator: BinaryOperator;
  arg0: Expression;
  arg1: Expression;
}

export type UnaryOperator = '-' | '!';

export interface UnaryExpression extends OptionalLocationInfo {
  type: 'unaryExpression';
  operator: UnaryOperator;
  arg: Expression;
}

export interface ConditionalExpression extends OptionalLocationInfo {
  type: 'conditionalExpression';
  condition: Expression;
  then: Expression;
  otherwise: Expression;
}

export interface GotoAction {
  type: 'gotoAction';
  section: string;
}

export interface DisabledAction {
  type: 'disabledAction';
}

export interface SelectionCommand {
  type: 'selectionCommand';
  choices: Array<ChoiceExpression>;
}

export interface ExpressionSet extends OptionalLocationInfo {
  type: 'expressionSet';
  expressions: Array<Expression>;
}

export interface DeclarationExpression {
  type: 'declarationExpression';
  lexicalScopeId: number;
  declarations: Array<OneVariableDeclaration>;
}

export interface VariableReference extends OptionalLocationInfo {
  type: 'variableReference';
  variableName: string;
}

export type Literal = NumberLiteral | BooleanLiteral | StringLiteral | NullLiteral;

export type OperatorExpression = BinaryExpression | UnaryExpression | ConditionalExpression;

export type Action = GotoAction | DisabledAction;

export type Expression = Literal | OperatorExpression | Action | ExpressionSet | ChoiceExpression | VariableReference;

export interface Section {
  name: string;
  content: Array<SingleSectionContent>;
  executes?: Function;
  then: Array<Expression>;
}

export interface VariablesTypesMapping {
  number: number;
  boolean: boolean;
  string: string;
}

export type VariableType = keyof VariablesTypesMapping;
export type VariableValue = VariablesTypesMapping[VariableType];

export interface OneVariableDeclaration extends OptionalLocationInfo {
  variableName: string;
  variableType: VariableType;
  initialValue: Expression;
}

export interface WTCDRoot {
  globalVariables: Array<OneVariableDeclaration>;
  sections: Array<Section>;
}
