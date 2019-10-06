import { SimpleLogger } from '../wtcd/parse';

export class PrefixedConsole implements SimpleLogger {
  public constructor(
    private prefix: string,
    private console: Console = console,
  ) {}
  public info(...stuff: any): void {
    this.console.info(this.prefix, ...stuff);
  }
  public error(...stuff: any): void {
    this.console.error(this.prefix, ...stuff);
  }
  public warn(...stuff: any): void {
    this.console.warn(this.prefix, ...stuff);
  }
}
