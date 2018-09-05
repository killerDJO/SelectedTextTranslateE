
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

    public insert<TDocument>(datastore: Datastore, document: TDocument): Observable<TDocument> {
        return new Observable<TDocument>(observer => {
            datastore.insert(document, (error) => {
                this.handleError(error);
                observer.next(document);
                observer.complete();
            });
        });
    }

    public update<TDocument>(datastore: Datastore, query: any, updateQuery: any): Observable<TDocument> {
        return new Observable<TDocument>(observer => {
            datastore.update(query, updateQuery, { multi: false, returnUpdatedDocs: true }, (error: Error, _: number, affectedDocument: any) => {
                this.handleError(error);
                observer.next(affectedDocument);
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