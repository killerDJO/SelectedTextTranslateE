import { TranslatePageParser } from "./TranslatePageParser";
import * as Rx from "rxjs/Rx";
import { RequestProvider } from "../../data-access/RequestProvider";
import { TranslationConfig } from "./Dto/TranslationConfig";
import { TranslateResult } from "./Dto/TranslateResult";
import { TranslateResultSentence } from "./Dto/TranslateResultSentence";
import { HashProvider } from "./HashProvider";
import { TranslationResponseParser } from "./TranslationResponseParser";

export class TextTranslator {
    private readonly requestProvider: RequestProvider = new RequestProvider();
    private readonly hashProvider: HashProvider = new HashProvider();
    private readonly responseParser: TranslationResponseParser = new TranslationResponseParser();

    public translate(text: string): Rx.Observable<TranslateResult> {
        return this.hashProvider.computeHash(text)
            .concatMap(hash => this.getTranslationResponse(text, hash))
            .map(response => this.responseParser.parse(response, text));
    }

    private getTranslationResponse(text: string, hash: string): Rx.Observable<any> {
        const encodedText = encodeURIComponent(text);
        const translateUrl = `https://translate.google.com/translate_a/single?client=t&sl=en&tl=ru&hl=ru&dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t&ie=UTF-8&oe=UTF-8&otf=1&ssel=0&tsel=0&kc=4&tk=${hash}&q=${encodedText}`;
        return this.requestProvider.getJsonContent(translateUrl);
    }
}