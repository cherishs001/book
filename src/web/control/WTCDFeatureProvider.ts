import { FeatureProvider } from '../../wtcd/FeatureProvider';
import { resolvePath } from '../util/resolvePath';
import { DebugLogger } from '../DebugLogger';
import { Chapter } from '../../Data';
import { AutoCache } from '../data/AutoCache';

const debugLogger = new DebugLogger('WTCD Feature Provider');
const imageCache = new AutoCache<string, HTMLImageElement>(url => {
  return new Promise((resolve, reject) => {
    const image = document.createElement('img');
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load ${url}.`));
    image.src = url;
  });
}, debugLogger);
export class WTCDFeatureProvider implements FeatureProvider {
  public constructor(
    private chapter: Chapter
  ) {}
  public loadImage(path: string): Promise<CanvasImageSource> {
    if (!path.startsWith('./')) {
      return Promise.reject(new Error('Path has to be relative and start ' +
      `with "./". Received: "${path}"`));
    }
    let resolved = resolvePath(
      'chapters',
      this.chapter.htmlRelativePath,
      '..',
      path.substr(2),
    );
    if (resolved === null) {
      return Promise.reject(new Error(`Failed to resolve path: "${path}".`));
    }
    resolved = '/' + resolved;
    debugLogger.log('Resolved from:', path, 'to:', resolved);
    return imageCache.get(resolved);
  }
}
