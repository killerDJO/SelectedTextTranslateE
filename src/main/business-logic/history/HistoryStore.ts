import { Observable, Subject } from "rxjs";
import { tap, map, concatMap } from "rxjs/operators";
import * as Datastore from "nedb";
import { injectable } from "inversify";

import { TranslateResult } from "common/dto/translation/TranslateResult";
import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { HistoryRecordsResponse } from "common/dto/history/HistoryRecordsResponse";
import { SortColumn } from "common/dto/history/SortColumn";
import { SortOrder } from "common/dto/history/SortOrder";
import { Logger } from "infrastructure/Logger";
import { DatastoreProvider } from "data-access/DatastoreProvider";
import { SettingsProvider } from "business-logic/settings/SettingsProvider";
import { HistorySettings } from "business-logic/settings/dto/Settings";

@injectable()
export class HistoryStore {

    private readonly datastore: Datastore;
    private readonly historyUpdatedSubject$: Subject<void> = new Subject();

    private readonly historySettings: HistorySettings;

    constructor(
        private readonly datastoreProvider: DatastoreProvider,
        private readonly settingsProvider: SettingsProvider,
        private readonly logger: Logger) {

        this.historySettings = this.settingsProvider.getSettings().value.history;
        this.datastore = this.datastoreProvider.openDatabase(this.historySettings.databaseName);
    }

    public get historyUpdated$(): Observable<void> {
        return this.historyUpdatedSubject$;
    }

    public addTranslateResult(translateResult: TranslateResult, isForcedTranslation: boolean): Observable<HistoryRecord> {
        const currentTime = new Date();
        const insert$ = this.datastoreProvider.insert<HistoryRecord>(this.datastore, {
            sentence: translateResult.sentence.input,
            translateResult: translateResult,
            translationsNumber: 0,
            isForcedTranslation: isForcedTranslation,
            createdDate: currentTime,
            updatedDate: currentTime,
            lastTranslatedDate: currentTime,
            isStarred: false
        });

        return insert$.pipe(
            tap(() => this.logger.info(`Translation for "${translateResult.sentence.input}" when forced translation is set to "${isForcedTranslation}" is saved to history.`)),
            tap(() => this.notifyAboutUpdate())
        );
    }

    public updateTranslateResult(translateResult: TranslateResult, isForcedTranslation: boolean, skipStatistic: boolean): Observable<HistoryRecord> {
        const currentTime = new Date();
        const update$ = this.datastoreProvider.update<HistoryRecord>(this.datastore, { sentence: translateResult.sentence.input, isForcedTranslation: isForcedTranslation }, {
            $set: {
                translateResult: translateResult,
                updatedDate: skipStatistic ? undefined : currentTime
            }
        });

        return update$.pipe(
            tap(() => this.logger.info(`Translation for "${translateResult.sentence.input}" when forced translation is set to "${isForcedTranslation}" is updated in history.`)),
            tap(() => this.notifyAboutUpdate())
        );
    }

    public incrementTranslationsNumber(translateResult: TranslateResult, isForcedTranslation: boolean): Observable<HistoryRecord> {
        const currentTime = new Date();
        const increment$ = this.datastoreProvider.update<HistoryRecord>(
            this.datastore,
            { sentence: translateResult.sentence.input, isForcedTranslation: isForcedTranslation },
            { $inc: { translationsNumber: 1 }, $set: { lastTranslatedDate: currentTime } });

        return increment$.pipe(
            tap(() => this.logger.info(`Translations number for "${translateResult.sentence.input}" when forced translation is set to "${isForcedTranslation}" is incremented.`)),
            tap(() => this.notifyAboutUpdate())
        );
    }

    public getRecord(sentence: string, isForcedTranslation: boolean): Observable<HistoryRecord | null> {
        return this.datastoreProvider
            .find<HistoryRecord>(this.datastore, { sentence: sentence, isForcedTranslation: isForcedTranslation })
            .pipe(
                map(result => !!result.length ? result[0] : null)
            );
    }

    public getRecords(pageNumber: number, sortColumn: SortColumn, sortOrder: SortOrder, starredOnly: boolean): Observable<HistoryRecordsResponse> {
        const sortColumnMap = {
            [SortColumn.Input]: "sentence",
            [SortColumn.TimesTranslated]: "translationsNumber",
            [SortColumn.LastTranslatedDate]: "lastTranslatedDate",
            [SortColumn.Translation]: "translateResult.sentence.translation"
        };

        const sortQuery: any = {};
        sortQuery[sortColumnMap[sortColumn]] = sortOrder === SortOrder.Asc ? 1 : -1;

        const searchQuery: any = {};
        searchQuery.isForcedTranslation = false;
        if (starredOnly) {
            searchQuery.isStarred = true;
        }

        const count$ = this.datastoreProvider.count(this.datastore, searchQuery);
        const pageSize = this.historySettings.pageSize;

        return this.datastoreProvider
            .findPaged<HistoryRecord>(this.datastore, searchQuery, sortQuery, pageNumber, pageSize).pipe(
                concatMap(historyRecords => count$.pipe(map(count => { return { historyRecords, count }; }))),
                map(historyRecordsWithCount => {
                    return {
                        records: historyRecordsWithCount.historyRecords,
                        pageNumber: pageNumber,
                        pageSize: pageSize,
                        totalRecords: historyRecordsWithCount.count
                    };
                })
            );
    }

    public setStarredStatus(sentence: string, isForcedTranslation: boolean, isStarred: boolean): Observable<HistoryRecord> {
        const setStarredStatus$ = this.datastoreProvider.update<HistoryRecord>(
            this.datastore,
            { sentence: sentence, isForcedTranslation: isForcedTranslation },
            { $set: { isStarred: isStarred } });

        return setStarredStatus$.pipe(
            tap(() => this.logger.info(`Translation for "${sentence}" when forced translation is set to "${isForcedTranslation}" has changed its starred status to ${isStarred}.`)),
            tap(() => this.notifyAboutUpdate())
        );
    }

    private notifyAboutUpdate(): void {
        this.historyUpdatedSubject$.next();
    }
}