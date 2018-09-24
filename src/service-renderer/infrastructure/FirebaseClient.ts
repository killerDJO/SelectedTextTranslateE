import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import * as _ from "lodash";
import { FirebaseDocument } from "infrastructure/FirebaseDocument";

export class FirebaseClient {

    private get firestoreDocuments(): string {
        return "projects/stte-cad70/databases/(default)/documents";
    }

    private get firebaseBaseUrl(): string {
        return "https://firestore.googleapis.com/v1beta1";
    }

    public initializeApp(): Promise<firebase.auth.UserCredential> {
        firebase.initializeApp({
            apiKey: "AIzaSyAuHtBBH6VTFdX12AAOFiIa9xWl7AC2m0A",
            authDomain: "stte-cad70.firebaseapp.com",
            databaseURL: "https://stte-cad70.firebaseio.com",
            projectId: "stte-cad70"
        });

        this.setupFirestore();

        return firebase.auth().signInWithEmailAndPassword("killerDJO@gmail.com", "4815162342").catch(error => {
            throw new Error(`Firebase signIn error. Code: ${error.code}. Message: ${error.message}`);
        });
    }

    public addDocument(collectionId: string, recordId: string, record: any): Promise<string> {
        return this.addOrUpdateDocument(collectionId, recordId, record);
    }

    public updateDocument(collectionId: string, recordId: string, record: any, serverTimestamp: string): Promise<string> {
        return this.addOrUpdateDocument(collectionId, recordId, record, serverTimestamp);
    }

    public async addOrUpdateDocument(collectionId: string, recordId: string, record: any, serverTimestamp?: string): Promise<string> {
        const user = this.getCurrentUser();

        const fullRecordId = `${recordId}-${user.uid}`;
        const recordRef = `${this.firestoreDocuments}/${collectionId}/${fullRecordId}`;
        const currentDocument = !serverTimestamp
            ? { exists: false }
            : { updateTime: serverTimestamp };
        const payload = {
            writes: [
                {
                    update: {
                        name: recordRef,
                        fields: {
                            ...this.buildDocumentPayload(record),
                            user: {
                                stringValue: user.uid
                            }
                        }
                    },
                    currentDocument: currentDocument
                },
                {
                    transform: {
                        document: recordRef,
                        fieldTransforms: [
                            {
                                fieldPath: "timestamp",
                                setToServerValue: "REQUEST_TIME"
                            }
                        ]
                    }
                }
            ]
        };
        const response = await this.executeFirestoreCommand("commit", payload);
        const result = await response.json();
        const lastWriteResult = _.last<any>(result.writeResults);

        if (!lastWriteResult) {
            throw Error("Last write result is not available");
        }

        return lastWriteResult.updateTime;
    }

    public async getDocuments<TDocument extends FirebaseDocument>(collectionId: string, timestamp?: string): Promise<TDocument[]> {
        const user = this.getCurrentUser();
        const payload = {
            structuredQuery: {
                from: [
                    {
                        collectionId: collectionId
                    }
                ],
                where: {
                    compositeFilter: {
                        op: "AND",
                        filters: [
                            {
                                fieldFilter: {
                                    field: {
                                        fieldPath: "user"
                                    },
                                    op: "EQUAL",
                                    value: {
                                        stringValue: user.uid
                                    }
                                }
                            }
                        ]
                    }
                }
            }
        };

        const response = await this.executeFirestoreCommand("runQuery", payload);
        const result: any[] = await response.json();
        return result.map(document => this.parseDocument<TDocument>(document));
    }

    private async executeFirestoreCommand(command: "commit" | "runQuery", payload: any): Promise<Response> {
        const token = await this.getCurrentUser().getIdToken();
        const response = await fetch(`${this.firebaseBaseUrl}/${this.firestoreDocuments}:${command}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (response.status !== 200) {
            throw Error(`Error response from firestore. Status: ${response.status}`);
        }

        return response;
    }

    private getCurrentUser(): firebase.User {
        const user = firebase.auth().currentUser;
        if (!user) {
            throw Error("User is not available.");
        }
        return user;
    }

    private buildDocumentPayload(document: any): any {
        const payload: any = {};
        for (const key of Object.keys(document)) {
            const value = document[key];
            if (_.isString(value)) {
                payload[key] = {
                    stringValue: value
                };
            }
        }

        return payload;
    }

    private parseDocument<TResult extends FirebaseDocument>(document: any): TResult {
        const result: any = {
            timestamp: document.document.updateTime
        };

        const fields = document.document.fields;
        for (const key of Object.keys(fields)) {
            const value = fields[key];
            if (!!value.stringValue) {
                result[key] = value.stringValue;
            }
        }

        return result;
    }

    private setupFirestore() {
        const settings = { timestampsInSnapshots: true };
        firebase.firestore().settings(settings);
    }
}