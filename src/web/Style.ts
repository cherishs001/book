export enum Style {
  BRIGHT,
  DARK,
}
export const styleClassNames: Map<Style, string> = new Map();
styleClassNames.set(Style.BRIGHT, 'style-bright');
styleClassNames.set(Style.DARK, 'style-dark');
