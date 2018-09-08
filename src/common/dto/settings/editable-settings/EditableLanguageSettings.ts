import { Language } from "common/dto/settings/Language";

export interface EditableLanguageSettings {
    sourceLanguage: string;
    targetLanguage: string;
    readonly allLanguages: ReadonlyArray<Language>;
}