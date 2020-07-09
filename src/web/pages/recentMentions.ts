import { COMMENTS_MENTION_NO_TOKEN_DESC, COMMENTS_MENTION_NO_TOKEN_TITLE } from '../constant/messages';
import { loadRecentMentions } from '../control/commentsControl';
import { h } from '../hs';
import { removeNewMentionLink } from '../index';
import { Page } from './pages';

export const recentMentions: Page = {
  name: 'recent-mentions',
  handler: content => {
    // ! In the name of spaghetti
    setTimeout(() => {
      removeNewMentionLink();
    }, 500);
    localStorage.setItem('lastCheckedMention', String(Date.now()));
    if (localStorage.getItem('token') === null) {
      content.addBlock({
        initElement: h('div',
          h('h1', COMMENTS_MENTION_NO_TOKEN_TITLE),
          h('p', COMMENTS_MENTION_NO_TOKEN_DESC),
        )
      });
    } else {
      loadRecentMentions(content, localStorage.getItem('token')!);
    }
    return true;
  },
};
