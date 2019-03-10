import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import * as _ from "lodash";

import { DataTableConfiguration, DataTableColumnConfiguration } from "components/shared/data-table/DataTableConfiguration";

@Component
export default class DataTable<TRecord> extends Vue {
    @Prop(Object) public configuration!: DataTableConfiguration<TRecord>;
    @Prop(Array) public records!: ReadonlyArray<TRecord>;

    private resizeInfo: ResizeInfo | null = null;
    private currentConfiguration: DataTableConfiguration<TRecord> = _.cloneDeep(this.configuration);

    @Watch("configuration", { deep: true, immediate: true })
    public onConfigurationChanged(): void {
        this.currentConfiguration = _.cloneDeep(this.configuration);
    }

    public get visibleColumns(): ReadonlyArray<DataTableColumnConfiguration> {
        return this.currentConfiguration.columns.filter(column => column.isVisible);
    }

    public get numberOfVisibleColumns(): number {
        return this.visibleColumns.length;
    }

    public mounted() {
        this.currentConfiguration.columns.forEach(column => {
            this.checkIfSlotRegistered("header", column);
            this.checkIfSlotRegistered("body", column);
        });

        document.addEventListener("mousemove", this.onResizeProgress.bind(this));
        document.addEventListener("mouseup", this.onResizeFinished.bind(this));
    }

    public onRecordClick(record: TRecord) {
        this.currentConfiguration.onRecordClick(record);
    }

    public getColumnWidth(id: string) {
        const currentColumn = this.visibleColumns.find(column => column.id === id);
        if (!currentColumn) {
            throw new Error(`Unable to find column with id ${id}`);
        }

        return this.getWidthByWeight(currentColumn.weight);
    }

    public onResizeStarted(event: MouseEvent, columnConfiguration: DataTableColumnConfiguration): void {
        const headerBeingResized = (event.target as HTMLElement).parentElement;
        if (headerBeingResized === null) {
            throw Error("Header to resize is not found");
        }

        this.resizeInfo = {
            columnConfiguration: columnConfiguration,
            element: headerBeingResized
        };
    }

    public onResizeProgress(event: MouseEvent): void {
        if (this.resizeInfo === null) {
            return;
        }

        const columnConfiguration = this.resizeInfo.columnConfiguration;
        const newWeight = this.getColumnWeightAfterResize(event, this.resizeInfo);
        const weightDelta = newWeight - columnConfiguration.weight;

        const siblingColumnIndex = this.visibleColumns.findIndex(column => column.id === columnConfiguration.id) + 1;
        const siblingColumn = this.visibleColumns[siblingColumnIndex];

        if (siblingColumn.weight - weightDelta >= this.getMinWeight()) {
            siblingColumn.weight -= weightDelta;
            columnConfiguration.weight = newWeight;
        }
    }

    public onResizeFinished(): void {
        if (this.resizeInfo === null) {
            return;
        }

        this.resizeInfo = null;
        this.$emit("update-columns-configuration", this.currentConfiguration.columns);
    }

    private getColumnWeightAfterResize(event: MouseEvent, resizeInfo: ResizeInfo): number {
        const newWidth = event.pageX - resizeInfo.element.getBoundingClientRect().left;
        const tableWidth = (this.$refs.table as HTMLElement).getBoundingClientRect().width;
        const widthPercentage = newWidth / tableWidth;
        const totalWeight = this.getTotalColumnWeights();
        const newWeight = totalWeight * widthPercentage;

        return Math.max(newWeight, this.getMinWeight());
    }

    private getWidthByWeight(weight: number): number {
        const totalWeight = this.getTotalColumnWeights();
        const percentageWidth = weight / totalWeight * 100;
        return percentageWidth;
    }

    private getMinWeight(): number {
        const totalWeight = this.getTotalColumnWeights();
        const MinWeightPercentage = 0.05;
        const minWeight = totalWeight * MinWeightPercentage;
        return minWeight;
    }

    private checkIfSlotRegistered(type: string, column: DataTableColumnConfiguration): void {
        const key = `${type}.${column.id}`;
        if (!this.$slots[key] && !this.$scopedSlots[key]) {
            throw new Error(`${type} slot for column ${column.id} must be registered`);
        }
    }

    private getTotalColumnWeights(): number {
        return this.visibleColumns.reduce((previousValue, currentValue) => previousValue + currentValue.weight, 0);
    }
}

interface ResizeInfo {
    readonly element: HTMLElement;
    readonly columnConfiguration: DataTableColumnConfiguration;
}