import { injectable } from "inversify";

import { IScaler } from "presentation/framework/scaling/IScaler";
import { Scaler } from "presentation/framework/scaling/Scaler";
import { NullScaler } from "presentation/framework/scaling/NullScaler";

@injectable()
export class ScalerFactory {

    constructor(private readonly scaler: Scaler, private readonly nullScaler: NullScaler) {
    }

    public createScaler(isScalingEnabled: boolean): IScaler {
        return isScalingEnabled ? this.scaler : this.nullScaler;
    }
}