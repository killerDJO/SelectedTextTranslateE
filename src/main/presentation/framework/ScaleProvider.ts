import { screen } from "electron";
import { BehaviorSubject } from "rxjs";
import { injectable } from "inversify";

@injectable()
export class ScaleProvider {
    public readonly scaleFactor$: BehaviorSubject<number>;
    private readonly scaleFactorAdjustment: number = 0.05;

    private scaleFactor!: number;

    constructor() {
        this.scaleFactor$ = new BehaviorSubject(this.computeInitialScaleFactor());
        this.scaleFactor$.subscribe(scaleFactor => this.scaleFactor = scaleFactor);
    }

    public zoomIn(): void {
        this.scaleFactor$.next(this.scaleFactor + this.scaleFactorAdjustment);
    }

    public zoomOut(): void {
        this.scaleFactor$.next(this.scaleFactor - this.scaleFactorAdjustment);
    }

    public scale(value: number): number {
        return Math.round(this.scaleFactor * value);
    }

    private computeInitialScaleFactor(): number {
        const primaryDisplay = screen.getPrimaryDisplay();
        const verticalResolution = primaryDisplay.workAreaSize.height;
        return verticalResolution / 860;
    }
}