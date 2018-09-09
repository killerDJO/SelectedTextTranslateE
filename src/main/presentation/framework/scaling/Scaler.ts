import { BehaviorSubject } from "rxjs";
import { screen } from "electron";
import { injectable } from "inversify";

import { ScalingState } from "common/dto/settings/ScalingState";
import { mapSubject } from "utils/map-subject";

import { SettingsProvider } from "business-logic/settings/SettingsProvider";
import { ScalingSettings } from "business-logic/settings/dto/Settings";

import { IScaler } from "presentation/framework/scaling/IScaler";

@injectable()
export class Scaler implements IScaler {
    public readonly scaleFactor$: BehaviorSubject<number>;

    constructor(private readonly settingsProvider: SettingsProvider) {
        this.scaleFactor$ = new BehaviorSubject(this.getInitialScaleFactor());

        this.scaleFactor$.subscribe(scaleFactor => this.settingsProvider.updateSettings({ scaling: { scaleFactor } }));
    }

    public zoomIn(): void {
        const newScaleFactor = this.scaleFactor$.value + this.scalingSettings.scalingStep;
        if (newScaleFactor > this.scalingSettings.maxScaling) {
            return;
        }

        this.changeScale(newScaleFactor);
    }

    public reset(): void {
        this.changeScale(1);
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
        this.changeScale(scaleFactor);
    }

    public scaleValue(value: number): number {
        return Math.round(this.scaleFactor$.value * value);
    }

    public downscaleValue(value: number): number {
        return Math.round(value / this.scaleFactor$.value);
    }

    public rescaleValue(value: number, previousScaleFactor: number): number {
        return Math.round(this.scaleFactor$.value / previousScaleFactor * value);
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
        this.scaleFactor$.next(newScaleFactor);
    }

    private get scalingSettings(): ScalingSettings {
        return this.settingsProvider.getSettings().value.scaling;
    }

    private getInitialScaleFactor(): number {
        return this.settingsProvider.getSettings().value.scaling.scaleFactor;
    }
}