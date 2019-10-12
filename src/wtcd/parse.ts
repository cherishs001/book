import * as MDI from 'markdown-it';
import { BinaryOperator, binaryOperators, conditionalOperatorPrecedence, UnaryOperator, unaryOperators } from './operators';
import { SimpleIdGenerator } from './SimpleIdGenerator';
import { Token, TokenStream } from './TokenStream';
import { BinaryExpression, BlockExpression, BooleanLiteral, ChoiceExpression, ConditionalExpression, DeclarationStatement, ExitAction, Expression, ExpressionStatement, GotoAction, NullLiteral, NumberLiteral, OneVariableDeclaration, OptionalLocationInfo, RegisterName, ReturnStatement, Section, Selection, SetReturnStatement, SetYieldStatement, SingleSectionContent, Statement, StringLiteral, UnaryExpression, VariableReference, VariableType, WTCDParseResult, WTCDRoot, YieldStatement } from './types';
import { WTCDError } from './WTCDError';

const CURRENT_MAJOR_VERSION = 1;
const CURRENT_MINOR_VERSION = 0;

const CURRENT_VERSION_STR = CURRENT_MAJOR_VERSION + '.' + CURRENT_MINOR_VERSION;

export interface SimpleLogger {
  info(...stuff: any): void;
  error(...stuff: any): void;
  warn(...stuff: any): void;
}

/**
 * Represents a single lexical scope. Managed by LexicalScopeProvide.
 */
class LexicalScope {
  private declaredVariables: Set<string> = new Set();
  private registers: Set<RegisterName> = new Set();
  /** Whether this lexical scope contains the given variable */
  public hasVariable(variableName: string) {
    return this.declaredVariables.has(variableName);
  }
  /** Add a variable to this lexical scope */
  public addVariable(variableName: string) {
    this.declaredVariables.add(variableName);
  }
  /** Whether this lexical scope contains the given register */
  public hasRegister(registerName: RegisterName) {
    return this.registers.has(registerName);
  }
  /** Add a register to this lexical scope */
  public addRegister(registerName: RegisterName) {
    this.registers.add(registerName);
  }
}

/**
 * Provide lexical context for the parser.
 * Mainly used to resolve lexical scope each variable reference uses.
 */
class LexicalScopeProvider {
  private scopes: Array<LexicalScope> = [];
  public constructor() {
    this.enterScope(); // Global scope
  }
  private getCurrentScope() {
    return this.scopes[this.scopes.length - 1];
  }
  public enterScope() {
    this.scopes.push(new LexicalScope());
  }
  public exitScope() {
    this.scopes.pop();
  }
  public currentScopeHasVariable(variableName: string) {
    return this.getCurrentScope().hasVariable(variableName);
  }
  public addVariableToCurrentScope(variableName: string) {
    this.getCurrentScope().addVariable(variableName);
  }
  public hasVariableReference(variableName: string): boolean {
    return this.scopes.some(scope => scope.hasVariable(variableName));
  }
  public addRegisterToCurrentScope(registerName: RegisterName) {
    this.getCurrentScope().addRegister(registerName);
  }
  public hasRegister(registerName: RegisterName) {
    return this.scopes.some(scope => scope.hasRegister(registerName));
  }
}

class LogicParser {
  private tokenStream: TokenStream;
  private lexicalScopeProvider = new LexicalScopeProvider();
  private initStatements: Array<Statement> = [];
  private postChecks: Array<() => void | never> = [];
  private sections: Array<Section> = [];
  private rootDeclarations: Set<string> = new Set();
  public constructor(
    source: string,
    private readonly logger: SimpleLogger,
    private readonly sourceMap: boolean,
  ) {
    this.tokenStream = new TokenStream(source);
  }

  private attachLocationInfo<T extends OptionalLocationInfo>(token: OptionalLocationInfo | undefined, target: T) {
    if (this.sourceMap) {
      if (token === undefined) {
        return this.tokenStream.throwUnexpectedNext();
      }
      target.line = token.line;
      target.column = token.column;
    }
    return target;
  }

