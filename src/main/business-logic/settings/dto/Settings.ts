import { PresentationSettings } from "common/dto/presentation-settings/PresentationSettings";
import { TranslationEngineSettings } from "business-logic/settings/dto/TranslationEngineSettings";

export interface Settings {
    readonly presentation: PresentationSettings;
    readonly engine: TranslationEngineSettings;
}