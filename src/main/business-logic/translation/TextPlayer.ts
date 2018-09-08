import { injectable } from "inversify";
import { Observable, bindNodeCallback, of } from "rxjs";
import { concatMap, map, tap } from "rxjs/operators";
import * as path from "path";
import * as fs from "fs";
import { app } from "electron";

import { RequestProvider } from "data-access/RequestProvider";
import { HashProvider } from "business-logic/translation/HashProvider";
import { SettingsProvider } from "business-logic/settings/SettingsProvider";
import { Logger } from "infrastructure/Logger";

import * as nativeExtensions from "native/native-extensions.node";
import { PlayTextRequest } from "common/dto/translation/PlayTextRequest";

@injectable()
export class TextPlayer {

    private readonly tempFilePath: string;
    private isPlayInProgress: boolean = false;

    constructor(
        private readonly requestProvider: RequestProvider,
        private readonly hashProvider: HashProvider,
        private readonly settingsProvider: SettingsProvider,
        private readonly logger: Logger) {

        this.tempFilePath = path.resolve(app.getPath("temp"), "STT_audio.mp3");
    }

    public playText(request: PlayTextRequest): Observable<void> {
        if (this.isPlayInProgress) {
            return of(undefined);
        }

        this.isPlayInProgress = true;
        const language = request.language || this.settingsProvider.getSettings().value.language.sourceLanguage;
        this.logger.info(`Playing ${this.getLogKey(request.text, language)}`);

        return this.getAudioContent(request.text, language)
            .pipe(
                concatMap(content => this.saveContentToTempFile(content)),
                concatMap(() => this.playFile()),
                tap(() => this.isPlayInProgress = false),
                tap(() => this.logger.info(`End playing ${this.getLogKey(request.text, language)}`))
            );
    }

    private saveContentToTempFile(content: Buffer): Observable<void> {
        const writeFileAsObservable = bindNodeCallback((name: string, data: any, callback: (error: Error, result?: void) => void) => fs.writeFile(name, data, callback));
        return writeFileAsObservable(this.tempFilePath, content);
    }

    private playFile(): Observable<void> {
        return new Observable<void>(observer => {
            const volume = this.settingsProvider.getSettings().value.engine.playVolume;
            nativeExtensions.playFile(this.tempFilePath, volume, error => {
                if (!!error) {
                    observer.error(new Error(error));
                } else {
                    observer.next();
                    observer.complete();
                }
            });
        });
    }

    private getLogKey(text: string, language: string): string {
        return `text '${text}' with language ${language}`;
    }

    private getAudioContent(text: string, language: string): Observable<Buffer> {
        const encodedText = encodeURIComponent(text);
        return this.hashProvider.computeHash(text).pipe(
            map(hash => `${this.settingsProvider.getSettings().value.engine.baseUrl}/translate_tts?tl=${language}&client=t&q=${encodedText}&tk=${hash}`),
            concatMap(url => this.requestProvider.getBinaryContent(url))
        );
    }
}