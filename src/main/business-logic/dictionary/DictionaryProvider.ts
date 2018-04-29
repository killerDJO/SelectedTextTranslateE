import { ReplaySubject, Observable, AsyncSubject } from "rxjs";
import { Database } from "sqlite3";
import * as path from "path";
import { injectable } from "inversify";

import { TranslateResult } from "common/dto/translation/TranslateResult";
import { Logger } from "infrastructure/Logger";
import { DictionaryRecord } from "./dto/DictionaryRecord";
import { StorageFolderProvider } from "infrastructure/StorageFolderProvider";
import { SqLiteProvider } from "data-access/SqLiteProvider";

@injectable()
export class DictionaryProvider {

    private readonly database$: AsyncSubject<Database> = new AsyncSubject();

    constructor(
        private readonly sqLiteProvider: SqLiteProvider,
        private readonly storageFolderProvider: StorageFolderProvider,
        private readonly logger: Logger) {
        this.createDatabase().subscribe(this.database$);
    }

    public addTranslateResult(translateResult: TranslateResult, isForcedTranslation: boolean): Observable<void> {
        const currentTime = new Date().getTime();
        return this.executeNonQuery(
            "INSERT INTO Dictionary(Sentence, Count, Json, IsForcedTranslation, CreatedDate, UpdatedDate, IsActive) VALUES($Sentence, 0, $Json, $IsForcedTranslation, $CreatedDate, $UpdatedDate, 1)",
            {
                $Sentence: translateResult.sentence.input,
                $Json: JSON.stringify(translateResult),
                $IsForcedTranslation: isForcedTranslation ? 1 : 0,
                $CreatedDate: currentTime,
                $UpdatedDate: currentTime
            })
            .do(() => this.logger.info(`Translation for "${translateResult.sentence.input}" when forced translation is set to "${isForcedTranslation}" is saved to dictionary.`));
    }

    public updateTranslateResult(translateResult: TranslateResult, isForcedTranslation: boolean): Observable<void> {
        const currentTime = new Date().getTime();
        return this.executeNonQuery(
            "UPDATE Dictionary SET Json = $Json, UpdatedDate = $UpdatedDate WHERE Sentence = $Sentence AND IsForcedTranslation = $IsForcedTranslation",
            {
                $Sentence: translateResult.sentence.input,
                $Json: JSON.stringify(translateResult),
                $IsForcedTranslation: isForcedTranslation ? 1 : 0,
                $UpdatedDate: currentTime
            })
            .do(() => this.logger.info(`Translation for "${translateResult.sentence.input}" when forced translation is set to "${isForcedTranslation}" is updated in dictionary.`));
    }

    public incrementTranslationsNumber(translateResult: TranslateResult, isForcedTranslation: boolean): Observable<void> {
        return this.executeNonQuery(
            "UPDATE Dictionary SET Count = Count + 1 WHERE Sentence = $Sentence AND IsForcedTranslation = $IsForcedTranslation",
            {
                $Sentence: translateResult.sentence.input,
                $IsForcedTranslation: isForcedTranslation ? 1 : 0
            })
            .do(() => this.logger.info(`Translations number for "${translateResult.sentence.input}" when forced translation is set to "${isForcedTranslation}" is incremented.`));
    }

    public getRecord(sentence: string, isForcedTranslation: boolean): Observable<DictionaryRecord | null> {
        return this
            .executeReader(
                "SELECT Sentence, Count, Json, IsForcedTranslation, CreatedDate, UpdatedDate FROM Dictionary WHERE Sentence=$Sentence AND IsForcedTranslation = $IsForcedTranslation",
                {
                    $Sentence: sentence,
                    $IsForcedTranslation: isForcedTranslation ? 1 : 0,
                })
            .map(result => !!result.length ? this.createDictionaryRecord(result[0]) : null);
    }

    private createDictionaryRecord(dbRecord: any): DictionaryRecord {
        return new DictionaryRecord(
            dbRecord.Sentence,
            dbRecord.IsForcedTranslation,
            JSON.parse(dbRecord.Json),
            dbRecord.Count,
            new Date(dbRecord.CreatedDate),
            new Date(dbRecord.UpdatedDate)
        );
    }

    private createDatabase(): Observable<Database> {
        const CreateDictionaryTableQuery =
            "CREATE TABLE IF NOT EXISTS Dictionary(Sentence TEXT, IsForcedTranslation BOOLEAN, Count INTEGER, Json TEXT, CreatedDate INTEGER, UpdatedDate INTEGER, IsActive BOOLEAN, PRIMARY KEY (Sentence, IsForcedTranslation))";
        const CreateDictionaryTableIndexQuery = "CREATE INDEX IF NOT EXISTS IX_Dictionary_Count on Dictionary(Count)";

        return this.sqLiteProvider
            .openDatabase(path.join(this.storageFolderProvider.getPath(), "dictionary.db"))
            .concatMap(database => this.sqLiteProvider.executeNonQuery(database, CreateDictionaryTableQuery), database => database)
            .concatMap(database => this.sqLiteProvider.executeNonQuery(database, CreateDictionaryTableIndexQuery), database => database)
            .single();
    }

    private executeNonQuery(query: string, params?: any): Observable<void> {
        return this.database$.concatMap(database => this.sqLiteProvider.executeNonQuery(database, query, params));
    }

    private executeReader(query: string, params?: any): Observable<any[]> {
        return this.database$.concatMap(database => this.sqLiteProvider.executeReader(database, query, params));
    }
}