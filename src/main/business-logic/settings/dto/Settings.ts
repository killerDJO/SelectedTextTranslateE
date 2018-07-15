import { PresentationSettings } from "common/dto/presentation-settings/PresentationSettings";
import { TranslationEngineSettings } from "business-logic/settings/dto/TranslationEngineSettings";
import { ViewSettings } from "business-logic/settings/dto/ViewSettings";
import { HotkeySettings } from "business-logic/settings/dto/HotkeySettings";

export interface Settings {
    readonly presentation: PresentationSettings;
    readonly engine: TranslationEngineSettings;
    readonly view: ViewSettings;
    readonly hotkeys: HotkeySettings;
}