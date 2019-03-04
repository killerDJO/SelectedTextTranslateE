import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import { DataTableConfiguration, DataTableColumnConfiguration } from "components/shared/data-table/DataTableConfiguration";

@Component
export default class DataTable<TRecord> extends Vue {
    @Prop(Object) public configuration!: DataTableConfiguration<TRecord>;
    @Prop(Array) public records!: ReadonlyArray<TRecord>;

    public get visibleColumns(): ReadonlyArray<DataTableColumnConfiguration> {
        return this.configuration.columns.filter(column => column.isVisible);
    }

    public get numberOfVisibleColumns(): number {
        return this.visibleColumns.length;
    }

    public mounted() {
        this.configuration.columns.forEach(column => {
            this.checkIfSlotRegistered("header", column);
            this.checkIfSlotRegistered("body", column);
        });
    }

    public onRecordClick(record: TRecord) {
        this.configuration.onRecordClick(record);
    }

    @Watch("configuration")
    public onConfigurationChanged(): void {
        this.$forceUpdate();
    }

    private checkIfSlotRegistered(type: string, column: DataTableColumnConfiguration): void {
        const key = `${type}.${column.id}`;
        if (!this.$slots[key] && !this.$scopedSlots[key]) {
            throw new Error(`${type} slot for column ${column.id} must be registered`);
        }
    }
}