import { OptionalLocationInfo } from './types';

export class WTCDError<TLocationInfo extends boolean> extends Error {
  private constructor(
    message: string,
    public readonly line: TLocationInfo extends true ? number : null,
    public readonly column: TLocationInfo extends true ? number : null,
  ) {
    super(message);
    this.name = 'WTCDError';
  }
  public static atUnknown(message: string) {
    return new WTCDError<false>(message + ` at unknown location. (Location info `
      + `is not available for this type of error)`, null, null);
  }
  public static atLineColumn(line: number, column: number, message: string) {
    return new WTCDError<true>(message + ` at ${line}:${column}`, line, column);
  }
  public static atLocation(location: OptionalLocationInfo, message: string) {
    if (location.line === undefined) {
      return new WTCDError(message + ' at unknown location. (Try recompile in '
        + 'debug mode to enable source map)', null, null);
    } else {
      return this.atLineColumn(location.line, location.column!, message);
    }
  }
}
