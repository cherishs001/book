import { getMaybePooled } from '../constantsPool';
import { NativeFunction } from '../types';
import { assertArgsLength, assertArgType, NativeFunctionError } from './utils';

export const contentStdFunctions: Array<NativeFunction> = [
  function contentAddParagraph(args, interpreterHandle) {
    assertArgsLength(args, 1);
    const $paragraph = document.createElement('p');
    $paragraph.innerText = assertArgType(args, 0, 'string');
    interpreterHandle.pushContent($paragraph);
    return getMaybePooled('null', null);
  },
  function contentAddImage(args, interpreterHandle) {
    assertArgsLength(args, 1);
    const $image = document.createElement('img');
    $image.src = assertArgType(args, 0, 'string');
    interpreterHandle.pushContent($image);
    return getMaybePooled('null', null);
  },
  function contentAddUnorderedList(args, interpreterHandle) {
    const $container = document.createElement('ul');
    for (let i = 0; i < args.length; i++) {
      const content = assertArgType(args, i, 'string');
      const $li = document.createElement('li');
      $li.innerText = content;
      $container.appendChild($li);
    }
    interpreterHandle.pushContent($container);
    return getMaybePooled('null', null);
  },
  function contentAddOrderedList(args, interpreterHandle) {
    const $container = document.createElement('ol');
    for (let i = 0; i < args.length; i++) {
      const content = assertArgType(args, i, 'string');
      const $li = document.createElement('li');
      $li.innerText = content;
      $container.appendChild($li);
    }
    interpreterHandle.pushContent($container);
    return getMaybePooled('null', null);
  },
  function contentAddHeader(args, interpreterHandle) {
    assertArgsLength(args, 1, 2);
    const level = assertArgType(args, 1, 'number', 1);
    if (![1, 2, 3, 4, 5, 6].includes(level)) {
      throw new NativeFunctionError(`There is no header with level ${level}`);
    }
    const $header = document.createElement('h' + level);
    $header.innerText = assertArgType(args, 0, 'string');
    interpreterHandle.pushContent($header);
    return getMaybePooled('null', null);
  },
];
