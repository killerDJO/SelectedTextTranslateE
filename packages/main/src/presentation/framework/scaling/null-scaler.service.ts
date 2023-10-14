import { BehaviorSubject } from 'rxjs';
import { injectable } from 'inversify';

import { IScaler } from './scaling.interface.js';

@injectable()
export class NullScaler implements IScaler {
  public readonly scaleFactor$: BehaviorSubject<number>;

  constructor() {
    this.scaleFactor$ = new BehaviorSubject(1);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public zoomIn(): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public zoomOut(): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public reset(): void {}

  public scaleValue(value: number): number {
    return value;
  }

  public downscaleValue(value: number): number {
    return value;
  }

  public rescaleValue(value: number): number {
    return value;
  }
}
