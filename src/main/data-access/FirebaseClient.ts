import { injectable } from "inversify";

import { MessageBus } from "infrastructure/MessageBus";
import { ServiceRendererProvider } from "infrastructure/ServiceRendererProvider";

@injectable()
export class FirebaseClient {
    private readonly messageBus: MessageBus;

    constructor(serviceRendererProvider: ServiceRendererProvider) {
        this.messageBus = new MessageBus(serviceRendererProvider.getServiceRenderer());
    }

    public test(): void {
        this.messageBus.sendNotification("test");
    }
}