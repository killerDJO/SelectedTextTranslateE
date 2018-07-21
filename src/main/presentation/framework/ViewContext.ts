import { Observable, BehaviorSubject } from "rxjs";
import { AccentColorProvider } from "presentation/framework/AccentColorProvider";
import { SettingsProvider } from "business-logic/settings/SettingsProvider";
import { Scaler } from "presentation/framework/Scaler";
import { injectable } from "inversify";
import { RendererErrorHandler } from "presentation/infrastructure/RendererErrorHandler";
import { IconsProvider } from "presentation/infrastructure/IconsProvider";
import { ViewSettings } from "business-logic/settings/dto/ViewSettings";
import { PresentationSettings } from "common/dto/settings/presentation-settings/PresentationSettings";

@injectable()
export class ViewContext {
    constructor(
        private readonly settingsProvider: SettingsProvider,
        public readonly accentColorProvider: AccentColorProvider,
        public readonly scaler: Scaler,
        public readonly errorHandler: RendererErrorHandler,
        public readonly iconsProvider: IconsProvider
    ) {
    }

    public get viewSettings(): ViewSettings {
        return this.settingsProvider.getSettings().view;
    }

    public get presentationSettings(): Observable<PresentationSettings> {
        return Observable.of(this.settingsProvider.getSettings().presentation);
    }
}