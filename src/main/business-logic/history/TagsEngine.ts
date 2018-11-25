import { injectable } from "inversify";
import * as Datastore from "nedb";
import { Observable, BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";
import * as _ from "lodash";

import { SettingsProvider } from "business-logic/settings/SettingsProvider";
import { mapSubject } from "utils/map-subject";
import { HistoryDatabaseProvider } from "business-logic/history/persistence/HistoryDatabaseProvider";
import { DatastoreProvider } from "data-access/DatastoreProvider";
import { HistoryRecord } from "common/dto/history/HistoryRecord";

@injectable()
export class TagsEngine {

    private readonly database$: Observable<Datastore>;

    constructor(private readonly settingsProvider: SettingsProvider, private readonly datastoreProvider: DatastoreProvider, historyDatabaseProvider: HistoryDatabaseProvider) {
        this.database$ = historyDatabaseProvider.historyDatastore$;
    }

    public getCurrentTags(): BehaviorSubject<ReadonlyArray<string>> {
        return mapSubject(this.settingsProvider.getSettings(), settings => settings.tags.currentTags);
    }

    public getSuggestions(input: string): Observable<ReadonlyArray<string>> {
        return this.datastoreProvider.find<HistoryRecord>(this.database$, {}).pipe(
            map(records => this.getDistinctTags(records)),
            map(tags => this.filterTags(input, tags))
        );
    }

    public updateCurrentTags(tags: ReadonlyArray<string>): void {
        this.settingsProvider.updateSettings({
            tags: {
                currentTags: tags
            }
        });
    }

    private getDistinctTags(records: HistoryRecord[]): string[] {
        return _.uniq(_.flatMap(records, record => record.tags || []).concat(this.getCurrentTags().value));
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