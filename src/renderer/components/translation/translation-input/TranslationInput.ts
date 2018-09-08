import Vue from "vue";
import { TranslationRequest } from "common/dto/translation/TranslationRequest";

export default class TranslationInput extends Vue {

    public text: string = "";

    public translate(): void {
        if (!!this.text) {
            const request: TranslationRequest = {
                text: this.text,
                isForcedTranslation: false,
                refreshCache: false
            };
            this.$emit("translate-text", request);
        }
    }
}