  private parseChoice() {
    const choiceToken = this.tokenStream.assertAndSkipNext('keyword', 'choice');
    const text = this.parseExpression();
    const action = this.parseExpression();
    return this.attachLocationInfo<ChoiceExpression>(choiceToken, {
      type: 'choiceExpression',
      text,
      action,
    });
  }

  private parseSectionName: () => string = () => {
    const targetToken = this.tokenStream.assertAndSkipNext('identifier');
    this.postChecks.push(() => {
      if (!this.sections.some(section => section.name === targetToken.content)) {
        throw WTCDError.atLocation(targetToken, `Unknown section "${targetToken.content}"`);
      }
    });
    return targetToken.content;
  }

  private parseGotoAction(): GotoAction {
    const gotoToken = this.tokenStream.assertAndSkipNext('keyword', 'goto');
    return this.attachLocationInfo<GotoAction>(gotoToken, {
      type: 'gotoAction',
      sections: this.parseListOrSingleElement(
        this.parseSectionName,

        // Allow zero elements because we allow actions like goto []
        false,
      ),
    });
  }

  /**
   * Try to parse an atom node, which includes:
   * - number literals
   * - string literals
   * - boolean literals
   * - nulls
   * - selection
   * - choices
   * - goto actions
   * - exit actions
   * - groups
   * - variables
   * - block expressions
   * - unary expressions
   *
   * @param softFail If true, when parsing failed, null is returned instead of
   * throwing error.
   */
  private parseAtom(): Expression;
  private parseAtom(softFail: true): Expression | null;
  private parseAtom(softFail?: true): Expression | null {
    // Number literal
    if (this.tokenStream.isNext('number')) {
      return this.attachLocationInfo<NumberLiteral>(this.tokenStream.peek(), {
        type: 'numberLiteral',
        value: Number(this.tokenStream.next().content),
      });
    }

    // String literal
    if (this.tokenStream.isNext('string')) {
      return this.attachLocationInfo<StringLiteral>(this.tokenStream.peek(), {
        type: 'stringLiteral',
        value: this.tokenStream.next().content,
      });
    }

    // Boolean literal
    if (this.tokenStream.isNext('keyword', ['true', 'false'])) {
      return this.attachLocationInfo<BooleanLiteral>(this.tokenStream.peek(), {
        type: 'booleanLiteral',
        value: this.tokenStream.next().content === 'true',
      });
    }

    // Null
    if (this.tokenStream.isNext('keyword', 'null')) {
      return this.attachLocationInfo<NullLiteral>(this.tokenStream.next(), {
        type: 'nullLiteral',
      });
    }

    // Selection
    if (this.tokenStream.isNext('keyword', 'selection')) {
      return this.attachLocationInfo<Selection>(this.tokenStream.next(), {
        type: 'selection',
        choices: this.parseListOrSingleElement(this.parseExpression),
      });
    }

    // Choice
    if (this.tokenStream.isNext('keyword', 'choice')) {
      return this.parseChoice();
    }

    // Goto actions
    if (this.tokenStream.isNext('keyword',  'goto')) {
      return this.parseGotoAction();
    }

    // Exit actions
    if (this.tokenStream.isNext('keyword', 'exit')) {
      return this.attachLocationInfo<ExitAction>(this.tokenStream.next(), {
        type: 'exitAction',
      });
    }

    // Group
    if (this.tokenStream.isNext('punctuation', '(')) {
      this.tokenStream.next();
      const result = this.parseExpression();
      this.tokenStream.assertAndSkipNext('punctuation', ')');
      return result;
    }

    // Block expression
    if (this.tokenStream.isNext('punctuation', '{')) {
      return this.parseBlockExpression();
    }

    // Variable
    if (this.tokenStream.isNext('identifier')) {
      const identifierToken = this.tokenStream.next();
      if (!this.lexicalScopeProvider.hasVariableReference(identifierToken.content)) {
        throw WTCDError.atLocation(
          identifierToken,
          `Cannot locate lexical scope for variable "${identifierToken.content}"`,
        );
      }
      return this.attachLocationInfo<VariableReference>(identifierToken, {
        type: 'variableReference',
        variableName: identifierToken.content,
      });
    }

    // Unary
    if (this.tokenStream.isNext('operator')) {
      const operatorToken = this.tokenStream.next();
      if (!unaryOperators.has(operatorToken.content)) {
        throw WTCDError.atLocation(
          operatorToken,
          `Invalid unary operator: ${operatorToken.content}`,
        );
      }
      return this.attachLocationInfo<UnaryExpression>(operatorToken, {
        type: 'unaryExpression',
        operator: operatorToken.content as UnaryOperator,
        arg: this.parseExpression(
          this.parseAtom(),
          unaryOperators.get(operatorToken.content)!.precedence,
        ),
      });
    }
    if (softFail === true) {
      return null;
    } else {
      return this.tokenStream.throwUnexpectedNext('atom');
    }
  }

