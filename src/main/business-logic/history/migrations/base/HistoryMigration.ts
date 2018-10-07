import * as Datastore from "nedb";
import { injectable } from "inversify";
import { Observable } from "rxjs";

@injectable()
export abstract class HistoryMigration {
    protected _priority: number = 0;

    public get priority(): number {
        return this._priority;
    }

    public abstract migrate(datastore: Datastore): Observable<void>;
}