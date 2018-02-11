import { RequestProvider } from "../../data-access/RequestProvider";
import { TranslationConfig } from "./Dto/TranslationConfig";
import * as Rx from "rxjs/Rx";
import { Cache, CacheClass } from "memory-cache";
import { DOMParser } from "xmldom";
import safeEval = require("safe-eval");

export class TranslatePageParser {

    private readonly requestProvider: RequestProvider = new RequestProvider();

    private readonly cacheKey: string = "TranslationConfig";
    private readonly cache: CacheClass<string, TranslationConfig> = new Cache();
    private readonly refreshIntervalMilliseconds: number;

    constructor() {
        const MinutesInHour = 60;
        const SecondsInMinute = 60;
        const MillisecondsInSecond = 1000;
        this.refreshIntervalMilliseconds = MinutesInHour * SecondsInMinute * MillisecondsInSecond;
    }

    public getTranslationConfig(): Rx.Observable<TranslationConfig> {

        const cachedTranslationConfig = this.cache.get(this.cacheKey);
        if (cachedTranslationConfig !== null) {
            return Rx.Observable.of(cachedTranslationConfig);
        }

        const updatedTranslationConfig = this.getUpdatedTranslationConfig().single();

        updatedTranslationConfig.subscribe(translationConfig => {
            this.cache.put(this.cacheKey, translationConfig, this.refreshIntervalMilliseconds);
        });

        return updatedTranslationConfig;
    }

    private getUpdatedTranslationConfig(): Rx.Observable<TranslationConfig> {
        return this.requestProvider.getStringContent("https://translate.google.com").map(html => {
            const scriptContent = this.extractScriptContentFromHtml(html);
            return this.extractConfig(scriptContent);
        });

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
        const tkk = safeEval(`(function(){${script}; return TKK;})();`) as string;

        const tkkItems = tkk.split(".");
        const ExpectedNumberOfTkkItems = 2;
        if (tkkItems.length !== ExpectedNumberOfTkkItems) {
            throw Error(`Unexpected format of TKK: '${tkk}'.`);
        }

        const tkk1 = parseInt(tkkItems[0], 10);
        const tkk2 = parseInt(tkkItems[1], 10);
        return new TranslationConfig(421762, 1847392056);
    }

    private findScriptContent(node: Node): string | null {
        if (node.nodeName.toLowerCase() === "script" && node.textContent !== null && node.textContent.indexOf("TKK=") !== -1) {
            return node.textContent;
        }

        if (!!node.childNodes) {
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