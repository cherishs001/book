interface Data {
  chapters: Array<string>;
  earlyAccessChapters: Array<string>;
  charsCount: number;
  paragraphsCount: number;
  buildNumber: string;
}
export const data = (window as any).DATA as Data;