  private parseBlockExpression() {
    const firstBraceToken = this.tokenStream.assertAndSkipNext('punctuation', '{');
    this.lexicalScopeProvider.enterScope();
    this.lexicalScopeProvider.addRegisterToCurrentScope('yield');
    const expressions: Array<Statement> = [];
    while (!this.tokenStream.isNext('punctuation', '}')) {
      expressions.push(this.parseStatement());
    }
    this.lexicalScopeProvider.exitScope();
    this.tokenStream.assertAndSkipNext('punctuation', '}');
    return this.attachLocationInfo<BlockExpression>(firstBraceToken, {
      type: 'block',
      statements: expressions,
    });
  }

  private assertHasRegister(registerName: RegisterName, token: Token) {
    if (!this.lexicalScopeProvider.hasRegister(registerName)) {
      throw WTCDError.atLocation(
        token,
        `Cannot locate lexical scope for ${registerName} register`,
      );
    }
  }

  private parseYieldOrSetYieldExpression(): YieldStatement | SetYieldStatement {
    const yieldToken = this.tokenStream.assertAndSkipNext('keyword', 'yield');
    this.assertHasRegister('yield', yieldToken);
    if (this.tokenStream.isNext('operator', '=')) {
      // Set yield
      this.tokenStream.next();
      return this.attachLocationInfo<SetYieldStatement>(yieldToken, {
        type: 'setYield',
        value: this.parseExpression(),
      });
    } else {
      // Yield
      return this.attachLocationInfo<YieldStatement>(yieldToken, {
        type: 'yield',
        value: this.parseExpressionImpliedNull(yieldToken),
      });
    }
  }

  private parseReturnOrSetReturnStatement(): ReturnStatement | SetReturnStatement {
    const returnToken = this.tokenStream.assertAndSkipNext('keyword', 'return');
    this.assertHasRegister('return', returnToken);
    if (this.tokenStream.isNext('operator', '=')) {
      // Set return
      this.tokenStream.next();
      return this.attachLocationInfo<SetReturnStatement>(returnToken, {
        type: 'setReturn',
        value: this.parseExpression(),
      });
    } else {
      // Return
      return this.attachLocationInfo<ReturnStatement>(returnToken, {
        type: 'return',
        value: this.parseExpressionImpliedNull(returnToken),
      });
    }
  }

  private parseExpressionImpliedNull(location: OptionalLocationInfo) {
    const atom = this.parseAtom(true);
    if (atom === null) {
      return this.attachLocationInfo<NullLiteral>(location, { type: 'nullLiteral' });
    }
    return this.parseExpression(atom, 0);
  }

