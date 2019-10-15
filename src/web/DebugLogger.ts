import { developerMode } from './settings';

function simpleToString(value: string | number | boolean) {
  switch (typeof value) {
    case 'string':
      return `"${value}"`;
    default:
      return String(value);
  }
}

export class DebugLogger {
  private prefix: string;
  public constructor(
    name: string,
    parameters: { [key: string]: string | number | boolean } = {},
  ) {
    this.prefix = name + '('
     + Object.keys(parameters).map(key => `${key}=${simpleToString(parameters[key])}`).join(',')
     + ')';
  }
  public log(...stuff: any) {
    if (!developerMode.getValue()) {
      return;
    }
    console.info(this.prefix, ...stuff);
  }
  public info(...stuff: any) {
    if (!developerMode.getValue()) {
      return;
    }
    console.info(this.prefix, ...stuff);
  }
  public warn(...stuff: any) {
    if (!developerMode.getValue()) {
      return;
    }
    console.warn(this.prefix, ...stuff);
  }
  public error(...stuff: any) {
    if (!developerMode.getValue()) {
      return;
    }
    console.error(this.prefix, ...stuff);
  }
}
