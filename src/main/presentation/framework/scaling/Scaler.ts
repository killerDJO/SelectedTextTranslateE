import { BehaviorSubject } from "rxjs";
import { screen } from "electron";
import { injectable } from "inversify";

import { SettingsProvider } from "business-logic/settings/SettingsProvider";
import { IScaler } from "presentation/framework/scaling/IScaler";

@injectable()
export class Scaler implements IScaler {
    private readonly previousScaleFactor$: BehaviorSubject<number>;
    public readonly scaleFactor$: BehaviorSubject<number>;

    constructor(private readonly settingsProvider: SettingsProvider) {
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

    private get scaleFactorAdjustment(): number {
        return this.settingsProvider.getSettings().value.view.scaling.scalingStep;
    }

    private computeInitialScaleFactor(): number {
        const scalingSettings = this.settingsProvider.getSettings().value.view.scaling;
        if (!scalingSettings.autoScale) {
            return scalingSettings.initialScaling;
        }

        const verticalResolutionBaseline = this.settingsProvider.getSettings().value.view.scaling.verticalResolutionBaseline;
        const primaryDisplay = screen.getPrimaryDisplay();
        const verticalResolution = primaryDisplay.workAreaSize.height;
        return verticalResolution / verticalResolutionBaseline;
    }

    private savePreviousScaleFactor(): void {
        this.previousScaleFactor$.next(this.scaleFactor$.value);
    }
}