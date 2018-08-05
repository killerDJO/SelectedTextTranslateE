import { Observable, BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";
import { injectable } from "inversify";

import { AccentColorProvider } from "presentation/framework/AccentColorProvider";
import { SettingsProvider } from "business-logic/settings/SettingsProvider";
import { RendererErrorHandler } from "presentation/infrastructure/RendererErrorHandler";
import { IconsProvider } from "presentation/infrastructure/IconsProvider";
import { ScalerFactory } from "presentation/framework/scaling/ScalerFactory";
import { ViewsSettings, ScalingSettings } from "business-logic/settings/dto/Settings";
import { RendererSettings } from "common/dto/settings/renderer-settings/RendererSettings";
import { mapSubject } from "utils/map-subject";

@injectable()
export class ViewContext {
    constructor(
        private readonly settingsProvider: SettingsProvider,
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