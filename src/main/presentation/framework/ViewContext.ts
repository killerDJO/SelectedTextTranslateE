import { Observable, BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";
import { injectable } from "inversify";

import { RendererSettings } from "common/dto/settings/renderer-settings/RendererSettings";
import { mapSubject } from "utils/map-subject";

import { SettingsProvider } from "business-logic/settings/SettingsProvider";
import { ViewsSettings, ScalingSettings } from "business-logic/settings/dto/Settings";

import { AccentColorProvider } from "presentation/framework/AccentColorProvider";
import { RendererErrorHandler } from "presentation/infrastructure/RendererErrorHandler";
import { IconsProvider } from "presentation/infrastructure/IconsProvider";
import { ScalerFactory } from "presentation/framework/scaling/ScalerFactory";

@injectable()
export class ViewContext {
    constructor(
        public readonly settingsProvider: SettingsProvider,
        public readonly accentColorProvider: AccentColorProvider,
        public readonly scalerFactory: ScalerFactory,
        public readonly errorHandler: RendererErrorHandler,
        public readonly iconsProvider: IconsProvider
    ) {
    }

    public get viewsSettings(): ViewsSettings {
        return this.settingsProvider.getSettings().value.views;
    }

    public get scalingSettings(): BehaviorSubject<ScalingSettings> {
        return mapSubject(this.settingsProvider.getSettings(), settings => settings.scaling);
    }

    public get rendererSettings(): Observable<RendererSettings> {
        return this.settingsProvider.getSettings().pipe(map(settings => settings.renderer));
    }
}