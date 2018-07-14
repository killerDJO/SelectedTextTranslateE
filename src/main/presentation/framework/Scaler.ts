import { BehaviorSubject } from "rxjs";
import { screen } from "electron";
import { injectable } from "inversify";

import { SettingsProvider } from "business-logic/settings/SettingsProvider";

@injectable()
export class Scaler {
    private readonly scaleFactorAdjustment: number;
    private readonly verticalResolutionBaseline: number;

    private readonly previousScaleFactor$: BehaviorSubject<number>;

    public readonly scaleFactor$: BehaviorSubject<number>;

    constructor(private readonly settingsProvider: SettingsProvider) {
        this.scaleFactorAdjustment = this.settingsProvider.getSettings().view.scaling.scalingStep;
        this.verticalResolutionBaseline = this.settingsProvider.getSettings().view.scaling.verticalResolutionBaseline;

        this.scaleFactor$ = new BehaviorSubject(this.computeInitialScaleFactor());
        this.previousScaleFactor$ = new BehaviorSubject(this.scaleFactor$.value);
    }

    public zoomIn(): void {
        this.savePreviousScaleFactor();
        this.scaleFactor$.next(this.scaleFactor$.getValue() + this.scaleFactorAdjustment);
    }

    public zoomOut(): void {
        this.savePreviousScaleFactor();
        this.scaleFactor$.next(this.scaleFactor$.getValue() - this.scaleFactorAdjustment);
    }

    public scale(value: number): number {
        return Math.round(this.scaleFactor$.getValue() * value);
    }

    public rescale(value: number): number {
        return Math.round(this.scaleFactor$.value / this.previousScaleFactor$.value * value);
    }

    private computeInitialScaleFactor(): number {
        const primaryDisplay = screen.getPrimaryDisplay();
        const verticalResolution = primaryDisplay.workAreaSize.height;
        return verticalResolution / this.verticalResolutionBaseline;
    }

    private savePreviousScaleFactor(): void {
        this.previousScaleFactor$.next(this.scaleFactor$.value);
    }
}