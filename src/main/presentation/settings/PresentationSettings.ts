import { BehaviorSubject } from "rxjs";
import { injectable } from "inversify";
import { systemPreferences } from "electron";

import { ResultVisibilitySettings } from "common/dto/presentation-settings/ResultVisibilitySettings";
import { ScoreSettings } from "common/dto/presentation-settings/ScoreSettings";

@injectable()
export class PresentationSettings {

    public readonly accentColor$: BehaviorSubject<string>;
    public readonly resultVisibilitySettings$: BehaviorSubject<ResultVisibilitySettings>;
    public readonly scoreSettings$: BehaviorSubject<ScoreSettings>;

    constructor() {
        this.accentColor$ = new BehaviorSubject(this.convertFromRgbaToRgb(systemPreferences.getAccentColor()));
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

    private convertFromRgbaToRgb(color: string): string {
        return color.substr(0, 6);
    }
}