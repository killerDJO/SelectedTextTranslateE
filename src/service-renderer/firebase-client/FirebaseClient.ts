import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

import { MessageBus } from "common/renderer/MessageBus";

export class FirebaseClient {

    private readonly messageBus: MessageBus = new MessageBus();

    constructor() {
        this.initializeApp();
        this.setupSubscriptions();
    }

    private initializeApp(): void {
        firebase.initializeApp({
            apiKey: "AIzaSyAuHtBBH6VTFdX12AAOFiIa9xWl7AC2m0A",
            authDomain: "stte-cad70.firebaseapp.com",
            databaseURL: "https://stte-cad70.firebaseio.com",
            projectId: "stte-cad70",
            storageBucket: "stte-cad70.appspot.com",
            messagingSenderId: "584058673509"
        });
    }

    private setupSubscriptions(): void {
        this.messageBus.getNotification("test", () => this.test());
    }

    private test(): void {
        const firestore = firebase.firestore();

        const settings = { timestampsInSnapshots: true };
        firestore.settings(settings);

        firestore.collection("users")
            .add({
                first: "Ada1",
                last: "Lovelace1",
                born: 1815
            })
            .then(function(docRef: any) {
                console.log("Document written with ID: ", docRef.id);
            })
            .catch(function(error: any) {
                console.error("Error adding document: ", error);
            });
    }
}