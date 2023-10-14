import { BehaviorSubject } from 'rxjs';
import { injectable } from 'inversify';

import { ScalingSettings, Settings, ViewsSettings } from '@selected-text-translate/common';

import { mapSubject } from '~/utils/observable.utils';
import { SettingsProvider } from '~/infrastructure/settings-provider.service';
import { StartupHandler } from '~/install/startup-handler.service';
import { RequestProvider } from '~/services/request-provider.service';
import { Logger } from '~/infrastructure/logger.service';

import { IconsProvider } from './icons-provider.service';
import { RendererErrorHandler } from './renderer-error-handler.service';
import { ScalerFactory } from './scaling/scaler-factory.service';
import { AccentColorProvider } from './accent-color-provider.service';

@injectable()
export class ViewContext {
  constructor(
    public readonly startupHandler: StartupHandler,
    public readonly settingsProvider: SettingsProvider,
    public readonly requestProvider: RequestProvider,
    public readonly accentColorProvider: AccentColorProvider,
    public readonly scalerFactory: ScalerFactory,
    public readonly errorHandler: RendererErrorHandler,
    public readonly iconsProvider: IconsProvider,
    public readonly logger: Logger
  ) {}

  public get settings(): BehaviorSubject<Settings> {
    return this.settingsProvider.getSettings();
  }

  public get viewsSettings(): ViewsSettings {
    return this.settingsProvider.getSettings().value.views;
  }

  public get scalingSettings(): BehaviorSubject<ScalingSettings> {
    return mapSubject(this.settingsProvider.getSettings(), settings => settings.scaling);
  }
}
