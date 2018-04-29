import { Database } from "sqlite3";
import { Data } from "electron";
import { Observable } from "rxjs";
import { injectable } from "inversify";

@injectable()
export class SqLiteProvider {

    public openDatabase(name: string): Observable<Database> {
        const database$ = new Observable<Database>(observer => {
            const database = new Database(name, (error: Error | null) => {
                this.handleError(error);
                observer.next(database);
                observer.complete();
            });
        });

        return database$
            .concatMap(database => this.executeNonQuery(database, "PRAGMA synchronous = OFF"), database => database)
            .concatMap(database => this.executeNonQuery(database, "PRAGMA journal_mode = MEMORY"), database => database);
    }

    public executeNonQuery(database: Database, query: string, params?: any): Observable<void> {
        return new Observable<void>(observer => {
            database.run(query, params, (error: Error | null) => {
                this.handleError(error);
                observer.next();
                observer.complete();
            });
        });
    }

    public executeReader(database: Database, query: string, params?: any): Observable<any[]> {
        return new Observable<any[]>(observer => {
            database.all(query, params, (error: Error | null, rows: any[]) => {
                this.handleError(error);
                observer.next(rows);
                observer.complete();
            });
        });
    }

    private handleError(error: Error | null): void {
        if (error !== null) {
            throw error;
        }
    }
}