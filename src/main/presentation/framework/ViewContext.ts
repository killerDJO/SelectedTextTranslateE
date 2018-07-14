import { AccentColorProvider } from "presentation/framework/AccentColorProvider";
import { SettingsProvider } from "business-logic/settings/SettingsProvider";
import { Scaler } from "presentation/framework/Scaler";
import { injectable } from "inversify";
import { IZoomHotkeysRegistry } from "presentation/hotkeys/IZoomHotkeysRegistry";
import { HotkeysRegistry } from "presentation/hotkeys/HotkeysRegistry";
import { RendererErrorHandler } from "presentation/infrastructure/RendererErrorHandler";
import { IconsProvider } from "presentation/infrastructure/IconsProvider";
import { ViewSettings } from "business-logic/settings/dto/ViewSettings";

@injectable()
export class ViewContext {

    public readonly zoomHotkeysRegistry: IZoomHotkeysRegistry;

    constructor(
        public readonly accentColorProvider: AccentColorProvider,
        public readonly settingsProvider: SettingsProvider,
        public readonly scaler: Scaler,
        public readonly errorHandler: RendererErrorHandler,
        public readonly iconsProvider: IconsProvider,
        hotkeysRegistry: HotkeysRegistry,
    ) {
        this.zoomHotkeysRegistry = hotkeysRegistry;
    }
}