import { injectable } from "inversify";
import { Observable, BehaviorSubject, of } from "rxjs";

import { SettingsProvider } from "business-logic/settings/SettingsProvider";
import { mapSubject } from "utils/map-subject";

@injectable()
export class TagsEngine {

    constructor(private readonly settingsProvider: SettingsProvider) {
    }

    public getCurrentTags(): BehaviorSubject<ReadonlyArray<string>> {
        return mapSubject(this.settingsProvider.getSettings(), settings => settings.tags.currentTags);
    }

    public getAllTags(): Observable<ReadonlyArray<string>> {
        return of([]);
    }

    public updateCurrentTags(tags: ReadonlyArray<string>): void {
        this.settingsProvider.updateSettings({
            tags: {
                currentTags: tags
            }
        });
    }
}