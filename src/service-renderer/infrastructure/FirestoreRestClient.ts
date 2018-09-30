import * as firebase from "firebase/app";
import * as _ from "lodash";

import { FirebaseDocument } from "infrastructure/FirebaseDocument";

export class FirestoreRestClient {
    private readonly firestoreDocuments: string;
    private readonly firestoreBaseUrl: string;

    constructor(firestoreBaseUrl: string, projectId: string) {
        this.firestoreBaseUrl = firestoreBaseUrl;
        this.firestoreDocuments = `projects/${projectId}/databases/(default)/documents`;
    }

    public addDocument(user: firebase.User, collectionId: string, documentId: string, document: any): Promise<string> {
        return this.addOrUpdateDocument(user, collectionId, documentId, document);
    }

    public updateDocument(user: firebase.User, collectionId: string, documentId: string, document: any, serverTimestamp: string): Promise<string> {
        return this.addOrUpdateDocument(user, collectionId, documentId, document, serverTimestamp);
    }

    public async getDocuments<TDocument extends FirebaseDocument>(user: firebase.User, collectionId: string, timestamp?: string): Promise<TDocument[]> {
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

        const response = await this.executeFirestoreCommand(user, "runQuery", payload);
        const result: any[] = await response.json();
        return result.map(document => this.parseDocument<TDocument>(document));
    }

    private async addOrUpdateDocument(user: firebase.User, collectionId: string, documentId: string, document: any, serverTimestamp?: string): Promise<string> {
        const fullRecordId = `${documentId}-${user.uid}`;
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
                            ...this.buildDocumentPayload(document),
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
        const response = await this.executeFirestoreCommand(user, "commit", payload);
        const result = await response.json();
        const lastWriteResult = _.last<any>(result.writeResults);

        if (!lastWriteResult) {
            throw Error("Last write result is not available");
        }

        return lastWriteResult.updateTime;
    }

    private async executeFirestoreCommand(user: firebase.User, command: "commit" | "runQuery", payload: any): Promise<Response> {
        const token = await user.getIdToken();
        const response = await fetch(`${this.firestoreBaseUrl}/${this.firestoreDocuments}:${command}`, {
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
}