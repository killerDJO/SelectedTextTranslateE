import { Observable } from "rxjs";
import { injectable } from "inversify";
import { map, take } from "rxjs/operators";

import { TranslatePageParser } from "business-logic/translation/TranslatePageParser";
import { TranslationConfig } from "business-logic/translation/dto/TranslationConfig";

@injectable()
export class HashProvider {
    constructor(private readonly translatePageParser: TranslatePageParser) {
    }

    public computeHash(text: string): Observable<string> {
        return this.translatePageParser.getTranslationConfig().pipe(
            take(1),
            map(translationConfig => this.computeHashWithConfig(text, translationConfig))
        );
    }

    // Jenkins hash: https://en.wikipedia.org/wiki/Jenkins_hash_function
    private computeHashWithConfig(text: string, translationConfig: TranslationConfig): string {
        const bytes = Buffer.from(text, "utf8");
        let a: number = translationConfig.tkk1;
        const pow32minus1: number = 4294967295;
        const pow31minus1: number = (pow32minus1 - 1) / 2;

        for (let i = 0; i < bytes.length; ++i) {
            a = a + bytes[i];

            /* ------ */
            a = a + ((a << 10) & pow32minus1);
            a = a ^ (a >>> 6);
            /* ------ */
        }

        /* ------ */
        a = a + ((a << 3) & pow32minus1);
        a = a ^ (a >>> 11);
        a = a + ((a << 15) & pow32minus1);
        /* ------ */

        a = a ^ translationConfig.tkk2;

        if (a < 0) {
            a = (a & pow31minus1) + pow31minus1 + 1;
        }

        a = a % 1000000;

        return `${a}.${a ^ translationConfig.tkk1}`;
    }
}