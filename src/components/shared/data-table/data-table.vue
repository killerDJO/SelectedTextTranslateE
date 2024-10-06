<script setup lang="ts" generic="TRecord extends { id: string }, TColumns extends string">
import { Ref, computed, onMounted, ref, useSlots, watch } from 'vue';

import { cloneDeep } from '~/utils/object.utils';

export interface DataTableConfig<TColumns> {
  readonly columns: ReadonlyArray<DataTableColumnConfig<TColumns>>;
  clickable?: boolean;
}
export interface DataTableColumnConfig<TColumns> {
  readonly id: TColumns;
  weight: number;
  isVisible: boolean;
}
interface ResizeInfo {
  readonly element: HTMLElement;
  readonly columnConfiguration: DataTableColumnConfig<TColumns>;
}

interface Props {
  configuration: DataTableConfig<TColumns>;
  isLoading?: boolean;
  records: TRecord[];
}
const props = defineProps<Props>();

const $emit = defineEmits<{
  'record-click': [record: TRecord];
  'update-columns-configuration': [columns: ReadonlyArray<DataTableColumnConfig<TColumns>>];
}>();

const slots = useSlots();

const table = ref<HTMLElement | null>(null);
const currentConfiguration = ref(cloneDeep(props.configuration)) as Ref<DataTableConfig<TColumns>>;
const resizeInfo = ref<ResizeInfo | null>(null) as Ref<ResizeInfo | null>;

const visibleColumns = computed(() =>
  currentConfiguration.value.columns.filter(column => column.isVisible)
);

const clickable = computed(
  () => props.configuration.clickable === undefined || props.configuration.clickable
);

watch(
  () => props.configuration,
  () => {
    currentConfiguration.value = cloneDeep(props.configuration);
  }
);

onMounted(() => {
  currentConfiguration.value.columns.forEach(column => {
    checkIfSlotRegistered('header', column);
    checkIfSlotRegistered('body', column);
  });

  document.addEventListener('mousemove', onResizeProgress);
  document.addEventListener('mouseup', onResizeFinished);
});

function onRecordClick(record: TRecord) {
  if (clickable.value) {
    $emit('record-click', record);
  }
}

function getColumnsWidth(id: string) {
  const currenTColumns = visibleColumns.value.find(column => column.id === id);
  if (!currenTColumns) {
    throw new Error(`Unable to find column with id ${id}`);
  }

  return getWidthByWeight(currenTColumns.weight);
}

function onResizeStarted(
  event: MouseEvent,
  columnConfiguration: DataTableColumnConfig<TColumns>
): void {
  const headerBeingResized = (event.target as HTMLElement).parentElement;
  if (headerBeingResized === null) {
    throw Error('Header to resize is not found');
  }

  resizeInfo.value = {
    columnConfiguration: columnConfiguration,
    element: headerBeingResized
  };
}

function onResizeProgress(event: MouseEvent): void {
  if (resizeInfo.value === null) {
    return;
  }

  const columnConfiguration = resizeInfo.value.columnConfiguration;
  const newWeight = geTColumnsWeightAfterResize(event, resizeInfo.value);
  const weightDelta = newWeight - columnConfiguration.weight;

  const siblingColumnIndex =
    visibleColumns.value.findIndex(column => column.id === columnConfiguration.id) + 1;
  const siblingColumn = visibleColumns.value[siblingColumnIndex];

  if (siblingColumn.weight - weightDelta >= getMinWeight()) {
    siblingColumn.weight -= weightDelta;
    columnConfiguration.weight = newWeight;
  }
}

function onResizeFinished(): void {
  if (resizeInfo.value === null) {
    return;
  }

  resizeInfo.value = null;
  $emit('update-columns-configuration', currentConfiguration.value.columns);
}

function geTColumnsWeightAfterResize(event: MouseEvent, resizeInfo: ResizeInfo): number {
  const newWidth = event.pageX - resizeInfo.element.getBoundingClientRect().left;
  const tableWidth = table.value!.getBoundingClientRect().width;
  const widthPercentage = newWidth / tableWidth;
  const totalWeight = getTotalColumnWeights();
  const newWeight = totalWeight * widthPercentage;

  return Math.max(newWeight, getMinWeight());
}

function getWidthByWeight(weight: number): number {
  const totalWeight = getTotalColumnWeights();
  const percentageWidth = (weight / totalWeight) * 100;
  return percentageWidth;
}

function getMinWeight(): number {
  const totalWeight = getTotalColumnWeights();
  const MinWeightPercentage = 0.05;
  const minWeight = totalWeight * MinWeightPercentage;
  return minWeight;
}

function checkIfSlotRegistered(type: string, column: DataTableColumnConfig<TColumns>): void {
  const key = `${type}.${column.id}`;
  if (!slots[key]) {
    throw new Error(`${type} slot for column ${column.id} must be registered`);
  }
}

function getTotalColumnWeights(): number {
  return visibleColumns.value.reduce(
    (previousValue, currentValue) => previousValue + currentValue.weight,
    0
  );
}
</script>

<template>
  <div class="table-holder">
    <table
      v-if="records.length"
      ref="table"
      class="table-striped results"
      :class="{ clickable: clickable }"
    >
      <thead>
        <th
          v-for="(column, index) in visibleColumns"
          :key="column.id"
          :style="{ width: getColumnsWidth(column.id) + '%' }"
        >
          <slot :name="'header.' + column.id" />
          <div
            v-if="index < visibleColumns.length - 1"
            class="grip"
            @mousedown="onResizeStarted($event, column)"
          />
        </th>
      </thead>
      <tbody v-if="records.length !== 0">
        <tr v-for="(record, index) in records" :key="record.id" @click="onRecordClick(record)">
          <td v-for="column in visibleColumns" :key="column.id">
            <slot :name="'body.' + column.id" :record="record" :index="index" />
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="!isLoading && !records.length" class="no-records">
      <slot name="empty"></slot>
    </div>
    <div v-if="isLoading" class="loader" :class="{ 'no-results': !records.length }">
      <app-loader :large="true"></app-loader>
    </div>
  </div>
</template>

<style src="./data-table.scss" lang="scss" scoped></style>
