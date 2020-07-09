import { BUILD_FAILED_DESC, BUILD_FAILED_OK, BUILD_FAILED_TITLE } from './constant/messages';
import { followQuery } from './control/followQuery';
import { notify } from './control/modalControl';
import { updateSelection } from './control/updateSelection';
import { data } from './data/data';
import { animation } from './data/settings';
import { DebugLogger } from './DebugLogger';
import { ItemDecoration, ItemHandle, ItemLocation } from './Menu';
import { MainMenu } from './menu/MainMenu';
import { id } from './util/DOM';

import './control/analyticsControl';

const $warning = id('warning');

if ($warning !== null) {
  $warning.addEventListener('click', () => {
    $warning.style.opacity = '0';
    if (animation.getValue()) {
      $warning.addEventListener('transitionend', () => {
        $warning.remove();
      });
    } else {
      $warning.remove();
    }
  });
}

const $buildNumber = id('build-number');
$buildNumber.innerText = `Build ${data.buildNumber}`;

const mainMenu = new MainMenu();
mainMenu.setActive(true);
let newMentionLink: null | ItemHandle = null;
export function removeNewMentionLink() {
  if (newMentionLink === null) {
    return;
  }
  newMentionLink.remove();
  newMentionLink = null;
}
const lastMentionLogger = new DebugLogger('Last Mention Notification');
// 以下代码用于从 Makai 拉取是否有新回复
// Makai 不带有任何数据统计或个人信息记录功能。
if (localStorage.getItem('token') !== null) {
  // Since `+null` is 0, if key does not exist, 0 is used.
  const lastCheckedMention = Math.floor((+localStorage.getItem('lastCheckedMention')!));
  fetch(`https://c.makai.city/init?token=${localStorage.getItem('token')}&since=${lastCheckedMention}`)
    .then(response => response.json())
    .then(data => {
      localStorage.setItem('username', data.username);
      lastMentionLogger.log(`Initialization result: ${data.mentions} new mentions.`);
      if (data.mentions !== 0) {
        newMentionLink = mainMenu.addItem(`您有 ${data.mentions} 条新回复`, {
          button: true,
          link: '##page/recent-mentions',
          small: true,
          decoration: ItemDecoration.ICON_NOTIFICATION,
          location: ItemLocation.BEFORE,
        });
      }
    })
    .catch(error => {
      lastMentionLogger.error('Failed to initialize.', error);
    });
} else {
  lastMentionLogger.log('Token not set, skipping initialization.');
}


if (data.buildError) {
  notify(BUILD_FAILED_TITLE, BUILD_FAILED_DESC, BUILD_FAILED_OK);
}

document.addEventListener('selectionchange', () => {
  updateSelection();
});

window.addEventListener('popstate', () => {
  followQuery();
});

followQuery();
