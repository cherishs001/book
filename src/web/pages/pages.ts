import { Content } from '../control/contentControl';
import { recentComments } from './recentComments';

export interface Page {
  name: string;
  handler: (content: Content, path: string) => boolean;
}

export const pages: Array<Page> = [
  recentComments,
];
