import { Observable } from "rxjs";
import { map, concatMap } from "rxjs/operators";
import * as Datastore from "nedb";
import * as _ from "lodash";
import { injectable } from "inversify";

import { HistoryRecordsResponse } from "common/dto/history/HistoryRecordsResponse";
import { SortColumn } from "common/dto/history/SortColumn";
import { SortOrder } from "common/dto/history/SortOrder";
import { HistoryRecordsRequest } from "common/dto/history/HistoryRecordsRequest";
import { HistoryFilter } from "common/dto/history/HistoryFilter";
import { HistoryRecord } from "common/dto/history/HistoryRecord";

import { DatastoreProvider } from "data-access/DatastoreProvider";
import { HistoryDatabaseProvider } from "business-logic/history/persistence/HistoryDatabaseProvider";

@injectable()
export class HistoryQuery {
    private readonly datastore$: Observable<Datastore>;

    constructor(
        private readonly datastoreProvider: DatastoreProvider,
        private readonly historyDatabaseProvider: HistoryDatabaseProvider) {

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

        const searchQuery: any = this.buildFilterQuery(request.filter);
        const count$ = this.datastoreProvider.count(this.datastore$, searchQuery);

        return this.datastoreProvider
            .findPaged<HistoryRecord>(this.datastore$, searchQuery, sortQuery, request.pageNumber, request.pageSize).pipe(
                concatMap(historyRecords => count$.pipe(map(count => {
                    return {
                        records: historyRecords,
                        pageNumber: request.pageNumber,
                        pageSize: request.pageSize,
                        totalRecords: count
                    };
                })))
            );
    }

    private buildFilterQuery(filter: HistoryFilter): any {
        const query: any = { $and: [] };

        if (filter.starredOnly) {
            query.isStarred = true;
        }

        if (!filter.includeArchived) {
            query.isArchived = false;
        }

        if (!!filter.word) {
            query.sentence = new RegExp(_.escapeRegExp(filter.word));
        }

        if (!!filter.translation) {
            query["translateResult.sentence.translation"] = new RegExp(_.escapeRegExp(filter.translation));
        }

        if (_.isNumber(filter.minTranslatedTime) || _.isNumber(filter.maxTranslatedTime)) {
            query.$and.push(...[
                { translationsNumber: { $gte: filter.minTranslatedTime || 0 } },
                { translationsNumber: { $lte: _.isNumber(filter.maxTranslatedTime) ? filter.maxTranslatedTime : Number.POSITIVE_INFINITY } }
            ]);
        }

        if (filter.tags.length > 0) {
            query.$and.push(...filter.tags.map(tag => ({ tags: { $elemMatch: tag } })));
        }

        if (!!filter.sourceLanguage) {
            query.sourceLanguage = filter.sourceLanguage;
        }

        if (!!filter.targetLanguage) {
            query.targetLanguage = filter.targetLanguage;
        }

        return query;
    }
}