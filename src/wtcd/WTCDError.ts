import { Token } from './TokenStream';

export class WTCDError extends Error {
  public constructor(
    message: string,
    public readonly line: number,
    public readonly column: number,
  ) {
    super(`${message} at ${line}:${column}.`);
    this.name = 'WTCDError';
  }
  public static atToken(message: string, token: Token) {
    return new WTCDError(message, token.line, token.column);
  }
}
