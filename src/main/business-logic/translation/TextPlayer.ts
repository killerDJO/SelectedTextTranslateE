import { injectable } from "inversify";
import { Observable, bindNodeCallback, of } from "rxjs";
import { concatMap, map } from "rxjs/operators";
import * as path from "path";
import * as fs from "fs";
import { app } from "electron";

import { RequestProvider } from "data-access/RequestProvider";
import { HashProvider } from "business-logic/translation/HashProvider";
import { SettingsProvider } from "business-logic/settings/SettingsProvider";
import { Logger } from "infrastructure/Logger";

import * as nativeExtensions from "native/native-extensions.node";
import { NotificationSender } from "infrastructure/NotificationSender";

@injectable()
export class TextPlayer {

    private readonly tempFilePath: string;

    constructor(
        private readonly requestProvider: RequestProvider,
        private readonly hashProvider: HashProvider,
        private readonly settingsProvider: SettingsProvider,
        private readonly logger: Logger) {

        this.tempFilePath = path.resolve(app.getPath("temp"), "STT_audio.mp3");
    }

    public playText(text: string): Observable<void> {
        this.logger.info(`Playing text '${text}'`);
        return this.getAudioContent(text)
            .pipe(
                concatMap(content => this.saveContentToTempFile(content)),
                concatMap(() => this.playFile(text))
            );
    }

    private saveContentToTempFile(content: Buffer): Observable<void> {
        const writeFileAsObservable = bindNodeCallback((name: string, data: any, callback: (error: Error, result?: void) => void) => fs.writeFile(name, data, callback));
        return writeFileAsObservable(this.tempFilePath, content);
    }

    private playFile(text: string): Observable<void> {
        return new Observable<void>(observer => {
            const volume = this.settingsProvider.getSettings().value.engine.playVolume;
            nativeExtensions.playFile(this.tempFilePath, volume, error => {
                if (!!error) {
                    observer.error(new Error(error));
                } else {
                    this.logger.info(`End playing text '${text}'`);
                    observer.next();
                    observer.complete();
                }
            });
        });
    }

    private getAudioContent(text: string): Observable<Buffer> {
        const encodedText = encodeURIComponent(text);
        return this.hashProvider.computeHash(text).pipe(
            map(hash => `${this.settingsProvider.getSettings().value.engine.baseUrl}/translate_tts?tl=en&client=t&q=${encodedText}&tk=${hash}`),
            concatMap(url => this.requestProvider.getBinaryContent(url))
        );
    }
}