import { MessageBus } from "common/renderer/MessageBus";
import { Messages } from "common/messaging/Messages";

export class Logger {
    private readonly messageBus: MessageBus = new MessageBus();

    public info(message: string) {
        this.messageBus.sendCommand(Messages.ServiceRenderer.LogInfo, message);
    }

    public warning(message: string) {
        this.messageBus.sendCommand(Messages.ServiceRenderer.LogWarning, message);
    }

    public error(message: string, error: Error) {
        this.messageBus.sendCommand(Messages.ServiceRenderer.LogWarning, { message, error });
    }
}