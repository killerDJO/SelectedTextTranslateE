import { injectable } from "inversify";
import { Observable, BehaviorSubject, of } from "rxjs";
import { map, concatMap } from "rxjs/operators";

import { SettingsProvider } from "business-logic/settings/SettingsProvider";
import { mapSubject } from "utils/map-subject";
import { EditableTagsSettings } from "common/dto/settings/editable-settings/EditableTagsSettings";

@injectable()
export class TagsEngine {

    constructor(private readonly settingsProvider: SettingsProvider) {
    }

    public getCurrentTags(): BehaviorSubject<ReadonlyArray<string>> {
        return mapSubject(this.settingsProvider.getSettings(), settings => settings.tags.currentTags);
    }

    public getEditableTagSettings(): Observable<EditableTagsSettings> {
        return this.settingsProvider.getSettings().pipe(
            map(settings => settings.tags.currentTags.slice()),
            concatMap(currentTags => this.getAllTags().pipe(map(allTags => ({ currentTags: currentTags, allTags: allTags }))))
        );
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