import { BehaviorSubject } from "rxjs";
import { injectable } from "inversify";
import { systemPreferences } from "electron";

@injectable()
export class AccentColorProvider {

    public readonly accentColor$: BehaviorSubject<string>;

    constructor() {
        this.accentColor$ = new BehaviorSubject(this.convertFromRgbaToRgb(systemPreferences.getAccentColor()));
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