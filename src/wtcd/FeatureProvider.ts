export interface FeatureProvider {
  /**
   * When using the canvas functionality of WTCD, user may choose to put an
   * external image to the canvas. Whenever that happens, this method is called.
   */
  loadImage(path: string): Promise<CanvasImageSource>;
}

export const defaultFeatureProvider: FeatureProvider = {
  loadImage(path: string) {
    return Promise.reject('Loading image is not allowed.');
  }
};
