import { Component, Prop } from "vue-property-decorator";
import Vue from "vue";

import { HistoryRecord } from "common/dto/history/HistoryRecord";

@Component
export default class TranslationResultStatistic extends Vue {

    @Prop(Object)
    public historyRecord!: HistoryRecord;

    @Prop(Map)
    public languages!: Map<string, string>;

    public refreshTranslation(): void {
        this.$emit("refresh-translation");
    }
}