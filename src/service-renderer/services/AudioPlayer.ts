import { MessageBus } from "common/renderer/MessageBus";
import { Messages } from "common/messaging/Messages";
import { PlayAudioRequest } from "common/dto/translation/PlayAudioRequest";

import { Logger } from "infrastructure/Logger";

export class AudioPlayer {
    private readonly messageBus: MessageBus = new MessageBus();
    private readonly logger: Logger = new Logger();

    constructor() {
        this.messageBus.observeValue<PlayAudioRequest>(Messages.ServiceRenderer.PlayAudio, filePath => this.playFile(filePath));
    }

    private playFile(request: PlayAudioRequest): Promise<void> {
        const audio = new Audio(`data:audio/mpeg;base64,${request.audio}`);
        audio.volume = request.volume / 100;
        return audio.play().catch(error => this.logger.error("Unable to play audio file.", error));
    }
}