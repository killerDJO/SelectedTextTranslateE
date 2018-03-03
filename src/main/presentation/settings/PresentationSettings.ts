import { BehaviorSubject } from "rxjs";
import { injectable } from "inversify";
import { systemPreferences, screen } from "electron";

import { ResultVisibilitySettings } from "common/dto/presentation-settings/ResultVisibilitySettings";
import { ScoreSettings } from "common/dto/presentation-settings/ScoreSettings";

@injectable()
export class PresentationSettings {

    public readonly accentColor$: BehaviorSubject<string>;
    public readonly scaleFactor$: BehaviorSubject<number>;
    public readonly resultVisibilitySettings$: BehaviorSubject<ResultVisibilitySettings>;
    public readonly scoreSettings$: BehaviorSubject<ScoreSettings>;

    private readonly scaleFactorAdjustment: number = 0.05;

    constructor() {
        this.accentColor$ = new BehaviorSubject(this.convertFromRgbaToRgb(systemPreferences.getAccentColor()));
        this.scaleFactor$ = new BehaviorSubject(this.computeInitialScaleFactor());
        this.resultVisibilitySettings$ = new BehaviorSubject<ResultVisibilitySettings>({
            lowScoreThreshold: 0.003,
            visibleByDefaultNumber: 6
        });
        this.scoreSettings$ = new BehaviorSubject<ScoreSettings>({
            highThreshold: 0.05,
            mediumThreshold: 0.0025
        });

        this.initializeSubscriptions();
    }

    private initializeSubscriptions(): void {
        systemPreferences.addListener("accent-color-changed", (event: Electron.Event, newColor: string) => {
            this.accentColor$.next(this.convertFromRgbaToRgb(newColor));
        });
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

    private convertFromRgbaToRgb(color: string): string {
        return color.substr(0, 6);
    }
}