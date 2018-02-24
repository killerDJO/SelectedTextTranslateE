import { screen } from "electron";
import { BehaviorSubject } from "rxjs";

export class ScaleProvider {
    public readonly scaleFactor$: BehaviorSubject<number>;
    private scaleFactor!: number;

    constructor() {
        this.scaleFactor$ = new BehaviorSubject(this.computeInitialScaleFactor());
        this.scaleFactor$.subscribe(scaleFactor => this.scaleFactor = scaleFactor);
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