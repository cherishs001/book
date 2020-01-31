import { followQuery } from './control/followQuery';
import { updateSelection } from './control/updateSelection';
import { data } from './data/data';
import { animation } from './data/settings';
import { MainMenu } from './menu/MainMenu';
import { id } from './util/DOM';

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

new MainMenu().setActive(true);

document.addEventListener('selectionchange', () => {
  updateSelection();
});

window.addEventListener('popstate', () => {
  followQuery();
});

followQuery();
