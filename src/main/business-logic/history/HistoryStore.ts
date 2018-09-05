import { Observable, Subject } from "rxjs";
import { tap, map } from "rxjs/operators";
import * as Datastore from "nedb";
import { injectable } from "inversify";

import { TranslateResult } from "common/dto/translation/TranslateResult";
import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { SortColumn } from "common/dto/history/SortColumn";
import { SortOrder } from "common/dto/history/SortOrder";
import { Logger } from "infrastructure/Logger";
import { DatastoreProvider } from "data-access/DatastoreProvider";

@injectable()
export class HistoryStore {

    private readonly datastore: Datastore;
    private readonly historyUpdatedSubject$: Subject<void> = new Subject();

    constructor(
        private readonly datastoreProvider: DatastoreProvider,
        private readonly logger: Logger) {

        this.datastore = this.datastoreProvider.openDatabase("history.db");
    }

    public get historyUpdated$(): Observable<void> {
        return this.historyUpdatedSubject$;
    }

    public addTranslateResult(translateResult: TranslateResult, isForcedTranslation: boolean): Observable<void> {
        const currentTime = new Date();
        const insert$ = this.datastoreProvider.insert<HistoryRecord>(this.datastore, {
            sentence: translateResult.sentence.input.trim(),
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

    public updateTranslateResult(translateResult: TranslateResult, isForcedTranslation: boolean, skipStatistic: boolean): Observable<void> {
        const currentTime = new Date();
        const update$ = this.datastoreProvider.update(this.datastore, { sentence: translateResult.sentence.input, isForcedTranslation: isForcedTranslation }, {
            sentence: translateResult.sentence.input.trim(),
            translateResult: translateResult,
            isForcedTranslation: isForcedTranslation,
            updatedDate: skipStatistic ? undefined : currentTime
        });

        return update$.pipe(
            tap(() => this.logger.info(`Translation for "${translateResult.sentence.input}" when forced translation is set to "${isForcedTranslation}" is updated in history.`)),
            tap(() => this.notifyAboutUpdate())
        );
    }

    public incrementTranslationsNumber(translateResult: TranslateResult, isForcedTranslation: boolean): Observable<void> {
        const currentTime = new Date();
        const increment$ = this.datastoreProvider.update(
            this.datastore,
            { sentence: translateResult.sentence.input.trim(), isForcedTranslation: isForcedTranslation },
            { $inc: { translationsNumber: 1 }, $set: { lastTranslatedDate: currentTime } });

        return increment$.pipe(
            tap(() => this.logger.info(`Translations number for "${translateResult.sentence.input}" when forced translation is set to "${isForcedTranslation}" is incremented.`)),
            tap(() => this.notifyAboutUpdate())
        );
    }

    public getRecord(sentence: string, isForcedTranslation: boolean): Observable<HistoryRecord | null> {
        return this.datastoreProvider
            .find<HistoryRecord>(this.datastore, { sentence: sentence.trim(), isForcedTranslation: isForcedTranslation })
            .pipe(
                map(result => !!result.length ? result[0] : null)
            );
    }

    public getRecords(limit: number, sortColumn: SortColumn, sortOrder: SortOrder, starredOnly: boolean): Observable<HistoryRecord[]> {
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

        return this.datastoreProvider
            .findPaged<HistoryRecord>(this.datastore, searchQuery, sortQuery, limit);
    }

    public setStarredStatus(sentence: string, isForcedTranslation: boolean, isStarred: boolean): Observable<void> {
        const setStarredStatus$ = this.datastoreProvider.update(
            this.datastore,
            { sentence: sentence.trim(), isForcedTranslation: isForcedTranslation },
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