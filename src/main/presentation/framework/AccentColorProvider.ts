import { BehaviorSubject, Observable } from "rxjs";
import { injectable } from "inversify";
import { systemPreferences } from "electron";
import { map, distinctUntilChanged } from "rxjs/operators";

@injectable()
export class AccentColorProvider {

    private readonly accentColorFull$: BehaviorSubject<string>;

    public get accentColor$(): Observable<string> {
        return this.accentColorFull$.pipe(
            map(this.convertFromRgbaToRgb),
            distinctUntilChanged()
        );
    }

    constructor() {
        this.accentColorFull$ = new BehaviorSubject(this.convertFromRgbaToRgb(systemPreferences.getAccentColor()));
        this.initializeSubscriptions();
    }

    private initializeSubscriptions(): void {
        systemPreferences.addListener("accent-color-changed", (event: Electron.Event, newColor: string) => {
            this.accentColorFull$.next(newColor);
        });
    }

    private convertFromRgbaToRgb(color: string): string {
        return color.substr(0, 6);
    }
}