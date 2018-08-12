
import { Observable } from "rxjs";
import { injectable } from "inversify";
import * as Datastore from "nedb";
import * as path from "path";

import { StorageFolderProvider } from "infrastructure/StorageFolderProvider";

@injectable()
export class DatastoreProvider {

    constructor(private readonly storageFolderProvider: StorageFolderProvider) {
    }

    public openDatabase(name: string): Datastore {
        return new Datastore({
            filename: path.join(this.storageFolderProvider.getPath(), name),
            autoload: true
        });
    }

    public insert<TDocument>(datastore: Datastore, document: TDocument): Observable<void> {
        return new Observable<void>(observer => {
            datastore.insert(document, (error) => {
                this.handleError(error);
                observer.next();
                observer.complete();
            });
        });
    }

    public update(datastore: Datastore, query: any, updateQuery: any): Observable<void> {
        return new Observable<void>(observer => {
            datastore.update(query, updateQuery, {}, (error) => {
                this.handleError(error);
                observer.next();
                observer.complete();
            });
        });
    }

    public find<TResult>(datastore: Datastore, query: any): Observable<TResult[]> {
        return new Observable<TResult[]>(observer => {
            datastore.find<TResult>(query, (error, records) => {
                this.handleError(error);
                observer.next(records);
                observer.complete();
            });
        });
    }

    public findPaged<TResult>(datastore: Datastore, query: any, sortQuery: any, limit: number): Observable<TResult[]> {
        return new Observable<TResult[]>(observer => {
            datastore.find<TResult>(query).sort(sortQuery).limit(limit).exec((error, records) => {
                this.handleError(error);
                observer.next(records);
                observer.complete();
            });
        });
    }

    private handleError(error: Error | null): void {
        if (!!error) {
            throw error;
        }
    }
}