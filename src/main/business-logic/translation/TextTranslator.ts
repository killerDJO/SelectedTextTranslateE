import { Observable, of } from "rxjs";
import { injectable } from "inversify";
import { concatMap, tap, map } from "rxjs/operators";

import { TranslateResult } from "common/dto/translation/TranslateResult";
import { Logger } from "infrastructure/Logger";

import { HashProvider } from "business-logic/translation/HashProvider";
import { TranslationResponseParser } from "business-logic/translation/TranslationResponseParser";
import { RequestProvider } from "data-access/RequestProvider";
import { HistoryStore } from "business-logic/history/HistoryStore";
import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { SettingsProvider } from "business-logic/settings/SettingsProvider";
import { TranslationRequest } from "common/dto/translation/TranslationRequest";
import { TranslationKey } from "common/dto/translation/TranslationKey";

@injectable()
export class TextTranslator {
    constructor(
        private readonly requestProvider: RequestProvider,
        private readonly hashProvider: HashProvider,
        private readonly historyStore: HistoryStore,
        private readonly responseParser: TranslationResponseParser,
        private readonly logger: Logger,
        private readonly settingsProvider: SettingsProvider) {
    }

    public translate({ text, isForcedTranslation, refreshCache, sourceLanguage, targetLanguage }: TranslationRequest, skipStatistic: boolean): Observable<HistoryRecord | null> {
        this.logger.info(`Translating text: "${text}".`);

        const sanitizedSentence = this.sanitizeSentence(text);

        if (sanitizedSentence === "") {
            return of(null);
        }

        const key = this.getTranslationKey(sanitizedSentence, isForcedTranslation, sourceLanguage, targetLanguage);

        return this.historyStore.getRecord(key).pipe(
            concatMap(historyRecord => this.getTranslateResult(key, refreshCache, historyRecord, skipStatistic)),
            concatMap(historyRecord => !skipStatistic ? this.historyStore.incrementTranslationsNumber(key) : of(historyRecord))
        );
    }

    private getTranslationKey(text: string, isForcedTranslation: boolean, sourceLanguage: string | undefined, targetLanguage: string | undefined): TranslationKey {
        const languageSettings = this.settingsProvider.getSettings().value.language;
        return {
            sentence: text,
            isForcedTranslation: isForcedTranslation,
            sourceLanguage: sourceLanguage || languageSettings.sourceLanguage,
            targetLanguage: targetLanguage || languageSettings.targetLanguage
        };
    }

    private getTranslateResult(key: TranslationKey, refreshCache: boolean, historyRecord: HistoryRecord | null, skipStatistic: boolean): Observable<HistoryRecord> {
        const translateResult$ = this
            .getResponseFromService(key)
            .pipe(tap(() => this.logger.info(`Serving translation ${this.getLogKey(key)} from service.`)));

        if (historyRecord === null) {
            return translateResult$
                .pipe(concatMap(translateResult => this.historyStore.addTranslateResult(translateResult, key)));
        }

        if (refreshCache || this.isHistoryRecordExpired(historyRecord)) {
            return translateResult$
                .pipe(concatMap(translateResult => this.historyStore.updateTranslateResult(translateResult, key, skipStatistic)));
        }

        this.logger.info(`Serving translation ${this.getLogKey(key)} from dictionary.`);
        return of(historyRecord);
    }

    private getLogKey(key: TranslationKey): string {
        return `for "${key.sentence}" when forced translation is set to "${key.isForcedTranslation}" with languages ${key.sourceLanguage} -${key.targetLanguage} `;
    }

    private isHistoryRecordExpired(historyRecord: HistoryRecord): boolean {
        const currentTime = Date.now();
        const elapsedMilliseconds = currentTime - historyRecord.updatedDate.getTime();
        const MillisecondsInSecond = 1000;
        const SecondsInMinute = 60;
        const MinutesInHour = 60;
        const HoursInDay = 24;
        const elapsedDays = elapsedMilliseconds / MillisecondsInSecond / SecondsInMinute / MinutesInHour / HoursInDay;
        return elapsedDays > this.settingsProvider.getSettings().value.engine.historyRefreshInterval;
    }

    private getResponseFromService(key: TranslationKey): Observable<TranslateResult> {
        return this.hashProvider.computeHash(key.sentence).pipe(
            concatMap(hash => this.getTranslationResponse(key, hash)),
            map(response => this.responseParser.parse(response, key.sentence))
        );
    }

    private sanitizeSentence(sentence: string | null): string {
        return (sentence || "").trim();
    }

    private getTranslationResponse(key: TranslationKey, hash: string): Observable<any> {
        const encodedText = encodeURIComponent(key.sentence);
        const forceTranslationArgument = key.isForcedTranslation ? "qc" : "qca";
        const domain = this.settingsProvider.getSettings().value.engine.baseUrl;
        const urlPath =
            `translate_a/single?client=t&sl=${key.sourceLanguage}&tl=${key.targetLanguage}&hl=${key.targetLanguage}&dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=${forceTranslationArgument}` +
            `&dt=rw&dt=rm&dt=ss&dt=t&ie=UTF-8&oe=UTF-8&otf=1&ssel=0&tsel=0&kc=4&tk=${hash}&q=${encodedText}`;
        return this.requestProvider.getJsonContent(`${domain}/${urlPath}`);
    }
}