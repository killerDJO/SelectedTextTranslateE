import { Observable } from "rxjs";
import { injectable } from "inversify";

import { AccentColorProvider } from "presentation/framework/AccentColorProvider";
import { SettingsProvider } from "business-logic/settings/SettingsProvider";
import { RendererErrorHandler } from "presentation/infrastructure/RendererErrorHandler";
import { IconsProvider } from "presentation/infrastructure/IconsProvider";
import { ViewSettings } from "business-logic/settings/dto/ViewSettings";
import { PresentationSettings } from "common/dto/settings/presentation-settings/PresentationSettings";
import { ScalerFactory } from "presentation/framework/scaling/ScalerFactory";

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

    public get viewSettings(): ViewSettings {
        return this.settingsProvider.getSettings().value.view;
    }

    public get presentationSettings(): Observable<PresentationSettings> {
        return this.settingsProvider.getSettings().map(settings => settings.presentation);
    }
}