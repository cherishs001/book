import { selectNode } from '../util/DOM';

export function processElements($parent: HTMLElement) {
  Array.from($parent.getElementsByTagName('a')).forEach(($anchor: HTMLAnchorElement) => {
    const hrefAttribute = $anchor.attributes.getNamedItem('href');
    if (hrefAttribute !== null && !hrefAttribute.value.startsWith('#')) {
      $anchor.target = '_blank';
    }
    $anchor.rel = 'noopener noreferrer';
    $anchor.className = 'regular';
  });
  Array.from($parent.getElementsByTagName('code')).forEach($code => $code.addEventListener('dblclick', () => {
    if (!($code.parentNode instanceof HTMLPreElement)) {
      selectNode($code);
    }
  }));
  Array.from($parent.getElementsByTagName('img')).forEach($image => {
    const src = $image.src;
    const lastDotIndex = src.lastIndexOf('.');
    const pathNoExtension = src.substr(0, lastDotIndex);
    if (pathNoExtension.endsWith('_low')) {
      const extension = src.substr(lastDotIndex + 1);
      const pathNoLowNoExtension = pathNoExtension.substr(0, pathNoExtension.length - 4);
      $image.style.cursor = 'zoom-in';
      $image.addEventListener('click', () => window.open(pathNoLowNoExtension + '.' + extension));
    }
  });
}
