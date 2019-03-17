import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

import { FirebaseSettings } from "common/dto/settings/FirebaseSettings";
import { SignInResponse, SignInResponseValidationCode } from "common/dto/history/account/SignInResponse";
import { SignUpResponse, SignUpResponseValidationCode } from "common/dto/history/account/SignUpResponse";
import { SendResetTokenResponse, SendResetTokenResponseValidationCode } from "common/dto/history/account/SendResetTokenResponse";
import { PasswordResetResponse, PasswordResetResponseValidationCode } from "common/dto/history/account/PasswordResetResponse";
import { VerifyResetTokenResponse, VerifyResetTokenResponseValidationCode } from "common/dto/history/account/VerifyResetTokenResponse";
import { PasswordChangeResponse, PasswordChangeResponseValidationCode } from "common/dto/history/account/PasswordChangeResponse";
import { AuthResponse } from "common/dto/history/account/AuthResponse";
import { AccountInfo } from "common/dto/history/account/AccountInfo";

import { FirestoreRestClient } from "infrastructure/FirestoreRestClient";
import { FirebaseDocument } from "infrastructure/FirebaseDocument";

export class FirebaseClient {

    private firestoreRestClient: FirestoreRestClient | null = null;

    public initializeApp(firebaseSettings: FirebaseSettings): void {
        this.firestoreRestClient = new FirestoreRestClient(firebaseSettings.projectId);

        firebase.initializeApp({
            apiKey: firebaseSettings.apiKey,
            authDomain: firebaseSettings.authDomain,
            projectId: firebaseSettings.projectId
        });

        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
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

    public sendPasswordResetToken(email: string): Promise<SendResetTokenResponse> {
        return this.handleAuthResponse<SendResetTokenResponseValidationCode>(firebase.auth().sendPasswordResetEmail(email), this.mapSendResetTokenValidationCodes);
    }

    public verifyPasswordResetToken(token: string): Promise<VerifyResetTokenResponse> {
        return this.handleAuthResponse<VerifyResetTokenResponseValidationCode>(firebase.auth().verifyPasswordResetCode(token), this.mapVerifyResetTokenValidationCodes);
    }

    public confirmPasswordReset(token: string, password: string): Promise<PasswordResetResponse> {
        return this.handleAuthResponse<PasswordResetResponseValidationCode>(firebase.auth().confirmPasswordReset(token, password), this.mapPasswordResetValidationCodes);
    }

    public async changePassword(oldPassword: string, newPassword: string): Promise<PasswordChangeResponse> {
        const currentUser = this.getCurrentUser();

        const credentials = firebase.auth.EmailAuthProvider.credential(currentUser.email as string, oldPassword);
        try {
            await currentUser.reauthenticateAndRetrieveDataWithCredential(credentials);
        } catch (error) {

            if (error.code === "auth/wrong-password") {
                return {
                    isSuccessful: false,
                    validationCode: PasswordChangeResponseValidationCode.WrongPassword
                };
            }

            throw new Error("Unable to change password because current user is not found");
        }

        return this.handleAuthResponse<PasswordChangeResponseValidationCode>(currentUser.updatePassword(newPassword), this.mapPasswordChangeValidationCodes);
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

    private handleAuthResponse<TValidationCode>(response: Promise<any>, errorCodeMapper: (errorCode: string) => TValidationCode): Promise<AuthResponse<TValidationCode>> {
        return response
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
            "auth/user-not-found": SignInResponseValidationCode.UserNotFound,
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

    private mapSendResetTokenValidationCodes(code: string): SendResetTokenResponseValidationCode {
        const responsesMap: { [key: string]: SendResetTokenResponseValidationCode } = {
            "auth/invalid-email": SendResetTokenResponseValidationCode.InvalidEmail,
            "auth/user-not-found": SendResetTokenResponseValidationCode.UserNotFound,
            "auth/too-many-requests": SendResetTokenResponseValidationCode.TooManyRequests
        };

        return responsesMap[code];
    }

    private mapPasswordResetValidationCodes(code: string): PasswordResetResponseValidationCode {
        const responsesMap: { [key: string]: PasswordResetResponseValidationCode } = {
            "auth/expired-action-code": PasswordResetResponseValidationCode.ExpiredActionCode,
            "auth/invalid-action-code": PasswordResetResponseValidationCode.InvalidActionCode,
            "auth/weak-password": PasswordResetResponseValidationCode.WeakPassword
        };

        return responsesMap[code];
    }

    private mapPasswordChangeValidationCodes(code: string): PasswordChangeResponseValidationCode {
        const responsesMap: { [key: string]: PasswordChangeResponseValidationCode } = {
            "auth/weak-password": PasswordChangeResponseValidationCode.WeakPassword
        };

        return responsesMap[code];
    }

    private mapVerifyResetTokenValidationCodes(code: string): VerifyResetTokenResponseValidationCode {
        const responsesMap: { [key: string]: VerifyResetTokenResponseValidationCode } = {
            "auth/expired-action-code": VerifyResetTokenResponseValidationCode.ExpiredToken,
            "auth/invalid-action-code": VerifyResetTokenResponseValidationCode.InvalidToken
        };

        return responsesMap[code];
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