  /**
   * - If next token is not an operator, return left as is.
   * - If next operator's precedence is smaller than or equal to the precedence
   *   threshold, return left as is. (Because in this case, we want to left
   *   someone on the left wrap us.)
   * - Otherwise, for binary operators call #maybeInfixExpression with next
   *   element as left and new operator's precedence as the threshold. (This is
   *   to bind everything that binds tighter (higher precedence) than this
   *   operator together.) Using this and current precedence threshold, call
   *   #maybeInfixExpression again. (This is to bind everything that reaches the
   *   threshold together.)
   * - For conditional operator (?), parse a expression (between "?" and ":"),
   *   then read in ":". Last, do the same thing as with the binary case.
   * @param left expression on the left of next operator
   * @param precedenceThreshold minimum (exclusive) precedence required in order
   * to bind with left
   */
  private parseExpression: (
    left?: Expression,
    precedenceThreshold?: number,
  ) => Expression = (
    left = this.parseAtom(),
    precedenceThreshold = 0,
  ) => {
    if (!this.tokenStream.isNext('operator')) {
      return left;
    }
    const operatorToken = this.tokenStream.peek()!;
    const isConditional = operatorToken.content === '?';
    if (!isConditional && !binaryOperators.has(operatorToken.content)) {
      return left;
    }
    const nextPrecedence = isConditional
      ? conditionalOperatorPrecedence
      : binaryOperators.get(operatorToken.content)!.precedence;
    if (nextPrecedence <= precedenceThreshold) {
      return left;
    }
    this.tokenStream.next(); // Read in operator
    if (isConditional) {
      const then = this.parseExpression();
      this.tokenStream.assertAndSkipNext('operator', ':');
      const otherwise = this.parseExpression(this.parseAtom(), nextPrecedence);
      const conditional = this.attachLocationInfo<ConditionalExpression>(operatorToken, {
        type: 'conditionalExpression',
        condition: left,
        then,
        otherwise,
      });
      return this.parseExpression(conditional, precedenceThreshold);
    } else {
      const right = this.parseExpression(this.parseAtom(), nextPrecedence);
      const binary = this.attachLocationInfo<BinaryExpression>(operatorToken, {
        type: 'binaryExpression',
        operator: operatorToken.content as BinaryOperator,
        arg0: left,
        arg1: right,
      });
      return this.parseExpression(binary, precedenceThreshold);
    }
  }

  /**
   * Parse a single expression, which includes:
   * - unary expressions
   * - declare expressions
   * - infix expressions (binary and conditional)
   */
  private parseStatement: () => Statement = () => {
    if (this.tokenStream.isNext('keyword', 'declare')) {
      return this.parseDeclaration();
    } else if (this.tokenStream.isNext('keyword', 'return')) {
      return this.parseReturnOrSetReturnStatement();
    } else if (this.tokenStream.isNext('keyword', 'yield')) {
      return this.parseYieldOrSetYieldExpression();
    } else {
      return this.attachLocationInfo<ExpressionStatement>(this.tokenStream.peek(), {
        type: 'expression',
        expression: this.parseExpression(),
      });
    }
  }

  private parseOneDeclaration: () => OneVariableDeclaration = () => {
    const typeToken = this.tokenStream.assertAndSkipNext('identifier', [
      'number',
      'boolean',
      'string',
      'action',
      'choice',
      'selection',
    ]);
    const variableNameToken = this.tokenStream.assertAndSkipNext('identifier');
    let initialValue: Expression | null = null;
    if (this.tokenStream.isNext('operator', '=')) {
      this.tokenStream.next();
      initialValue = this.parseExpression();
      if (this.lexicalScopeProvider.currentScopeHasVariable(variableNameToken.content)) {
        throw WTCDError.atLocation(
          typeToken,
          `Variable "${variableNameToken.content}" has already been declared within the same lexical scope`,
        );
      }
    }
    this.lexicalScopeProvider.addVariableToCurrentScope(variableNameToken.content);
    return this.attachLocationInfo<OneVariableDeclaration>(typeToken, {
      variableName: variableNameToken.content,
      variableType: typeToken.content as VariableType,
      initialValue,
    });
  }

