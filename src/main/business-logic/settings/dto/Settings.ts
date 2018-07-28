import { RendererSettings } from "common/dto/settings/renderer-settings/RendererSettings";
import { Hotkey } from "common/dto/settings/Hotkey";
import { TranslationResultViewSettings } from "common/dto/settings/views-settings/TranslationResultViewSettings";

export interface Settings {
    readonly renderer: RendererSettings;
    readonly engine: TranslationEngineSettings;
    readonly views: ViewsSettings;
    readonly scaling: ScalingSettings;
    readonly hotkeys: HotkeySettings;
}

export interface HotkeySettings {
    readonly translate: Hotkey[];
    readonly playText: Hotkey[];
}

export interface TranslationEngineSettings {
    readonly copyDelayMilliseconds: number;
    readonly baseUrl: string;
    readonly historyRefreshInterval: number;
}

export interface ViewsSettings {
    readonly translation: TranslationSettings;
    readonly settings: ViewSize;
    readonly history: ViewSize;
}

export interface ViewSize {
    readonly width: number;
    readonly height: number;
}

export interface ScalingSettings {
    readonly verticalResolutionBaseline: number;
    readonly scalingStep: number;
    readonly minScaling: number;
    readonly maxScaling: number;
    readonly scaleTranslationViewOnly: boolean;
    readonly scaleFactor: number;
}

export interface TranslationSettings extends ViewSize {
    readonly margin: number;
    readonly renderer: TranslationResultViewSettings;
}