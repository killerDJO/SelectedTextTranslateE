import Vue from "vue";

export default class TranslationInput extends Vue {

    public text: string = "";

    public translate(): void {
        if (!!this.text) {
            this.$emit("translate-text", this.text);
        }
    }
}