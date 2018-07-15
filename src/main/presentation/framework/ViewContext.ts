import { AccentColorProvider } from "presentation/framework/AccentColorProvider";
import { SettingsProvider } from "business-logic/settings/SettingsProvider";
import { Scaler } from "presentation/framework/Scaler";
import { injectable } from "inversify";
import { IZoomHotkeysRegistry } from "presentation/hotkeys/IZoomHotkeysRegistry";
import { HotkeysRegistry } from "presentation/hotkeys/HotkeysRegistry";
import { RendererErrorHandler } from "presentation/infrastructure/RendererErrorHandler";
import { IconsProvider } from "presentation/infrastructure/IconsProvider";
import { ViewSettings } from "business-logic/settings/dto/ViewSettings";
import { PresentationSettings } from "common/dto/presentation-settings/PresentationSettings";

@injectable()
export class ViewContext {
    constructor(
        public readonly accentColorProvider: AccentColorProvider,
        private readonly settingsProvider: SettingsProvider,
        public readonly scaler: Scaler,
        public readonly errorHandler: RendererErrorHandler,
        public readonly iconsProvider: IconsProvider,
        private readonly hotkeysRegistry: HotkeysRegistry,
    ) {
    }

    public get viewSettings(): ViewSettings {
        return this.settingsProvider.getSettings().view;
    }

    public get presentationSettings(): PresentationSettings {
        return this.settingsProvider.getSettings().presentation;
    }

    public get zoomHotkeysRegistry(): IZoomHotkeysRegistry {
        return this.hotkeysRegistry;
    }
}