import { injectable } from "inversify";
import { shell } from "electron";

import { replacePattern } from "utils/replace-pattern";

import { SettingsProvider } from "business-logic/settings/SettingsProvider";

@injectable()
export class SearchExecutor {
    constructor(private readonly settingsProvider: SettingsProvider) {
    }

    public search(text: string): void {
        const encodedText = encodeURIComponent(text);
        const searchUrlPattern = this.settingsProvider.getSettings().value.search.searchPattern;
        const searchUrl = replacePattern(searchUrlPattern, "query", encodedText);
        shell.openExternal(searchUrl);
    }
}