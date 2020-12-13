import { injectable } from "inversify";
import { Observable, bindNodeCallback, of, BehaviorSubject } from "rxjs";
import { concatMap, map, tap } from "rxjs/operators";
import * as path from "path";
import * as fs from "fs";
import { app } from "electron";

import { PlayTextRequest } from "common/dto/translation/PlayTextRequest";

import { Logger } from "infrastructure/Logger";
import { MessageBus } from "infrastructure/MessageBus";
import { replaceAllPattern } from "utils/replace-pattern";

import { RequestProvider } from "data-access/RequestProvider";
import { PlayFileRequest } from "common/dto/translation/PlayFileRequest";

import { SettingsProvider } from "business-logic/settings/SettingsProvider";
import { ServiceRendererProvider } from "infrastructure/ServiceRendererProvider";
import { Messages } from "common/messaging/Messages";

@injectable()
export class TextPlayer {

    private readonly tempFilePath: string;
    private readonly messageBus: MessageBus;
    public isPlayInProgress$: BehaviorSubject<boolean> = new BehaviorSubject(false);

    constructor(
        private readonly requestProvider: RequestProvider,
        private readonly settingsProvider: SettingsProvider,
        private readonly logger: Logger,
        private readonly serviceRendererProvider: ServiceRendererProvider) {

        this.tempFilePath = path.resolve(app.getPath("temp"), "STT_audio.mp3");
        this.messageBus = new MessageBus(this.serviceRendererProvider.getServiceRenderer());
    }

    public playText(request: PlayTextRequest): Observable<void> {
        if (this.isPlayInProgress$.value) {
            return of(undefined);
        }

        return of(undefined);

        // this.isPlayInProgress$.next(true);
        // const language = request.language || this.settingsProvider.getSettings().value.language.sourceLanguage;
        // this.logger.info(`Playing ${this.getLogKey(request.text, language)}`);

        // return this.getAudioContent(request.text, language)
        //     .pipe(
        //         concatMap(content => this.saveContentToTempFile(content)),
        //         concatMap(() => this.playFile()),
        //         tap(() => this.logger.info(`End playing ${this.getLogKey(request.text, language)}`)),
        //     );
    }

    private saveContentToTempFile(content: Buffer): Observable<void> {
        const writeFileAsObservable = bindNodeCallback((name: string, data: any, callback: (error: Error, result?: void) => void) => fs.writeFile(name, data, callback));
        return writeFileAsObservable(this.tempFilePath, content);
    }

    private playFile(): Observable<void> {
        const volume = this.settingsProvider.getSettings().value.engine.playVolume;
        return this.messageBus.sendValue<PlayFileRequest>(Messages.ServiceRenderer.PlayFile, { filePath: this.tempFilePath, volume: volume }).pipe(
            tap(() => this.isPlayInProgress$.next(false))
        );
    }

    private getLogKey(text: string, language: string): string {
        return `text '${text}' with language ${language}`;
    }

    // private getAudioContent(text: string, language: string): Observable<Buffer> {
    //     return this.hashProvider.computeHash(text).pipe(
    //         map(hash => this.buildUrl(text, language, hash)),
    //         concatMap(url => this.requestProvider.getBinaryContent(url))
    //     );
    // }

    // private buildUrl(text: string, language: string, hash: string) {
    //     const urlPattern = this.settingsProvider.getSettings().value.engine.playTextPattern;
    //     return replaceAllPattern(urlPattern, {
    //         language: language,
    //         query: encodeURIComponent(text),
    //         hash: hash
    //     });
    // }
}