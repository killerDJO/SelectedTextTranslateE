import * as path from 'path';
import * as fs from 'fs';
import { injectable } from 'inversify';

@injectable()
export class RendererLocationProvider {
  static get rendererPath(): string {
    return path.resolve(__dirname, '..\\..\\..\\renderer');
  }

  public static getRendererLocation(): string {
    return `file:${path.join(this.rendererPath, 'index.html')}`;
  }

  public static getPreloadLocation(): string {
    const rendererAssets = fs.readdirSync(path.join(this.rendererPath, 'assets'));
    const preloadScript = rendererAssets.find(asset => asset.startsWith('preload-'));
    if (!preloadScript) {
      throw new Error('Unable to find preload script');
    }
    return path.join(this.rendererPath, 'assets', preloadScript);
  }
}
