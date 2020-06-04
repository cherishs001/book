import { resolve } from 'path';
export const rootDir = resolve(__dirname, '../..');
export const staticDir = resolve(rootDir, 'static');
export const chaptersDir = resolve(rootDir, 'chapters');
export const distDir = resolve(rootDir, 'dist');
export const distChaptersDir = resolve(distDir, 'chapters');
