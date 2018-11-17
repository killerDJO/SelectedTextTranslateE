import { FirebaseDocument } from "infrastructure/FirebaseDocument";

export interface ServerHistoryRecord extends FirebaseDocument {
    readonly record: string;
}