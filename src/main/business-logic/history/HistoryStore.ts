import { Observable, Subject } from "rxjs";
import { tap, map, concatMap } from "rxjs/operators";
import * as Datastore from "nedb";
import { injectable } from "inversify";

import { TranslateResult } from "common/dto/translation/TranslateResult";
import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { HistoryRecordsResponse } from "common/dto/history/HistoryRecordsResponse";
import { SortColumn } from "common/dto/history/SortColumn";
import { SortOrder } from "common/dto/history/SortOrder";
import { TranslationKey } from "common/dto/translation/TranslationKey";
import { HistoryRecordsRequest } from "common/dto/history/HistoryRecordsRequest";

import { Logger } from "infrastructure/Logger";

import { DatastoreProvider } from "data-access/DatastoreProvider";

import { SettingsProvider } from "business-logic/settings/SettingsProvider";
import { HistorySettings } from "business-logic/settings/dto/Settings";
import { HistoryDatabaseProvider } from "business-logic/history/HistoryDatabaseProvider";
import { RecordIdGenerator } from "business-logic/history/RecordIdGenerator";

@injectable()
export class HistoryStore {

    private readonly datastore$: Observable<Datastore>;
    private readonly historyUpdatedSubject$: Subject<HistoryRecord> = new Subject();

    private readonly historySettings: HistorySettings;

    constructor(
        private readonly datastoreProvider: DatastoreProvider,
        private readonly settingsProvider: SettingsProvider,
        private readonly historyDatabaseProvider: HistoryDatabaseProvider,
        private readonly recordIdGenerator: RecordIdGenerator,
        private readonly logger: Logger) {

        this.historySettings = this.settingsProvider.getSettings().value.history;
        this.datastore$ = this.historyDatabaseProvider.historyDatastore$;
    }

    public get historyUpdated$(): Observable<HistoryRecord> {
        return this.historyUpdatedSubject$;
    }

    public addTranslateResult(translateResult: TranslateResult, key: TranslationKey, incrementTranslationsNumber: boolean): Observable<HistoryRecord> {
        const currentTime = new Date();
        const insert$ = this.datastoreProvider.insert<HistoryRecord>(this.datastore$, {
            id: this.recordIdGenerator.generateId(key),
            sentence: key.sentence,
            translateResult: translateResult,
            translationsNumber: incrementTranslationsNumber ? 1 : 0,
            isForcedTranslation: key.isForcedTranslation,
            sourceLanguage: key.sourceLanguage,
            targetLanguage: key.targetLanguage,
            createdDate: currentTime,
            updatedDate: currentTime,
            lastTranslatedDate: currentTime,
            isStarred: false,
            isArchived: false,
            ...this.getModificationFields(currentTime)
        });

        return insert$.pipe(
            tap(() => this.logger.info(`Translation ${this.getLogKey(key)} is saved to history.`)),
            tap(record => this.notifyAboutUpdate(record))
        );
    }

    public updateTranslateResult(translateResult: TranslateResult, key: TranslationKey, incrementTranslationsNumber: boolean): Observable<HistoryRecord> {
        const currentTime = new Date();
        const setQuery: any = {
            updatedDate: currentTime,
            translateResult: translateResult,
            ...this.getModificationFields(currentTime)
        };

        if (incrementTranslationsNumber) {
            setQuery.lastTranslatedDate = currentTime;
        }

        const update$ = this.datastoreProvider.update<HistoryRecord>(
            this.datastore$,
            this.getSearchQuery(key),
            {
                $set: setQuery,
                $inc: { translationsNumber: incrementTranslationsNumber ? 1 : 0 }
            });

        return update$.pipe(
            tap(() => this.logger.info(`Translation ${this.getLogKey(key)} is updated in history.`)),
            tap(record => this.notifyAboutUpdate(record))
        );
    }

