import { BehaviorSubject } from 'rxjs';
import { injectable } from 'inversify';

import { ScalingSettings } from '@selected-text-translate/common';

import { SettingsProvider } from '~/infrastructure/settings-provider.service';
import { mapSubject } from '~/utils/observable.utils';

import { IScaler } from './scaling.interface.js';

@injectable()
export class Scaler implements IScaler {
  public readonly scaleFactor$: BehaviorSubject<number>;

  constructor(private readonly settingsProvider: SettingsProvider) {
    this.scaleFactor$ = mapSubject(
      settingsProvider.getSettings(),
      settings => settings.scaling.scaleFactor
    );
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
    if (
      scaleFactor > this.scalingSettings.maxScaling ||
      scaleFactor < this.scalingSettings.minScaling
    ) {
      throw Error('Invalid scale factor');
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
    return Math.round((this.scaleFactor$.value / previousScaleFactor) * value);
  }

  private changeScale(newScaleFactor: number): void {
    this.settingsProvider.updateSettings({ scaling: { scaleFactor: newScaleFactor } });
  }

  private get scalingSettings(): ScalingSettings {
    return this.settingsProvider.getSettings().value.scaling;
  }
}
