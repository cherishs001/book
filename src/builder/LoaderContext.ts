import { readFile, stat } from 'fs-extra';
import * as MDI from 'markdown-it';
import * as mdiReplaceLinkPlugin from 'markdown-it-replace-link';
import * as mdiRubyPlugin from 'markdown-it-ruby';
import { dirname, posix, resolve } from 'path';
import { destructPath } from './destructPath';
import { distChaptersDir } from './dirs';
import { isAttachment, isDocument } from './fileExtensions';
import { Stats } from './Stats';

const { join } = posix;

export interface LoaderError {
  loaderName: string;
  path: string;
  error: any;
}

export class LoaderContext {
  public constructor(
    public readonly isDirectory: boolean,
    public readonly path: string,
    public readonly parentDistRelativePath: string,
    public readonly stats: Stats,
    public readonly production: boolean,
    private readonly errors: Array<LoaderError> = [],
  ) {}

  private distRelativePath: string | null = null;

  public setDistFileName(fileName: string) {
    this.distRelativePath = (this.parentDistRelativePath === '' ? fileName : (this.parentDistRelativePath + '/' + fileName))
      .split(' ')
      .join('-');
  }

  public getNode() {
    return destructPath(this.path);
  }

  public getDistRelativePath() {
    if (this.distRelativePath === null) {
      throw new Error('A prior call to #setDistFileName() is required.');
    }
    return this.distRelativePath;
  }

  public getDistFullPath() {
    return resolve(distChaptersDir, this.getDistRelativePath());
  }

  public readFile(): Promise<string> {
    return readFile(this.path, 'utf8');
  }

  public createMDI() {
    const htmlRelativePath = this.getDistRelativePath();
    return new MDI({
      replaceLink(link: string) {
        if (!link.startsWith('./')) {
          return link;
        }
        if (isAttachment(link)) {
          return join('./chapters', dirname(htmlRelativePath), link);
        }
        if (isDocument(link)) {
          return '#' + join(dirname(htmlRelativePath), link);
        }
      },
    } as MDI.Options)
      .use(mdiReplaceLinkPlugin)
      .use(mdiRubyPlugin);
  }

  public async derive(subPath: string) {
    return new LoaderContext(
      (await stat(subPath)).isDirectory(),
      subPath,
      this.getDistRelativePath(),
      this.stats,
      this.production,
      this.errors,
    );
  }

  public getErrors() {
    return this.errors;
  }

  public pushError(error: LoaderError) {
    this.errors.push(error);
  }
}
