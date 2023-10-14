import { BehaviorSubject } from 'rxjs';
import { injectable } from 'inversify';
import { systemPreferences } from 'electron';

import { mapSubject } from '~/utils/observable.utils';

@injectable()
export class AccentColorProvider {
  private readonly accentColorFull$: BehaviorSubject<string>;

  public get accentColor$(): BehaviorSubject<string> {
    return mapSubject(this.accentColorFull$, this.convertFromRgbaToRgb);
  }

  constructor() {
    this.accentColorFull$ = new BehaviorSubject(
      this.convertFromRgbaToRgb(systemPreferences.getAccentColor())
    );
    this.initializeSubscriptions();
  }

  private initializeSubscriptions(): void {
    systemPreferences.addListener(
      'accent-color-changed',
      (event: Electron.Event, newColor: string) => {
        this.accentColorFull$.next(newColor);
      }
    );
  }

  private convertFromRgbaToRgb(color: string): string {
    const RgbPartLength = 'FFAABB'.length;
    return color.substr(0, RgbPartLength);
  }
}
