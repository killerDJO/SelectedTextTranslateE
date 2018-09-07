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

    public translate({ text, isForcedTranslation, refreshCache }: TranslationRequest, skipStatistic: boolean): Observable<HistoryRecord | null> {
        this.logger.info(`Translating text: "${text}".`);

        const sanitizedSentence = this.sanitizeSentence(text);

        if (sanitizedSentence === "") {
            return of(null);
        }

        return this.historyStore.getRecord(sanitizedSentence, isForcedTranslation).pipe(
            concatMap(historyRecord => this.getTranslateResult(sanitizedSentence, isForcedTranslation, refreshCache, historyRecord, skipStatistic)),
            concatMap(historyRecord => !skipStatistic ? this.historyStore.incrementTranslationsNumber(historyRecord.translateResult, isForcedTranslation) : of(historyRecord))
        );
    }

    private getTranslateResult(sentence: string, isForcedTranslation: boolean, refreshCache: boolean, historyRecord: HistoryRecord | null, skipStatistic: boolean): Observable<HistoryRecord> {
        const translateResult$ = this
            .getResponseFromService(sentence, isForcedTranslation)
            .pipe(tap(() => this.logger.info(`Serving translation for "${sentence}" when forced translation is set to "${isForcedTranslation}" from service.`)));

        if (historyRecord === null) {
            return translateResult$
                .pipe(concatMap(translateResult => this.historyStore.addTranslateResult(translateResult, isForcedTranslation)));
        }

        if (refreshCache || this.isHistoryRecordExpired(historyRecord)) {
            return translateResult$
                .pipe(concatMap(translateResult => this.historyStore.updateTranslateResult(translateResult, isForcedTranslation, skipStatistic)));
        }

        this.logger.info(`Serving translation for "${sentence}" when forced translation is set to "${isForcedTranslation}" from dictionary.`);
        return of(historyRecord);
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

    private getResponseFromService(sentence: string, isForcedTranslation: boolean): Observable<TranslateResult> {
        return this.hashProvider.computeHash(sentence).pipe(
            concatMap(hash => this.getTranslationResponse(sentence, isForcedTranslation, hash)),
            map(response => this.responseParser.parse(response, sentence))
        );
    }

    private sanitizeSentence(sentence: string | null): string {
        return (sentence || "").trim();
    }

    private getTranslationResponse(text: string, isForcedTranslation: boolean, hash: string): Observable<any> {
        const encodedText = encodeURIComponent(text);
        const forceTranslationArgument = isForcedTranslation ? "qc" : "qca";
        const domain = this.settingsProvider.getSettings().value.engine.baseUrl;
        const urlPath = `translate_a/single?client=t&sl=en&tl=ru&hl=ru&dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=${forceTranslationArgument}&dt=rw&dt=rm&dt=ss&dt=t&ie=UTF-8&oe=UTF-8&otf=1&ssel=0&tsel=0&kc=4&tk=${hash}&q=${encodedText}`;
        return this.requestProvider.getJsonContent(`${domain}/${urlPath}`);
    }
}