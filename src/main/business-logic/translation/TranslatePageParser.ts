import { Cache, CacheClass } from "memory-cache";
import { DOMParser } from "xmldom";
import safeEval = require("safe-eval");
import { Observable, of } from "rxjs";
import { tap, map, take } from "rxjs/operators";
import { injectable } from "inversify";

import { TranslationConfig } from "business-logic/translation/dto/TranslationConfig";
import { Logger } from "infrastructure/Logger";
import { RequestProvider } from "data-access/RequestProvider";
import { SettingsProvider } from "business-logic/settings/SettingsProvider";

@injectable()
export class TranslatePageParser {
    private readonly cacheKey: string = "TranslationConfig";
    private readonly isTextTkkMatch: boolean = false;
    private readonly cache: CacheClass<string, TranslationConfig> = new Cache();
    private readonly refreshIntervalMilliseconds: number;

    constructor(
        private readonly requestProvider: RequestProvider,
        private readonly logger: Logger,
        private readonly settingsProvider: SettingsProvider) {
        const SecondsInMinute = 60;
        const MillisecondsInSecond = 1000;

        const settings = this.settingsProvider.getSettings().value;
        this.refreshIntervalMilliseconds = settings.engine.translationConfigRefreshInterval * SecondsInMinute * MillisecondsInSecond;
        this.isTextTkkMatch = settings.engine.isTextTkkMatch;
    }

    public getTranslationConfig(): Observable<TranslationConfig> {

        const cachedTranslationConfig = this.cache.get(this.cacheKey);
        if (cachedTranslationConfig !== null) {
            return of(cachedTranslationConfig);
        }

        return this.getUpdatedTranslationConfig().pipe(
            take(1),
            tap(() => this.logger.info("Translation config has been updated.")),
            tap(translationConfig => this.cache.put(this.cacheKey, translationConfig, this.refreshIntervalMilliseconds))
        );
    }

    private getUpdatedTranslationConfig(): Observable<TranslationConfig> {
        return this.requestProvider.getStringContent(this.settingsProvider.getSettings().value.engine.baseUrl).pipe(map(html => {
            const scriptContent = this.extractScriptContentFromHtml(html);
            return this.extractConfig(scriptContent);
        }));
    }

    private extractScriptContentFromHtml(html: string): string {
        const document = new DOMParser().parseFromString(html);
        const scriptContent = this.findScriptContent(document);

        if (scriptContent === null) {
            throw Error("Unable to find script tag in translation page");
        }

        return scriptContent;
    }

    private extractConfig(script: string): TranslationConfig {
        const tkk = this.isTextTkkMatch ? script.match(/tkk:'(\d+\.\d+)'/)?.[1] : safeEval(`(function(){${script}; return TKK;})();`) as string | undefined;

        if (!tkk) {
            throw new Error("Unable to find tkk in script.");
        }

        const tkkItems = tkk.split(".");
        const ExpectedNumberOfTkkItems = 2;
        if (tkkItems.length !== ExpectedNumberOfTkkItems) {
            throw Error(`Unexpected format of TKK: '${tkk}'.`);
        }

        const tkk1 = parseInt(tkkItems[0], 10);
        const tkk2 = parseInt(tkkItems[1], 10);
        return new TranslationConfig(tkk1, tkk2);
    }

    private findScriptContent(node: Node): string | null {
        if (node.nodeName.toLowerCase() === "script" && node.textContent !== null && (node.textContent.indexOf("tkk") !== -1 || node.textContent.indexOf("TKK") !== -1)) {
            return node.textContent;
        }

        if (!!node.childNodes) {
            // tslint:disable-next-line prefer-for-of
            for (let i = 0; i < node.childNodes.length; ++i) {
                const childNode = node.childNodes[i];
                const scriptTag = this.findScriptContent(childNode);
                if (scriptTag !== null) {
                    return scriptTag;
                }
            }
        }

        return null;
    }
}