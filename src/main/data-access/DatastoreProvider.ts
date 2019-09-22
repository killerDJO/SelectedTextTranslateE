
import { Observable, AsyncSubject } from "rxjs";
import { concatMap } from "rxjs/operators";
import { injectable } from "inversify";
import * as Datastore from "nedb";
import * as path from "path";

import { StorageFolderProvider } from "infrastructure/StorageFolderProvider";
import { Logger } from "infrastructure/Logger";

@injectable()
export class DatastoreProvider {

    constructor(private readonly storageFolderProvider: StorageFolderProvider, private readonly logger: Logger) {
    }

    public getDatabaseFilename(name: string): string {
        return path.join(this.storageFolderProvider.getPath(), name);
    }

    public openDatabase(name: string): AsyncSubject<Datastore> {
        const datastore$: AsyncSubject<Datastore> = new AsyncSubject();

        this.loadDatastore(name).then(datastore => {
            datastore$.next(datastore);
            datastore$.complete();
        });

        return datastore$;
    }

    public ensureUniqueIndex<TDocument>(datastore: Datastore, fieldName: keyof TDocument): Observable<void> {
        return new Observable<void>(observer => {
            datastore.ensureIndex({ fieldName: fieldName as string }, error => {
                this.handleError(error);
                observer.complete();
            });
        });
    }

    public insert<TDocument>(datastore$: Observable<Datastore>, document: TDocument): Observable<TDocument> {
        return this.runOnDatastore(datastore$, datastore => {
            return new Observable<TDocument>(observer => {
                datastore.insert(document, (error, insertedDocument) => {
                    this.handleError(error);
                    observer.next(insertedDocument);
                    observer.complete();
                });
            });
        });
    }

    public update<TDocument>(datastore$: Observable<Datastore>, query: any, updateQuery: any): Observable<TDocument> {
        return this.runOnDatastore(datastore$, datastore => {
            return new Observable<TDocument>(observer => {
                datastore.update(query, updateQuery, { multi: false, returnUpdatedDocs: true }, (error: Error, _: number, affectedDocument: any) => {
                    this.handleError(error);
                    observer.next(affectedDocument);
                    observer.complete();
                });
            });
        });
    }

    public find<TResult>(datastore$: Observable<Datastore>, query: any, sortQuery: any = {}): Observable<TResult[]> {
        return this.runOnDatastore(datastore$, datastore => {
            return new Observable<TResult[]>(observer => {
                datastore.find<TResult>(query).sort(sortQuery).exec((error, records) => {
                    this.handleError(error);
                    observer.next(records);
                    observer.complete();
                });
            });
        });
    }

    public remove<TDocument>(datastore$: Observable<Datastore>, record: TDocument): Observable<void> {
        return this.runOnDatastore(datastore$, datastore => {
            return new Observable<void>(observer => {
                datastore.remove({ _id: (record as any)._id }, (error) => {
                    this.handleError(error);
                    observer.next();
                    observer.complete();
                });
            });
        });
    }

    public count(datastore$: Observable<Datastore>, query: any): Observable<number> {
        return this.runOnDatastore(datastore$, datastore => {
            return new Observable<number>(observer => {
                datastore.count(query, (error, count) => {
                    this.handleError(error);
                    observer.next(count);
                    observer.complete();
                });
            });
        });
    }

    public findPaged<TResult>(datastore$: Observable<Datastore>, query: any, sortQuery: any, pageNumber: number, pageSize: number): Observable<TResult[]> {
        return this.runOnDatastore(datastore$, datastore => {
            return new Observable<TResult[]>(observer => {
                datastore.find<TResult>(query).sort(sortQuery).skip((pageNumber - 1) * pageSize).limit(pageSize).exec((error, records) => {
                    this.handleError(error);
                    observer.next(records);
                    observer.complete();
                });
            });
        });
    }

    private runOnDatastore<TDocument>(datastore$: Observable<Datastore>, callback: (datastore: Datastore) => Observable<TDocument>): Observable<TDocument> {
        return datastore$.pipe(concatMap(callback));
    }

    private handleError(error: Error | null): void {
        if (!!error) {
            throw error;
        }
    }

    private async loadDatastore(name: string): Promise<Datastore> {
        const MAX_LOAD_ATTEMPTS = 3;
        const loadAttempt = 1;
        while (loadAttempt <= MAX_LOAD_ATTEMPTS) {
            try {
                this.logger.info(`Opening database ${name}. Attempt #${loadAttempt}.`);
                return new Datastore({
                    filename: this.getDatabaseFilename(name),
                    autoload: true
                });
            } catch (error) {
                this.logger.error(`Failed to open database ${name}.`, error);
            }

            const MILLISECONDS_IN_SECOND = 1000;
            await new Promise(done => setTimeout(done, loadAttempt * MILLISECONDS_IN_SECOND));
        }

        throw new Error(`Error opening ${name} database.`);
    }
}