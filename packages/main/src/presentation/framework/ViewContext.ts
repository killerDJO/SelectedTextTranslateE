import { BehaviorSubject } from 'rxjs';
import { injectable } from 'inversify';

import {
  ScalingSettings,
  Settings,
  ViewsSettings
} from '@selected-text-translate/common/settings/Settings';

import { mapSubject } from '~/utils/map-subject';
import { SettingsProvider } from '~/infrastructure/SettingsProvider';
import { StartupHandler } from '~/install/StartupHandler';
import { RequestProvider } from '~/services/RequestProvider';
import { Logger } from '~/infrastructure/Logger';

import { IconsProvider } from './IconsProvider';
import { RendererErrorHandler } from './RendererErrorHandler';
import { ScalerFactory } from './scaling/ScalerFactory';
import { AccentColorProvider } from './AccentColorProvider';

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
