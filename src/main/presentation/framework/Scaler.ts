import { BehaviorSubject } from "rxjs";
import { screen } from "electron";
import { injectable } from "inversify";

@injectable()
export class Scaler {
    private readonly scaleFactorAdjustment: number = 0.05;

    public readonly scaleFactor$: BehaviorSubject<number>;

    constructor() {
        this.scaleFactor$ = new BehaviorSubject(this.computeInitialScaleFactor());
    }

    public zoomIn(): void {
        this.scaleFactor$.next(this.scaleFactor$.getValue() + this.scaleFactorAdjustment);
    }

    public zoomOut(): void {
        this.scaleFactor$.next(this.scaleFactor$.getValue() - this.scaleFactorAdjustment);
    }

    public scale(value: number): number {
        return Math.round(this.scaleFactor$.getValue() * value);
    }

    private computeInitialScaleFactor(): number {
        const primaryDisplay = screen.getPrimaryDisplay();
        const verticalResolution = primaryDisplay.workAreaSize.height;
        return verticalResolution / 860;
    }
}