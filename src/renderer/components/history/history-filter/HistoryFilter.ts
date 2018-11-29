import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import * as _ from "lodash";

@Component
export default class HistoryFilter extends Vue {
    @Prop(Object)
    public filter!: HistoryFilter;

    public currentFilter!: HistoryFilter;

    @Watch("filter", { deep: true })
    public onFilterChanged() {
        this.currentFilter = this.filter;
    }

    @Watch("currentFilter", { deep: true })
    public onCurrentFilterChanged() {
        this.$emit("filter-updated", this.currentFilter);
    }
}