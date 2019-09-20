import { Token } from './TokenStream';
import { OptionalLocationInfo } from './types';

export class WTCDError extends Error {
  public constructor(message: string, line: number, column: number)
  public constructor(message: string, locationInfo: null)
  public constructor(
    message: string,
    public readonly line: number | null,
    public readonly column?: number,
  ) {
    super(
      (line === null)
        ? `${message} at unknown location (Try recompile in debug mode to enable source map)`
        : `${message} at ${line}:${column}.`,
    );
    this.name = 'WTCDError';
  }
  public static atToken(message: string, token: Token) {
    return new WTCDError(message, token.line, token.column);
  }
  public static atNode(message: string, node: OptionalLocationInfo) {
    if (node.line === undefined) {
      return new WTCDError(message, null);
    } else {
      return new WTCDError(message, node.line, node.column!);
    }
  }
}
