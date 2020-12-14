import { injectable } from "inversify";
import { Observable, of, BehaviorSubject } from "rxjs";
import { concatMap, finalize, map, tap } from "rxjs/operators";

import { PlayTextRequest } from "common/dto/translation/PlayTextRequest";

import { Logger } from "infrastructure/Logger";
import { MessageBus } from "infrastructure/MessageBus";

import { RequestProvider } from "data-access/RequestProvider";
import { PlayAudioRequest } from "common/dto/translation/PlayAudioRequest";

import { SettingsProvider } from "business-logic/settings/SettingsProvider";
import { ServiceRendererProvider } from "infrastructure/ServiceRendererProvider";
import { Messages } from "common/messaging/Messages";

@injectable()
export class TextPlayer {

    private readonly messageBus: MessageBus;
    public isPlayInProgress$: BehaviorSubject<boolean> = new BehaviorSubject(false);

    constructor(
        private readonly requestProvider: RequestProvider,
        private readonly settingsProvider: SettingsProvider,
        private readonly logger: Logger,
        private readonly serviceRendererProvider: ServiceRendererProvider) {

        this.messageBus = new MessageBus(this.serviceRendererProvider.getServiceRenderer());
    }

    public playText(request: PlayTextRequest): Observable<void> {
        if (this.isPlayInProgress$.value) {
            return of(undefined);
        }

        this.isPlayInProgress$.next(true);
        const language = request.language || this.settingsProvider.getSettings().value.language.sourceLanguage;
        this.logger.info(`Playing ${this.getLogKey(request.text, language)}`);

        return this.getAudioContent(request.text, language)
            .pipe(
                concatMap(response => this.playFile(response)),
                tap(() => this.logger.info(`End playing ${this.getLogKey(request.text, language)}`)),
                finalize(() => this.isPlayInProgress$.next(false))
            );
    }

    private playFile(audio: string): Observable<void> {
        const volume = this.settingsProvider.getSettings().value.engine.playVolume;
        return this.messageBus.sendValue<PlayAudioRequest>(Messages.ServiceRenderer.PlayAudio, { audio: audio, volume: volume });
    }

    private getLogKey(text: string, language: string): string {
        return `text '${text}' with language ${language}`;
    }

    private getAudioContent(text: string, language: string): Observable<string> {
        const data = `[\\"${text}\\",\\"${language}\\",true,\\"null\\"]`;
        return this.requestProvider.executeGoogleTranslateRequest<string[]>("jQ1olc", data).pipe(
            map(response => response[0])
        );
    }
}