import { getMaybePooled } from '../constantsPool';
import { NativeFunction } from '../types';
import { assertArgsLength, assertArgType } from './utils';

export const contentStdFunctions: Array<NativeFunction> = [
  function contentAddParagraph(args, interpreterHandle) {
    assertArgsLength(args, 1);
    const $paragraph = document.createElement('p');
    $paragraph.innerText = assertArgType(args, 0, 'string');
    interpreterHandle.pushContent($paragraph);
    return getMaybePooled('null', null);
  },
];
