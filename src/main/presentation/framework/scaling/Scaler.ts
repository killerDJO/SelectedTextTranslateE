import { BehaviorSubject } from "rxjs";
import { screen } from "electron";
import { injectable } from "inversify";

import { SettingsProvider } from "business-logic/settings/SettingsProvider";
import { IScaler } from "presentation/framework/scaling/IScaler";
import { ScalingSettings } from "business-logic/settings/dto/Settings";
import { ScalingState } from "common/dto/settings/ScalingState";
import { mapSubject } from "utils/map-subject";

@injectable()
export class Scaler implements IScaler {
    private readonly previousScaleFactor$: BehaviorSubject<number>;
    public readonly scaleFactor$: BehaviorSubject<number>;

    constructor(private readonly settingsProvider: SettingsProvider) {
        this.scaleFactor$ = new BehaviorSubject(this.getInitialScaleFactor());
        this.previousScaleFactor$ = new BehaviorSubject(this.scaleFactor$.value);

        this.scaleFactor$.subscribe(scaleFactor => this.settingsProvider.updateSettings({ scaling: { scaleFactor } }));
    }

    public zoomIn(): void {
        const newScaleFactor = this.scaleFactor$.value + this.scalingSettings.scalingStep;
        if (newScaleFactor > this.scalingSettings.maxScaling) {
            return;
        }

        this.changeScale(newScaleFactor);
    }

    public zoomOut(): void {
        const newScaleFactor = this.scaleFactor$.value - this.scalingSettings.scalingStep;
        if (newScaleFactor < this.scalingSettings.minScaling) {
            return;
        }

        this.changeScale(newScaleFactor);
    }

    public setScaleFactor(scaleFactor: number): void {
        if (scaleFactor > this.scalingSettings.maxScaling || scaleFactor < this.scalingSettings.minScaling) {
            throw Error("Invalid scale factor");
        }
        this.scaleFactor$.next(scaleFactor);
    }

    public scaleValue(value: number): number {
        return Math.round(this.scaleFactor$.value * value);
    }

    public rescaleValue(value: number): number {
        return Math.round(this.scaleFactor$.value / this.previousScaleFactor$.value * value);
    }

    public get scalingState(): BehaviorSubject<ScalingState> {
        return mapSubject<number, ScalingState>(this.scaleFactor$, scaleFactor => {
            return {
                autoScaleFactor: this.getAutoScaleFactor(),
                scaleFactor: scaleFactor,
                scalingStep: this.scalingSettings.scalingStep,
                minScaling: this.scalingSettings.minScaling,
                maxScaling: this.scalingSettings.maxScaling
            };
        });
    }

    private getAutoScaleFactor(): number {
        const verticalResolutionBaseline = this.settingsProvider.getSettings().value.scaling.verticalResolutionBaseline;
        const primaryDisplay = screen.getPrimaryDisplay();
        const verticalResolution = primaryDisplay.workAreaSize.height;
        return verticalResolution / verticalResolutionBaseline;
    }

    private changeScale(newScaleFactor: number) {
        this.savePreviousScaleFactor();
        this.scaleFactor$.next(newScaleFactor);
    }

    private get scalingSettings(): ScalingSettings {
        return this.settingsProvider.getSettings().value.scaling;
    }

    private getInitialScaleFactor(): number {
        return this.settingsProvider.getSettings().value.scaling.scaleFactor;
    }

    private savePreviousScaleFactor(): void {
        this.previousScaleFactor$.next(this.scaleFactor$.value);
    }
}