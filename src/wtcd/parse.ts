import * as MDI from 'markdown-it';
import { binaryOperators, conditionalOperatorPrecedence, unaryOperators } from './operators';
import { SimpleIdGenerator } from './SimpleIdGenerator';
import { Token, TokenStream } from './TokenStream';
import { BinaryExpression, BinaryOperator, BooleanLiteral, ConditionalExpression, Expression, ExpressionSet, NumberLiteral, OneVariableDeclaration, OptionalLocationInfo, SingleSectionContent, StringLiteral, UnaryExpression, UnaryOperator, VariableReference, VariableType } from './types';
import { WTCDError } from './WTCDError';

const CURRENT_MAJOR_VERSION = 1;
const CURRENT_MINOR_VERSION = 0;

const CURRENT_VERSION_STR = CURRENT_MAJOR_VERSION + '.' + CURRENT_MINOR_VERSION;

export interface SimpleLogger {
  info(...stuff: any): void;
  error(...stuff: any): void;
  warn(...stuff: any): void;
}

class LexicalScope {
  private declaredVariables: Set<string> = new Set();
  public hasVariable(variableName: string) {
    return this.declaredVariables.has(variableName);
  }
  public addVariable(variableName: string) {
    this.declaredVariables.add(variableName);
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
  public findVariable(variableName: string): boolean {
    return this.scopes.some(scope => scope.hasVariable(variableName));
  }
}

class LogicParser {
  private tokenStream: TokenStream;
  private lexicalScopeProvider = new LexicalScopeProvider();
  private globalVariables: Array<OneVariableDeclaration> = [];
  public constructor(
    source: string,
    private readonly logger: SimpleLogger,
    private readonly sourceMap: boolean,
  ) {
    this.tokenStream = new TokenStream(source);
  }

  private attachLocationInfo<T extends OptionalLocationInfo>(token: Token | undefined, target: T) {
    if (this.sourceMap) {
      if (token === undefined) {
        return this.tokenStream.throwUnexpectedNext();
      }
      target.line = token.line;
      target.column = token.column;
    }
    return target;
  }

  /**
   * Try to parse an atom node, which includes:
   * - number literals
   * - string literals
   * - boolean literals
   * - groups
   * - variables
   * - expression sets
   */
  private parseAtom(): Expression {
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

    // Group
    if (this.tokenStream.isNext('punctuation', '(')) {
      this.tokenStream.next();
      const result = this.parseExpression();
      this.tokenStream.assertAndSkipNext('punctuation', ')');
      return result;
    }

    // Expression set
    if (this.tokenStream.isNext('punctuation', '{')) {
      return this.parseExpressionSet();
    }

    // Variable
    if (this.tokenStream.isNext('identifier')) {
      const identifierToken = this.tokenStream.next();
      const scopeId = this.lexicalScopeProvider.findVariable(identifierToken.content);
      if (scopeId === null) {
        throw WTCDError.atToken(
          `Cannot locate lexical scope for variable "${identifierToken.content}"`,
          identifierToken,
        );
      }
      return this.attachLocationInfo<VariableReference>(identifierToken, {
        type: 'variableReference',
        variableName: identifierToken.content,
      });
    }
    return this.tokenStream.throwUnexpectedNext('atom');
  }

  private parseExpressionSet() {
    const firstBraceToken = this.tokenStream.assertAndSkipNext('punctuation', '{');
    this.lexicalScopeProvider.enterScope();
    const expressions: Array<Expression> = [];
    while (!this.tokenStream.isNext('punctuation', '}')) {
      expressions.push(this.parseExpression());
    }
    this.lexicalScopeProvider.exitScope();
    this.tokenStream.assertAndSkipNext('punctuation', '}');
    return this.attachLocationInfo<ExpressionSet>(firstBraceToken, {
      type: 'expressionSet',
      expressions,
    });
  }

