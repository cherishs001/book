import { DebugLogger } from '../DebugLogger';

export class AutoCache<TKey, TValue> {
  private map = new Map<TKey, Promise<TValue>>();
  public constructor(
    private loader: (key: TKey) => Promise<TValue>,
    private logger: DebugLogger,
  ) {}
  public get(key: TKey): Promise<TValue> {
    let value = this.map.get(key);
    if (value === undefined) {
      this.logger.log(`Start loading for key=${key}.`);
      value = this.loader(key);
      this.map.set(key, value);
      value.catch(error => {
        this.map.delete(key);
        this.logger.warn(
          `Loader failed for key=${key}. Cache removed.`, error,
        );
      });
    } else {
      this.logger.log(`Cached value used for key=${key}.`);
    }
    return value;
  }
}
