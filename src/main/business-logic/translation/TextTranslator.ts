import { Observable, of } from "rxjs";
import { injectable } from "inversify";
import { concatMap, tap, map } from "rxjs/operators";

import { TranslateResult } from "common/dto/translation/TranslateResult";
import { TranslationRequest } from "common/dto/translation/TranslationRequest";
import { TranslationKey } from "common/dto/translation/TranslationKey";
import { HistoryRecord } from "common/dto/history/HistoryRecord";

import { Logger } from "infrastructure/Logger";
import { replaceAllPattern } from "utils/replace-pattern";

import { RequestProvider } from "data-access/RequestProvider";

import { HashProvider } from "business-logic/translation/HashProvider";
import { TranslationResponseParser } from "business-logic/translation/TranslationResponseParser";
import { HistoryStore } from "business-logic/history/HistoryStore";
import { SettingsProvider } from "business-logic/settings/SettingsProvider";

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
            concatMap(historyRecord => this.getTranslateResult(key, refreshCache, skipStatistic, historyRecord)),
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

    private getTranslateResult(key: TranslationKey, refreshCache: boolean, skipStatistic: boolean, historyRecord: HistoryRecord | null): Observable<HistoryRecord> {
        const translateResult$ = this
            .getResponseFromService(key)
            .pipe(tap(() => this.logger.info(`Serving translation ${this.getLogKey(key)} from service.`)));

        const incrementTranslationsNumber = !(skipStatistic || refreshCache);

        if (historyRecord === null) {
            return translateResult$
                .pipe(concatMap(translateResult => this.historyStore.addTranslateResult(translateResult, key, incrementTranslationsNumber)));
        }

        if (refreshCache || this.isHistoryRecordExpired(historyRecord)) {
            return translateResult$
                .pipe(concatMap(translateResult => this.historyStore.updateTranslateResult(translateResult, historyRecord, incrementTranslationsNumber)));
        }

        this.logger.info(`Serving translation ${this.getLogKey(key)} from dictionary.`);

        if (incrementTranslationsNumber) {
            return this.historyStore.incrementTranslationsNumber(key);
        }

        return of(historyRecord);
    }

    private getLogKey(key: TranslationKey): string {
        return `for "${key.sentence}" when forced translation is set to "${key.isForcedTranslation}" with languages ${key.sourceLanguage}-${key.targetLanguage}`;
    }

    private isHistoryRecordExpired(historyRecord: HistoryRecord): boolean {
        const currentTime = Date.now();
        const elapsedMilliseconds = currentTime - (new Date(historyRecord.updatedDate)).getTime();
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
        const urlPattern = this.settingsProvider.getSettings().value.engine.translatePattern;
        const url = replaceAllPattern(urlPattern, {
            "source-language": key.sourceLanguage,
            "target-language": key.targetLanguage,
            "forced": key.isForcedTranslation ? "qc" : "qca",
            "hash": hash,
            "query": encodedText
        });
        return this.requestProvider.getJsonContent(url);
    }
}