  private parseListOrSingleElement<T>(parseOneFn: () => T, atLestOne: boolean = true): Array<T> {
    if (this.tokenStream.isNext('punctuation', '[')) {
      const results: Array<T> = [];
      this.tokenStream.next(); // [
      while (!this.tokenStream.isNext('punctuation', ']')) {
        results.push(parseOneFn());
      }
      if (atLestOne && results.length === 0) {
        return this.tokenStream.throwUnexpectedNext('at least one element');
      }
      this.tokenStream.next(); // ]
      return results;
    } else {
      return [parseOneFn()];
    }
  }

  private parseDeclaration() {
    const declareToken = this.tokenStream.assertAndSkipNext('keyword', 'declare');
    const declarations = this.parseListOrSingleElement(this.parseOneDeclaration);
    return this.attachLocationInfo<DeclarationStatement>(declareToken, {
      type: 'declaration',
      declarations,
    });
  }

  private parseSection() {
    const sectionToken = this.tokenStream.assertAndSkipNext('keyword', 'section');
    const nameToken = this.tokenStream.assertAndSkipNext('identifier');
    if (this.sections.some(section => section.name === nameToken.content)) {
      throw WTCDError.atLocation(nameToken, `Cannot redefine section "${nameToken.content}"`);
    }
    let executes: Expression | null = null;
    if (!this.tokenStream.isNext('keyword', 'then')) {
      executes = this.parseExpression();
    }
    this.tokenStream.assertAndSkipNext('keyword', 'then');
    const then = this.parseExpression();
    return this.attachLocationInfo<Section>(sectionToken, {
      name: nameToken.content,
      executes,
      then,
      content: [],
    });
  }

  private parseRootBlock() {
    this.tokenStream.assertNext('keyword', ['declare', 'section']);
    if (this.tokenStream.isNext('keyword', 'declare')) {
      const declarationStatement = this.parseDeclaration();
      for (const declaration of declarationStatement.declarations) {
        this.rootDeclarations.add(declaration.variableName);
      }
      this.initStatements.push(declarationStatement);
    } else if (this.tokenStream.isNext('keyword', 'section')) {
      this.sections.push(this.parseSection());
    }
  }

  public hasRootDeclaration(variableName: string) {
    return this.rootDeclarations.has(variableName);
  }

  /**
   * Read the WTCD version declaration and verify version
   * Give warning when needed.
   */
  private parseVersion() {
    this.tokenStream.assertAndSkipNext('identifier', 'WTCD');
    const versionToken = this.tokenStream.assertAndSkipNext('number');
    const versionContent = versionToken.content;
    const split = versionContent.split('.');
    if (split.length !== 2) {
      throw WTCDError.atLocation(versionToken, `Invalid WTCD version ${versionContent}`);
    }
    const majorVersion = Number(split[0]);
    const minorVersion = Number(split[1]);
    if (
      (majorVersion > CURRENT_MAJOR_VERSION) ||
      (majorVersion === CURRENT_MAJOR_VERSION && minorVersion > CURRENT_MINOR_VERSION)
    ) {
      // If version stated is larger
      this.logger.warn(`Document's WTCD version (${versionContent}) is newer than parser ` +
        `version (${CURRENT_VERSION_STR}). New features might break parser.`);
    } else if (majorVersion < CURRENT_MAJOR_VERSION) {
      this.logger.warn(`Document's WTCD version (${versionContent}) is a least one major ` +
        `version before parser's (${CURRENT_VERSION_STR}). Breaking changes introduced might break ` +
        `parser.`);
    }
  }

  public parse() {
    const logger = this.logger;
    logger.info('Parsing logic section...');
    this.parseVersion();
    while (!this.tokenStream.eof()) {
      this.parseRootBlock();
    }
    logger.info('Run post checks...');
    this.postChecks.forEach(postCheck => postCheck());
    return {
      initStatements: this.initStatements,
      sections: this.sections,
    };
  }
}

function identity<T>(input: T) {
  return input;
}

/**
 * Parse the given WTCD document.
 * @param source The content of WTCD
 * @param mdi An instance of markdown-it
 * @param logger A logging function
 */
