import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

import { FirebaseSettings } from "common/dto/settings/FirebaseSettings";
import { SignInResponse, SignInResponseValidationCode } from "common/dto/history/account/SignInResponse";
import { SignUpResponse, SignUpResponseValidationCode } from "common/dto/history/account/SignUpResponse";
import { SignResponse } from "common/dto/history/account/SignResponse";
import { AccountInfo } from "common/dto/history/account/AccountInfo";

import { FirestoreRestClient } from "infrastructure/FirestoreRestClient";
import { FirebaseDocument } from "infrastructure/FirebaseDocument";

export class FirebaseClient {

    private firestoreRestClient: FirestoreRestClient | null = null;

    public initializeApp(firebaseSettings: FirebaseSettings): void {
        this.firestoreRestClient = new FirestoreRestClient(firebaseSettings.firestoreBaseUrl, firebaseSettings.projectId);

        firebase.initializeApp({
            apiKey: firebaseSettings.apiKey,
            authDomain: firebaseSettings.authDomain,
            projectId: firebaseSettings.projectId
        });

        this.setupFirestore();
    }

    public signIn(email: string, password: string): Promise<SignInResponse> {
        return this.handleAuthResponse<SignInResponseValidationCode>(firebase.auth().signInWithEmailAndPassword(email, password), this.mapSignInValidationCodes);
    }

    public signUp(email: string, password: string): Promise<SignUpResponse> {
        return this.handleAuthResponse<SignUpResponseValidationCode>(firebase.auth().createUserWithEmailAndPassword(email, password), this.mapSignUpValidationCodes);
    }

    public signOut(): Promise<void> {
        return firebase.auth().signOut();
    }

    public getAccountInfo(): AccountInfo | null {
        const user = firebase.auth().currentUser;
        if (user === null || !user.email) {
            return null;
        }

        return {
            email: user.email.toLowerCase()
        };
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

    private handleAuthResponse<TValidationCode>(credentials: Promise<firebase.auth.UserCredential>, errorCodeMapper: (errorCode: string) => TValidationCode): Promise<SignResponse<TValidationCode>> {
        return credentials
            .then(
                () => ({ isSuccessful: true }),
                error => ({
                    isSuccessful: false,
                    validationCode: errorCodeMapper(error.code)
                })
            );
    }

    private mapSignInValidationCodes(code: string): SignInResponseValidationCode {
        const responsesMap: { [key: string]: SignInResponseValidationCode } = {
            "auth/invalid-email": SignInResponseValidationCode.InvalidEmail,
            "auth/user-not-found": SignInResponseValidationCode.NotRegisteredEmail,
            "auth/wrong-password": SignInResponseValidationCode.InvalidPassword
        };

        return responsesMap[code];
    }

    private mapSignUpValidationCodes(code: string): SignUpResponseValidationCode {
        const responsesMap: { [key: string]: SignUpResponseValidationCode } = {
            "auth/invalid-email": SignUpResponseValidationCode.InvalidEmail,
            "auth/weak-password": SignUpResponseValidationCode.WeakPassword,
            "auth/email-already-in-use": SignUpResponseValidationCode.EmailAlreadyInUse
        };

        return responsesMap[code];
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