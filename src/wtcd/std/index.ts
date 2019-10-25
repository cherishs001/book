import { contentStdFunctions } from './content';
import { debugStdFunctions } from './debug';
import { listStdFunctions } from './list';
import { mathStdFunctions } from './math';
import { randomStdFunctions } from './random';
import { stringStdFunctions } from './string';

export const stdFunctions = [
  ...contentStdFunctions,
  ...debugStdFunctions,
  ...listStdFunctions,
  ...mathStdFunctions,
  ...randomStdFunctions,
  ...stringStdFunctions,
];
