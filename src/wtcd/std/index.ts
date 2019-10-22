import { debugStdFunctions } from './debug';
import { listStdFunctions } from './list';
import { numberStdFunctions } from './number';
import { randomStdFunctions } from './random';

export const stdFunctions = [
  ...debugStdFunctions,
  ...listStdFunctions,
  ...randomStdFunctions,
  ...numberStdFunctions,
];
