import { contactInfo } from '../data/settings';
import { h } from '../hs';
import { Content } from './contentControl';

export function loadContactInfo(content: Content) {
  if (!contactInfo.getValue()) {
    return;
  }
  const block = content.addBlock({
    initElement: h('div',
      h('h3', '欢迎加入《可穿戴科技》相关讨论组'),
      h('ul',
        h('li',
          'Telegram 群：',
          h('a.regular', {
            href: 'https://t.me/joinchat/Dt8_WlJnmEwYNbjzlnLyNA',
            target: '_blank',
          }, 'https://t.me/joinchat/Dt8_WlJnmEwYNbjzlnLyNA'),
        ),
        h('li.regular',
          'Telegram 频道：',
          h('a.regular', {
            href: 'https://t.me/joinchat/AAAAAEpkRVwZ-3s5V3YHjA',
            target: '_blank',
          }, 'https://t.me/joinchat/AAAAAEpkRVwZ-3s5V3YHjA'),
        ),
        h('li', 'QQ 群（禁止色情/政治）：462213854'),
      ),
      h('a.regular', {
        href: '#',
        onclick: ((event: any) => {
          event.preventDefault();
          block.directRemove();
          contactInfo.setValue(false);
        }),
      }, '点此永久关闭本提示'),
    ),
  });
}
