import md5 = require("md5");
import { injectable } from "inversify";

import { TranslationKey } from "common/dto/translation/TranslationKey";

@injectable()
export class RecordIdGenerator {
    public generateId(key: TranslationKey) {
        return `${md5(key.sentence)}${key.isForcedTranslation ? "-forced" : ""}-${key.sourceLanguage}-${key.targetLanguage}`;
    }
}