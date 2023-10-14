import { injectable } from 'inversify';

import { IScaler } from './scaling.interface.js';
import { Scaler } from './scaler.service.js';
import { NullScaler } from './null-scaler.service.js';

@injectable()
export class ScalerFactory {
  constructor(
    private readonly scaler: Scaler,
    private readonly nullScaler: NullScaler
  ) {}

  public createScaler(isScalingEnabled: boolean): IScaler {
    return isScalingEnabled ? this.scaler : this.nullScaler;
  }
}