  /**
   * - If next token is not an operator, return left as is.
   * - If next token is ":", return left as is.
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
  private parseMaybeInfixExpression(left: Expression, precedenceThreshold: number): Expression {
    if (!this.tokenStream.isNext('operator')) {
      return left;
    }
    const operatorToken = this.tokenStream.peek()!;
    if (operatorToken.content === ':') {
      return left;
    }
    const isConditional = operatorToken.content === '?';
    if (!isConditional && !binaryOperators.has(operatorToken.content)) {
      throw WTCDError.atToken(
        `Invalid operator: ${operatorToken.content}`,
        operatorToken,
      );
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
      const otherwise = this.parseMaybeInfixExpression(this.parseAtom(), nextPrecedence);
      const conditional = this.attachLocationInfo<ConditionalExpression>(operatorToken, {
        type: 'conditionalExpression',
        condition: left,
        then,
        otherwise,
      });
      return this.parseMaybeInfixExpression(conditional, precedenceThreshold);
    } else {
      const right = this.parseMaybeInfixExpression(this.parseAtom(), nextPrecedence);
      const binary = this.attachLocationInfo<BinaryExpression>(operatorToken, {
        type: 'binaryExpression',
        operator: operatorToken.content as BinaryOperator,
        arg0: left,
        arg1: right,
      });
      return this.parseMaybeInfixExpression(binary, precedenceThreshold);
    }
  }

  private parseExpression: () => Expression = () => {
    if (this.tokenStream.isNext('operator')) { // Unary
      const operatorToken = this.tokenStream.next();
      if (!unaryOperators.has(operatorToken.content)) {
        throw WTCDError.atToken(
          `Invalid unary operator: ${operatorToken.content}`,
          operatorToken,
        );
      }
      return this.attachLocationInfo<UnaryExpression>(operatorToken, {
        type: 'unaryExpression',
        operator: operatorToken.content as UnaryOperator,
        // This is a conscious decision that unary operators only accept atoms
        // as their arguments. This is done in order to eliminate ambiguity
        // between [ 3 -5 ] and [ 3 - 5 ] since our lists do not have
        // delimiters. In WTCD, [ 3 -5 ] or [ 3 - 5 ] is always interpreted as
        // an array with one element 2, which is the result of (3 - 5). In order
        // to express 3 and -5 in a list, one needs to write [ 3 (-5) ].
        arg: this.parseAtom(), // This is a conscious
      });
    } else {
      return this.parseMaybeInfixExpression(
        this.parseAtom(),
        0, // Anything that binds is ok.
      );
    }
  }

  private parseOneDeclaration: () => OneVariableDeclaration = () => {
    const typeToken = this.tokenStream.assertAndSkipNext('identifier', ['number', 'boolean']);
    const variableNameToken = this.tokenStream.assertAndSkipNext('identifier');
    this.tokenStream.assertAndSkipNext('operator', '=');
    const initialValue = this.parseExpression();
    if (this.lexicalScopeProvider.currentScopeHasVariable(variableNameToken.content)) {
      throw WTCDError.atToken(
        `Variable "${variableNameToken.content}" has already been declared within the same lexical scope.`,
        typeToken,
      );
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
    this.tokenStream.assertAndSkipNext('keyword', 'declare');
    this.globalVariables.push(...this.parseListOrSingleElement(this.parseOneDeclaration));
  }

  private parseRootBlock() {
    this.tokenStream.assertNext('keyword', ['declare', 'section']);
    if (this.tokenStream.isNext('keyword', 'declare')) {
      this.parseDeclaration();
    } else if (this.tokenStream.isNext('keyword', 'section')) {
      throw new Error();
    }
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
      throw WTCDError.atToken(`Invalid WTCD version ${versionContent}`, versionToken);
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
    logger.info('Start parsing logic section.');
    this.parseVersion();
    this.parseRootBlock();
    logger.info(JSON.stringify(this.globalVariables, null, 4));
  }
}

/**
 * Parse the given WTCD document.
 * @param source The content of WTCD
 * @param mdi An instance of markdown-it; Require the html flag to be on
 * @param logger A logging function
 */
export function parse(source: string, mdi: MDI, logger: SimpleLogger) {
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
    true,
  ).parse();

  /** Parsed section contents */
  const sectionContents: Array<SingleSectionContent> = [];
  for (let i = 0; i < sectionMarkdowns.length; i++) {
    /** Markdown content of the section */
    const sectionMarkdown = sectionMarkdowns[i];
    /** Name (without bound) of the section */
    const sectionName = sectionNames[i];
    /** Unparsed bounds of the section */
    const sectionBound = sectionBounds[i];
    const sectionFullName = (sectionBound === undefined)
      ? sectionName
      : `${sectionName}@${sectionBound}`;
    logger.info(`Parsing markdown for section ${sectionFullName}.`);
    const variables: Array<{ elementClass: string, variableName: string }> = [];
    const sig = new SimpleIdGenerator();
    /**
     * Markdown content of the section whose interpolated values are converted
     * to spans with unique ids.
     */
    const sectionParameterizedMarkdown = sectionMarkdown.replace(/<\$([a-zA-Z_][a-zA-Z_0-9]*)\$>/g, (full, variableName) => {
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
        lowerBound = Number(split[0]);
        upperBound = Number(split[1]);
      } else {
        lowerBound = upperBound = Number(sectionBound);
      }
    }
    sectionContents.push({
      html: mdi.render(sectionParameterizedMarkdown),
      variables,
      lowerBound,
      upperBound,
    });
    console.info(sectionContents[sectionContents.length - 1]);
  }
}
