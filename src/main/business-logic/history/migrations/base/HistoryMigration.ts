import * as Datastore from "nedb";
import { injectable } from "inversify";
import { Observable } from "rxjs";

@injectable()
export abstract class HistoryMigration {

    constructor(public readonly priority: number, public readonly name: string) {
    }

    public abstract migrate(datastore: Datastore): Observable<void>;
}