import { injectable } from "inversify";
import * as Datastore from "nedb";
import { Observable, BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";
import * as _ from "lodash";

import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { Tag } from "common/dto/history/Tag";

import { mapSubject } from "utils/map-subject";

import { SettingsProvider } from "business-logic/settings/SettingsProvider";
import { HistoryDatabaseProvider } from "business-logic/history/persistence/HistoryDatabaseProvider";
import { DatastoreProvider } from "data-access/DatastoreProvider";

@injectable()
export class TagsEngine {

    private readonly database$: Observable<Datastore>;

    constructor(private readonly settingsProvider: SettingsProvider, private readonly datastoreProvider: DatastoreProvider, historyDatabaseProvider: HistoryDatabaseProvider) {
        this.database$ = historyDatabaseProvider.historyDatastore$;
    }

    public getCurrentTags(): BehaviorSubject<ReadonlyArray<Tag>> {
        return mapSubject(this.settingsProvider.getSettings(), settings => {
            return settings.tags.currentTags.map(currentTag => _.isString(currentTag) ? { tag: currentTag, isEnabled: true } : currentTag);
        });
    }

    public getSuggestions(input: string): Observable<ReadonlyArray<string>> {
        return this.datastoreProvider.find<HistoryRecord>(this.database$, {}).pipe(
            map(records => this.getDistinctTags(records)),
            map(tags => this.filterTags(input, tags))
        );
    }

    public updateCurrentTags(tags: ReadonlyArray<Tag>): void {
        this.settingsProvider.updateSettings({
            tags: {
                currentTags: tags
            }
        });
    }

    private getDistinctTags(records: HistoryRecord[]): string[] {
        return _.uniq(_.flatMap(records, record => record.tags || []).concat(this.getCurrentTags().value.map(tag => tag.tag)));
    }

    private filterTags(input: string, tags: string[]): string[] {
        const inputTokens = this.tokenizeTag(input);
        return tags.filter(tag => this.areTokensMatch(inputTokens, this.tokenizeTag(tag)));
    }

    private tokenizeTag(tag: string): string[] {
        return tag.split(" ").map(token => token.toLowerCase().trim()).filter(token => !!token);
    }

    private areTokensMatch(input: string[], target: string[]): boolean {
        return input.every(token => target.some(targetToken => targetToken.includes(token)));
    }
}