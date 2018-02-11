import * as Rx from "rxjs/Rx";

import { TranslatePageParser } from "./TranslatePageParser";
import { TranslationConfig } from "./Dto/TranslationConfig";

export class HashProvider {
    private readonly translatePageParser: TranslatePageParser = new TranslatePageParser();

    public computeHash(text: string): Rx.Observable<string> {
        return this.translatePageParser.getTranslationConfig()
            .single()
            .map(translationConfig => this.computeHashWithConfig(text, translationConfig));
    }

    private computeHashWithConfig(text: string, translationConfig: TranslationConfig): string {
        const bytes = Buffer.from(text, "utf8");
        let a: number = translationConfig.tkk1;
        const pow32: number = 4294967295;
        const pow31: number = (pow32 - 1) / 2;

        for (let i = 0; i < bytes.length; ++i) {
            a = a + bytes[i];

            /* ------ */
            a = a + ((a << 10) & pow32);
            a = a ^ (a >>> 6);
            /* ------ */
        }

        /* ------ */
        a = a + ((a << 3) & pow32);
        a = a ^ (a >>> 11);
        a = a + ((a << 15) & pow32);
        /* ------ */

        a = a ^ translationConfig.tkk2;

        if (a < 0) {
            a = (a & pow31) + pow31 + 1;
        }

        a = a % 1000000;

        return `${a}.${a ^ translationConfig.tkk1}`;
    }
}