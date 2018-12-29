import { Observable, of } from "rxjs";
import { map, concatMap } from "rxjs/operators";
import * as Datastore from "nedb";
import * as _ from "lodash";
import { injectable } from "inversify";

import { HistoryRecordsResponse, HistoryRecordViewModel } from "common/dto/history/HistoryRecordsResponse";
import { SortColumn } from "common/dto/history/SortColumn";
import { SortOrder } from "common/dto/history/SortOrder";
import { HistoryRecordsRequest } from "common/dto/history/HistoryRecordsRequest";
import { HistoryFilter } from "common/dto/history/HistoryFilter";
import { HistoryRecord } from "common/dto/history/HistoryRecord";

import { DatastoreProvider } from "data-access/DatastoreProvider";

import { HistoryDatabaseProvider } from "business-logic/history/persistence/HistoryDatabaseProvider";
import { AccountHandler } from "business-logic/history/sync/AccountHandler";
import { AccountInfo } from "common/dto/history/account/AccountInfo";

@injectable()
export class HistoryQueryExecutor {
    private readonly datastore$: Observable<Datastore>;

    constructor(
        private readonly datastoreProvider: DatastoreProvider,
        private readonly historyDatabaseProvider: HistoryDatabaseProvider,
        private readonly accountHandler: AccountHandler) {

        this.datastore$ = this.historyDatabaseProvider.historyDatastore$;
    }

    public getRecords(request: HistoryRecordsRequest): Observable<HistoryRecordsResponse> {
        const sortColumnMap = {
            [SortColumn.Input]: "sentence",
            [SortColumn.TimesTranslated]: "translationsNumber",
            [SortColumn.LastTranslatedDate]: "lastTranslatedDate",
            [SortColumn.Translation]: "translateResult.sentence.translation",
            [SortColumn.SourceLanguage]: "sourceLanguage",
            [SortColumn.TargetLanguage]: "targetLanguage",
            [SortColumn.IsArchived]: "isArchived",
            [SortColumn.Tags]: "tags"
        };

        const sortQuery: any = {};
        sortQuery[sortColumnMap[request.sortColumn]] = request.sortOrder === SortOrder.Asc ? 1 : -1;
        if (request.sortColumn !== SortColumn.LastTranslatedDate) {
            sortQuery.lastTranslatedDate = -1;
        }

        const user = this.accountHandler.currentUser$.value;
        const searchQuery: any = this.buildFilterQuery(request.filter, user);
        const count$ = this.datastoreProvider.count(this.datastore$, searchQuery);

        return this.datastoreProvider
            .findPaged<HistoryRecord>(this.datastore$, searchQuery, sortQuery, request.pageNumber, request.pageSize).pipe(
                concatMap(historyRecords => count$.pipe(map(count => {
                    return {
                        records: historyRecords.map(record => this.mapRecordToViewModel(record, user)),
                        pageNumber: request.pageNumber,
                        pageSize: request.pageSize,
                        totalRecords: count
                    };
                })))
            );
    }

    private mapRecordToViewModel(record: HistoryRecord, user: AccountInfo | null): HistoryRecordViewModel {
        return {
            sentence: record.sentence,
            translation: record.translateResult.sentence.translation,
            isForcedTranslation: record.isForcedTranslation,
            sourceLanguage: record.sourceLanguage,
            targetLanguage: record.targetLanguage,
            id: record.id,
            lastTranslatedDate: record.lastTranslatedDate,
            translationsNumber: record.translationsNumber,
            isArchived: record.isArchived,
            isStarred: record.isStarred,
            tags: record.tags || [],
            isSyncedWithServer: this.isRecordSyncedWithServer(record, user)
        };
    }

    private buildFilterQuery(filter: HistoryFilter, user: AccountInfo | null): any {
        const query: any = { $and: [] };

        this.filterStarredOnly(filter, query);
        this.filterArchived(filter, query);
        this.filterWord(filter, query);
        this.filterTranslation(filter, query);
        this.filterTranslationNumber(filter, query);
        this.filterTags(filter, query);
        this.filterLanguages(filter, query);
        this.filterLastTranslatedDate(filter, query);
        this.filterUnsynced(filter, query, user);

        return query;
    }

    private filterStarredOnly(filter: HistoryFilter, query: any): void {
        if (filter.starredOnly) {
            query.isStarred = true;
        }
    }

    private filterArchived(filter: HistoryFilter, query: any): void {
        if (!filter.includeArchived) {
            query.isArchived = false;
        }
    }

    private filterWord(filter: HistoryFilter, query: any): void {
        if (!!filter.word) {
            query.sentence = new RegExp(_.escapeRegExp(filter.word));
        }
    }

    private filterTranslation(filter: HistoryFilter, query: any): void {
        if (!!filter.translation) {
            query["translateResult.sentence.translation"] = new RegExp(_.escapeRegExp(filter.translation));
        }
    }

    private filterTranslationNumber(filter: HistoryFilter, query: any): void {
        if (_.isNumber(filter.minTranslatedTime) || _.isNumber(filter.maxTranslatedTime)) {
            query.$and.push(...[
                { translationsNumber: { $gte: filter.minTranslatedTime || 0 } },
                { translationsNumber: { $lte: _.isNumber(filter.maxTranslatedTime) ? filter.maxTranslatedTime : Number.POSITIVE_INFINITY } }
            ]);
        }
    }

    private filterTags(filter: HistoryFilter, query: any): void {
        if (filter.tags.length > 0) {
            query.$and.push(...filter.tags.map(tag => ({ tags: { $elemMatch: tag } })));
        }
    }

    private filterLanguages(filter: HistoryFilter, query: any): void {
        if (!!filter.sourceLanguage) {
            query.sourceLanguage = filter.sourceLanguage;
        }

        if (!!filter.targetLanguage) {
            query.targetLanguage = filter.targetLanguage;
        }
    }

    private filterLastTranslatedDate(filter: HistoryFilter, query: any): void {
        if (!!filter.minLastTranslatedDate) {
            const minLastTranslatedDate = new Date(filter.minLastTranslatedDate);
            const minDate = new Date(minLastTranslatedDate.getFullYear(), minLastTranslatedDate.getMonth(), minLastTranslatedDate.getDate());
            query.$and.push(
                { lastTranslatedDate: { $gte: minDate.getTime() } },
            );
        }

        if (!!filter.maxLastTranslatedDate) {
            const maxLastTranslatedDate = new Date(filter.maxLastTranslatedDate);
            const maxDate = new Date(maxLastTranslatedDate.getFullYear(), maxLastTranslatedDate.getMonth(), maxLastTranslatedDate.getDate(), 24, 60, 60, 1000);
            query.$and.push(
                { lastTranslatedDate: { $lte: maxDate.getTime() } },
            );
        }
    }

    private filterUnsynced(filter: HistoryFilter, query: any, user: AccountInfo | null): void {
        if (!filter.unsyncedOnly) {
            return;
        }

        if (user === null) {
            return;
        }

        const isRecordSyncedWithServer = this.isRecordSyncedWithServer.bind(this);
        query.$where = function(this: HistoryRecord) {
            return !isRecordSyncedWithServer(this, user);
        };
    }

    private isRecordSyncedWithServer(record: HistoryRecord, user: AccountInfo | null): boolean {
        if (user === null) {
            return false;
        }

        const currentSyncData = (record.syncData || []).find(syncData => syncData.userEmail === user.email);
        if (!currentSyncData) {
            return false;
        }

        return currentSyncData.lastModifiedDate === record.lastModifiedDate;
    }
}