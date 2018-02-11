import { TranslatePageParser } from "./TranslatePageParser";
import * as Rx from "rxjs/Rx";

export class TextTranslator {
    private readonly translatePageParser: TranslatePageParser = new TranslatePageParser();

    public translate(text: string): Rx.Observable<string> {
        return this.translatePageParser.getTranslationConfig().map(translationConfig => {
            return translationConfig.tkk1.toString() + ";" + translationConfig.tkk2.toString();
        });
    }
}