export function parse({ source, mdi, logger = console, markdownPreProcessor = identity, htmlPostProcessor = identity }: {
  source: string;
  mdi: MDI;
  logger?: SimpleLogger;
  markdownPreProcessor?: (markdown: string) => string;
  htmlPostProcessor?: (html: string) => string;
}): WTCDParseResult {
  try {
    // Parse sections and extract the logic part of this WTCD document

    /** Regex used to extract section headers. */
    const sectionRegex = /^---<<<\s+([a-zA-Z_][a-zA-Z_0-9]*)(?:@([0-9\-]+))?\s+>>>---$/gm;
    /** Markdown source of each section */
    const sectionMarkdowns: Array<string> = [];
    /** Name of each section, excluding bounds */
    const sectionNames: Array<string> = [];
    /** Bounds of each section, not parsed. Undefined means unbounded. */
    const sectionBounds: Array<string | undefined> = [];
    /** End index of last section */
    let lastIndex = 0;
    /** Rolling regex result object */
    let result: RegExpExecArray | null;
    while ((result = sectionRegex.exec(source)) !== null) {
      sectionMarkdowns.push(source.substring(lastIndex, result.index));
      sectionNames.push(result[1]);
      sectionBounds.push(result[2]);
      lastIndex = sectionRegex.lastIndex;
    }

    // Push the remaining content to last section's markdown
    sectionMarkdowns.push(source.substring(lastIndex));

    const logicParser = new LogicParser(
      sectionMarkdowns.shift()!,
      logger,
      false,
    );

    const wtcdRoot: WTCDRoot = logicParser.parse();

    const sig = new SimpleIdGenerator();

    sectionContentLoop:
    for (let i = 0; i < sectionMarkdowns.length; i++) {
      /** Markdown content of the section */
      const sectionMarkdown = markdownPreProcessor(sectionMarkdowns[i]);
      /** Name (without bound) of the section */
      const sectionName = sectionNames[i];
      /** Unparsed bounds of the section */
      const sectionBound = sectionBounds[i];
      const sectionFullName = (sectionBound === undefined)
        ? sectionName
        : `${sectionName}@${sectionBound}`;
      logger.info(`Parsing markdown for section ${sectionFullName}.`);
      const variables: Array<{ elementClass: string, variableName: string }> = [];

      const sectionHTML = mdi.render(sectionMarkdown);

      /**
       * HTML content of the section whose interpolated values are converted to
       * spans with unique classes.
       */
      const sectionParameterizedHTML = sectionHTML.replace(/&lt;\$\s+([a-zA-Z_][a-zA-Z_0-9]*)\s+\$&gt;/g, (_, variableName) => {
        if (!logicParser.hasRootDeclaration(variableName)) {
          throw WTCDError.atUnknown(`Cannot resolve variable reference "${variableName}" in section "${sectionFullName}"`);
        }
        const elementClass = 'wtcd-variable-' + sig.next();
        variables.push({
          elementClass,
          variableName,
        });
        return `<span class="${elementClass}"></span>`;
      });

      // Parse bounds
      let lowerBound: number | undefined;
      let upperBound: number | undefined;
      if (sectionBound !== undefined) {
        if (sectionBound.includes('-')) {
          const split = sectionBound.split('-');
          lowerBound = split[0] === '' ? undefined : Number(split[0]);
          upperBound = split[1] === '' ? undefined : Number(split[1]);
        } else {
          lowerBound = upperBound = Number(sectionBound);
        }
      }
      const singleSectionContent: SingleSectionContent = {
        html: htmlPostProcessor(sectionParameterizedHTML),
        variables,
        lowerBound,
        upperBound,
      };
      for (const section of wtcdRoot.sections) {
        if (section.name === sectionName) {
          section.content.push(singleSectionContent);
          continue sectionContentLoop;
        }
      }
      // Currently, location data for content sections are not available
      throw WTCDError.atUnknown(`Cannot find a logic declaration for ` +
        `section content ${sectionFullName}`);
    }

    return {
      error: false,
      wtcdRoot,
    };
  } catch (error) {
    return {
      error: true,
      message: error.message,
      internalStack: error.stack,
    };
  }
}
