import { BehaviorSubject } from "rxjs";
import { screen } from "electron";
import { injectable } from "inversify";

import { IScaler } from "presentation/framework/scaling/IScaler";

@injectable()
export class NullScaler implements IScaler {
    public readonly scaleFactor$: BehaviorSubject<number>;

    constructor() {
        this.scaleFactor$ = new BehaviorSubject(1);
    }

    // tslint:disable-next-line:no-empty
    public zoomIn(): void {
    }

    // tslint:disable-next-line:no-empty
    public zoomOut(): void {
    }

    public scaleValue(value: number): number {
        return value;
    }

    public rescaleValue(value: number): number {
        return value;
    }
}