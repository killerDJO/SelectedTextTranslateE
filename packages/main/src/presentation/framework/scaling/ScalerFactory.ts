import { injectable } from 'inversify';

import { IScaler } from './IScaler';
import { Scaler } from './Scaler';
import { NullScaler } from './NullScaler';

@injectable()
export class ScalerFactory {
  constructor(private readonly scaler: Scaler, private readonly nullScaler: NullScaler) {}

  public createScaler(isScalingEnabled: boolean): IScaler {
    return isScalingEnabled ? this.scaler : this.nullScaler;
  }
}
