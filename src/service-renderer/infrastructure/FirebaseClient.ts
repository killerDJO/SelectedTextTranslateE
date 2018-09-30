import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

import { FirebaseSettings } from "common/dto/settings/FirebaseSettings";

import { FirestoreRestClient } from "infrastructure/FirestoreRestClient";
import { FirebaseDocument } from "infrastructure/FirebaseDocument";

export class FirebaseClient {

    private firestoreRestClient: FirestoreRestClient | null = null;

    public initializeApp(firebaseSettings: FirebaseSettings, email: string, password: string): Promise<firebase.auth.UserCredential> {
        this.firestoreRestClient = new FirestoreRestClient(firebaseSettings.firestoreBaseUrl, firebaseSettings.projectId);

        firebase.initializeApp({
            apiKey: firebaseSettings.apiKey,
            authDomain: firebaseSettings.authDomain,
            projectId: firebaseSettings.projectId
        });

        this.setupFirestore();

        return firebase.auth().signInWithEmailAndPassword(email, password).catch(error => {
            throw new Error(`Firebase signIn error. Code: ${error.code}. Message: ${error.message}`);
        });
    }

    public addDocument(collectionId: string, documentId: string, document: any): Promise<string> {
        return this.getFirestoreRestClient().addDocument(this.getCurrentUser(), collectionId, documentId, document);
    }

    public updateDocument(collectionId: string, documentId: string, document: any, serverTimestamp: string): Promise<string> {
        return this.getFirestoreRestClient().updateDocument(this.getCurrentUser(), collectionId, documentId, document, serverTimestamp);
    }

    public async getDocuments<TDocument extends FirebaseDocument>(collectionId: string, timestamp?: string): Promise<TDocument[]> {
        return this.getFirestoreRestClient().getDocuments<TDocument>(this.getCurrentUser(), collectionId, timestamp);
    }

    private setupFirestore() {
        const settings = { timestampsInSnapshots: true };
        firebase.firestore().settings(settings);
    }

    private getCurrentUser(): firebase.User {
        const user = firebase.auth().currentUser;
        if (!user) {
            throw Error("User is not available.");
        }
        return user;
    }

    private getFirestoreRestClient(): FirestoreRestClient {
        if (this.firestoreRestClient === null) {
            throw Error("Firebase client is not fully initialized");
        }

        return this.firestoreRestClient;
    }
}