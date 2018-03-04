import { Observable } from "rxjs";
import { injectable, inject } from "inversify";

import { TranslatePageParser } from "./TranslatePageParser";
import { RequestProvider } from "../../data-access/RequestProvider";
import { TranslationConfig } from "./dto/TranslationConfig";
import { HashProvider } from "./HashProvider";
import { TranslationResponseParser } from "./TranslationResponseParser";
import { DictionaryProvider } from "../dictionary/DictionaryProvider";
import { DictionaryRecord } from "../dictionary/dto/DictionaryRecord";
import { TranslateResult } from "common/dto/translation/TranslateResult";

@injectable()
export class TextTranslator {
    private readonly recordsCacheDays: number = 30;

    constructor(
        private readonly requestProvider: RequestProvider,
        private readonly hashProvider: HashProvider,
        private readonly dictionaryProvider: DictionaryProvider,
        private readonly responseParser: TranslationResponseParser) {
    }

    public translate(sentence: string, isForcedTranslation: boolean): Observable<TranslateResult | null> {
        const sanitizedSentence = this.sanitizeSentence(sentence);

        if (sanitizedSentence === "") {
            return Observable.of(null);
        }

        return this.dictionaryProvider.getRecord(sanitizedSentence, isForcedTranslation)
            .concatMap(dictionaryRecord => this.getTranslateResult(sentence, isForcedTranslation, dictionaryRecord))
            .do(translateResult => this.dictionaryProvider.incrementTranslationsNumber(translateResult, isForcedTranslation).publish().connect());
    }

    private getTranslateResult(sentence: string, isForcedTranslation: boolean, dictionaryRecord: DictionaryRecord | null): Observable<TranslateResult> {
        const translateResult$ = this.getResponseFromService(sentence, isForcedTranslation);

        if (dictionaryRecord === null) {
            return translateResult$
                .concatMap(translateResult => this.dictionaryProvider.addTranslateResult(translateResult, isForcedTranslation), translateResult => translateResult);
        }

        if (this.isDictionaryRecordExpired(dictionaryRecord)) {
            return translateResult$
                .concatMap(translateResult => this.dictionaryProvider.updateTranslateResult(translateResult, isForcedTranslation), translateResult => translateResult);
        }

        return Observable.of(dictionaryRecord.translateResult);
    }

    private isDictionaryRecordExpired(dictionaryRecord: DictionaryRecord): boolean {
        const currentTime = Date.now();
        const elapsedMilliseconds = currentTime - dictionaryRecord.updatedDate.getTime();
        const MillisecondsInSecond = 1000;
        const SecondsInMinute = 60;
        const MinutesInHour = 60;
        const HoursInDay = 24;
        const elapsedDays = elapsedMilliseconds / MillisecondsInSecond / SecondsInMinute / MinutesInHour / HoursInDay;
        return elapsedDays > this.recordsCacheDays;
    }

    private getResponseFromService(sentence: string, isForcedTranslation: boolean): Observable<TranslateResult> {
        return this.hashProvider.computeHash(sentence)
            .concatMap(hash => this.getTranslationResponse(sentence, isForcedTranslation, hash))
            .map(response => this.responseParser.parse(response, sentence));
    }

    private sanitizeSentence(sentence: string): string {
        return sentence.trim();
    }

    private getTranslationResponse(text: string, isForcedTranslation: boolean, hash: string): Observable<any> {
        const encodedText = encodeURIComponent(text);
        const forceTranslationArgument = isForcedTranslation ? "qc" : "qca";
        const domain = "https://translate.google.com";
        const urlPath = `translate_a/single?client=t&sl=en&tl=ru&hl=ru&dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=${forceTranslationArgument}&dt=rw&dt=rm&dt=ss&dt=t&ie=UTF-8&oe=UTF-8&otf=1&ssel=0&tsel=0&kc=4&tk=${hash}&q=${encodedText}`;
        return this.requestProvider.getJsonContent(`${domain}/${urlPath}`);
    }
}