import { MessageBus } from "common/renderer/MessageBus";
import { Messages } from "common/messaging/Messages";
import { PlayFileRequest } from "common/dto/translation/PlayFileRequest";

import { Logger } from "infrastructure/Logger";

export class FilePlayer {
    private readonly messageBus: MessageBus = new MessageBus();
    private readonly logger: Logger = new Logger();

    constructor() {
        this.messageBus.observeValue<PlayFileRequest>(Messages.ServiceRenderer.PlayFile, filePath => this.playFile(filePath));
    }

    private playFile(request: PlayFileRequest): Promise<void> {
        const audio = new Audio(`${request.filePath}?noCache=${Math.floor(Math.random() * 1000000)}`);
        audio.volume = request.volume / 100;
        return audio.play().catch(error => this.logger.error("Unable to play audio file.", error));
    }
}