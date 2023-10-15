<script setup lang="ts">
import { computed, ref } from 'vue';
import { isEqual } from 'lodash-es';

import type { ColumnsSettings, HistorySortColumn } from '@selected-text-translate/common';

import type { DropItem } from '~/components/shared/drop-button/drop-button.vue';
import { getColumnName } from '~/components/history/history.utils';
import DropButton from '~/components/shared/drop-button/drop-button.vue';

interface ColumnDropItem extends DropItem {
  readonly column: HistorySortColumn;
  weight: number;
  isChecked: boolean;
}

interface Props {
  columns: ColumnsSettings;
}
const props = defineProps<Props>();

const $emit = defineEmits<{
  (e: 'update-columns', columns: ColumnsSettings): void;
}>();

const dropInstance = ref<InstanceType<typeof DropButton> | null>(null);
const dropItems = computed<ColumnDropItem[]>(() => {
  const sortColumns = Object.keys(props.columns) as HistorySortColumn[];
  return sortColumns.map(sortColumn => ({
    column: sortColumn,
    text: getColumnName(sortColumn),
    isChecked: props.columns[sortColumn].isVisible,
    weight: props.columns[sortColumn].weight
  }));
});

function itemClick(item: ColumnDropItem) {
  if (item.isChecked && isHideDisabled(item)) {
    return;
  }

  const updatedColumns = mapItems(dropItems.value);
  updatedColumns[item.column] = {
    ...updatedColumns[item.column],
    isVisible: !updatedColumns[item.column].isVisible
  };

  if (!isEqual(props.columns, updatedColumns)) {
    $emit('update-columns', updatedColumns);
  }
}

function isHideDisabled(item: ColumnDropItem): boolean {
  const sortColumns = Object.keys(props.columns) as HistorySortColumn[];
  const numberOfHiddenColumns = sortColumns.filter(
    column => !props.columns[column].isVisible
  ).length;
  const isLastItemHideDisabled = numberOfHiddenColumns >= sortColumns.length - 1;

  return isLastItemHideDisabled && item.isChecked;
}

function toggleDrop(): void {
  const drop = dropInstance.value!;
  if (drop.isDropVisible) {
    drop.closeDrop();
  } else {
    drop.openDrop();
  }
}

function moveUp(item: ColumnDropItem): void {
  if (!isMoveUpEnabled(item)) {
    return;
  }

  moveItem(item, itemIndex => itemIndex - 1);
}

function moveDown(item: ColumnDropItem): void {
  if (!isMoveDownEnabled(item)) {
    return;
  }

  moveItem(item, itemIndex => itemIndex + 1);
}

function isMoveUpEnabled(item: ColumnDropItem): boolean {
  return dropItems.value.indexOf(item) > 0;
}

function isMoveDownEnabled(item: ColumnDropItem): boolean {
  return dropItems.value.indexOf(item) < dropItems.value.length - 1;
}

function moveItem(item: ColumnDropItem, nextIndexGenerator: (index: number) => number): void {
  const itemIndex = dropItems.value.indexOf(item);
  const clonedItems = dropItems.value.slice();
  const swap = clonedItems[itemIndex];

  const nextIndex = nextIndexGenerator(itemIndex);
  clonedItems[itemIndex] = clonedItems[nextIndex];
  clonedItems[nextIndex] = swap;
  $emit('update-columns', mapItems(clonedItems));
}

function mapItems(items: ReadonlyArray<ColumnDropItem>): ColumnsSettings {
  return items.reduce((columnsSettings, setting) => {
    columnsSettings[setting.column] = {
      isVisible: setting.isChecked,
      weight: setting.weight
    };
    return columnsSettings;
  }, {} as ColumnsSettings);
}
</script>

<template>
  <drop-button
    ref="dropInstance"
    v-slot="{ item }"
    :text="'Columns'"
    :tab-index="0"
    :items="dropItems"
    :split-button="false"
    @click="toggleDrop"
    @item-click="item => itemClick(item as ColumnDropItem)"
  >
    <div class="drop-item-value">
      <app-checkbox
        :value="(item as ColumnDropItem).isChecked"
        :label="item.text"
        :tab-index="-1"
        :disabled="isHideDisabled(item as ColumnDropItem)"
        @update:value="() => itemClick(item as ColumnDropItem)"
      />
      <span class="order-icons">
        <icon-button
          :title="'Move Up'"
          class="move-up"
          :disabled="!isMoveUpEnabled(item as ColumnDropItem)"
          @click="moveUp(item as ColumnDropItem)"
        >
          <font-awesome-icon icon="caret-up" size="xs" class="icon" />
        </icon-button>
        <icon-button
          :title="'Move Down'"
          class="move-down"
          :disabled="!isMoveDownEnabled(item as ColumnDropItem)"
          @click="moveDown(item as ColumnDropItem)"
        >
          <font-awesome-icon class="icon" icon="caret-down" size="xs" />
        </icon-button>
      </span>
    </div>
  </drop-button>
</template>

<style src="./columns-editor.scss" lang="scss" scoped></style>
