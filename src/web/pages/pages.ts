import { Content } from '../control/contentControl';
import { recentComments } from './recentComments';
import { visitCount } from './visitCount';

export interface Page {
  name: string;
  handler: (content: Content, path: string) => boolean;
}

export const pages: Array<Page> = [
  recentComments,
  visitCount,
];
