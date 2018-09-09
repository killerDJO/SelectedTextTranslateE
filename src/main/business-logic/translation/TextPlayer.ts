import { injectable } from "inversify";
import { Observable, bindNodeCallback, of, BehaviorSubject } from "rxjs";
import { concatMap, map, tap } from "rxjs/operators";
import * as path from "path";
import * as fs from "fs";
import { app } from "electron";

import { PlayTextRequest } from "common/dto/translation/PlayTextRequest";

import { Logger } from "infrastructure/Logger";
import { replaceAllPattern } from "utils/replace-pattern";

import { RequestProvider } from "data-access/RequestProvider";
import * as nativeExtensions from "native/native-extensions.node";

import { HashProvider } from "business-logic/translation/HashProvider";
import { SettingsProvider } from "business-logic/settings/SettingsProvider";

@injectable()
export class TextPlayer {

    private readonly tempFilePath: string;
    public isPlayInProgress$: BehaviorSubject<boolean> = new BehaviorSubject(false);

    constructor(
        private readonly requestProvider: RequestProvider,
        private readonly hashProvider: HashProvider,
        private readonly settingsProvider: SettingsProvider,
        private readonly logger: Logger) {

        this.tempFilePath = path.resolve(app.getPath("temp"), "STT_audio.mp3");
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
                concatMap(content => this.saveContentToTempFile(content)),
                concatMap(() => this.playFile()),
                tap(() => this.logger.info(`End playing ${this.getLogKey(request.text, language)}`)),
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
                this.isPlayInProgress$.next(false);
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
        return this.hashProvider.computeHash(text).pipe(
            map(hash => this.buildUrl(text, language, hash)),
            concatMap(url => this.requestProvider.getBinaryContent(url))
        );
    }

    private buildUrl(text: string, language: string, hash: string) {
        const urlPattern = this.settingsProvider.getSettings().value.engine.playTextPattern;
        return replaceAllPattern(urlPattern, {
            language: language,
            query: encodeURIComponent(text),
            hash: hash
        });
    }
}