    public incrementTranslationsNumber(key: TranslationKey): Observable<HistoryRecord> {
        const currentTime = new Date();
        const increment$ = this.datastoreProvider.update<HistoryRecord>(
            this.datastore$,
            this.getSearchQuery(key),
            { $inc: { translationsNumber: 1 }, $set: { lastTranslatedDate: currentTime, ...this.getModificationFields(currentTime) } });

        return increment$.pipe(
            tap(() => this.logger.info(`Translations number ${this.getLogKey(key)} is incremented.`)),
            tap(record => this.notifyAboutUpdate(record))
        );
    }

    public getRecord(key: TranslationKey): Observable<HistoryRecord | null> {
        return this.datastoreProvider
            .find<HistoryRecord>(this.datastore$, this.getSearchQuery(key))
            .pipe(
                map(result => !!result.length ? result[0] : null)
            );
    }

    public getRecords(request: HistoryRecordsRequest): Observable<HistoryRecordsResponse> {
        const sortColumnMap = {
            [SortColumn.Input]: "sentence",
            [SortColumn.TimesTranslated]: "translationsNumber",
            [SortColumn.LastTranslatedDate]: "lastTranslatedDate",
            [SortColumn.Translation]: "translateResult.sentence.translation",
            [SortColumn.SourceLanguage]: "sourceLanguage",
            [SortColumn.TargetLanguage]: "targetLanguage",
            [SortColumn.IsArchived]: "isArchived"
        };

        const sortQuery: any = {};
        sortQuery[sortColumnMap[request.sortColumn]] = request.sortOrder === SortOrder.Asc ? 1 : -1;
        if (request.sortColumn !== SortColumn.LastTranslatedDate) {
            sortQuery.lastTranslatedDate = -1;
        }

        const searchQuery: any = {};
        if (request.starredOnly) {
            searchQuery.isStarred = true;
        }
        if (!request.includeArchived) {
            searchQuery.isArchived = false;
        }

        const count$ = this.datastoreProvider.count(this.datastore$, searchQuery);
        const pageSize = this.historySettings.pageSize;

        return this.datastoreProvider
            .findPaged<HistoryRecord>(this.datastore$, searchQuery, sortQuery, request.pageNumber, pageSize).pipe(
                concatMap(historyRecords => count$.pipe(map(count => {
                    return {
                        records: historyRecords,
                        pageNumber: request.pageNumber,
                        pageSize: pageSize,
                        totalRecords: count
                    };
                })))
            );
    }

    public setStarredStatus(key: TranslationKey, isStarred: boolean): Observable<HistoryRecord> {
        return this.setStatus(key, { isStarred: isStarred }, `Translation ${this.getLogKey(key)} has changed its starred status to ${isStarred}.`);
    }

    public setArchivedStatus(key: TranslationKey, isArchived: boolean): Observable<HistoryRecord> {
        return this.setStatus(key, { isArchived: isArchived }, `Translation ${this.getLogKey(key)} has changed its archived status to ${isArchived}.`);
    }

    private setStatus(key: TranslationKey, updateQuery: any, logMessage: string): Observable<HistoryRecord> {
        const setStatus$ = this.datastoreProvider.update<HistoryRecord>(
            this.datastore$,
            this.getSearchQuery(key),
            { $set: { ...updateQuery, ...this.getModificationFields() } });

        return setStatus$.pipe(
            tap(() => this.logger.info(logMessage)),
            tap(record => this.notifyAboutUpdate(record))
        );
    }

    private notifyAboutUpdate(historyRecord: HistoryRecord): void {
        this.historyUpdatedSubject$.next(historyRecord);
    }

    private getSearchQuery(key: TranslationKey) {
        return {
            sentence: key.sentence,
            isForcedTranslation: key.isForcedTranslation,
            sourceLanguage: key.sourceLanguage,
            targetLanguage: key.targetLanguage
        };
    }

    private getModificationFields(modificationDate?: Date) {
        return {
            isSyncedWithServer: false,
            lastModifiedDate: (modificationDate || new Date()).getTime()
        };
    }

    private getLogKey(key: TranslationKey): string {
        return `for "${key.sentence}" when forced translation is set to "${key.isForcedTranslation}" with languages ${key.sourceLanguage}-${key.targetLanguage}`;
    }
}