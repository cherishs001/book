export type Selection = [number, number, number, number];
interface State {
  currentChapter: string | null;
  chapterSelection: Selection | null;
  chapterTextNodes: Array<Text> | null;
}
export const state: State = {
  currentChapter: null,
  chapterSelection: null,
  chapterTextNodes: null,
};
