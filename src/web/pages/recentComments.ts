import { loadRecentComments } from '../control/commentsControl';
import { Page } from './pages';

export const recentComments: Page = {
  name: 'recent-comments',
  handler: content => {
    loadRecentComments(content);
    return true;
  },
};
