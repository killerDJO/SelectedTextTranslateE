import { injectable } from "inversify";
import { Observable } from "rxjs";
import * as path from "path";
import * as fs from "fs";
import { app } from "electron";
import { Decoder } from "lame";
import { Readable } from "stream";
import Speaker = require("speaker");

import { RequestProvider } from "data-access/RequestProvider";
import { HashProvider } from "./HashProvider";

@injectable()
export class TextPlayer {

    private readonly tempFilePath: string;

    constructor(
        private readonly requestProvider: RequestProvider,
        private readonly hashProvider: HashProvider) {

        this.tempFilePath = path.resolve(app.getPath("temp"), "STT_audio.mp3");
    }

    public playText(text: string): void {
        this.getAudioContent(text)
            .concatMap(content => this.saveContentToTempFile(content))
            .subscribe(() => this.playTempFile());
    }

    private saveContentToTempFile(content: Buffer): Observable<void> {
        const writeFileAsObservable = Observable.bindNodeCallback((name: string, data: any, callback: (error: Error, result?: void) => void) => fs.writeFile(name, data, callback));
        return writeFileAsObservable(this.tempFilePath, content);
    }

    private getAudioContent(text: string): Observable<Buffer> {
        const encodedText = encodeURIComponent(text);
        return this.hashProvider.computeHash(text)
            .map(hash => `https://translate.google.com/translate_tts?tl=en&client=t&q=${text}&tk=${hash}`)
            .concatMap(url => this.requestProvider.getBinaryContent(url));
    }

    private playTempFile(): void {
        fs.createReadStream(this.tempFilePath)
            .pipe(new Decoder())
            .on("format", function(this: Readable, format: any) {
                this.pipe(new Speaker(format));
            });
    }
}