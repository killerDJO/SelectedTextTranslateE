<script setup lang="ts">
import { computed, ref } from 'vue';
import { isEqual } from 'lodash-es';

import type {
  ColumnSettings,
  HistorySortColumn
} from '@selected-text-translate/common/settings/settings';

import type { DropItem } from '~/components/shared/drop-button/drop-button.vue';
import { ColumnNameResolver } from '~/components/history/column-name-resolver';
import DropButton from '~/components/shared/drop-button/drop-button.vue';

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

interface ColumnDropItem extends DropItem {
  readonly column: HistorySortColumn;
  weight: number;
  isChecked: boolean;
}

interface Props {
  columns: ReadonlyArray<ColumnSettings>;
}
const props = defineProps<Props>();

const $emit = defineEmits<{
  (e: 'update-columns', columns: ColumnSettings[]): void;
}>();

const dropInstance = ref<InstanceType<typeof DropButton> | null>(null);
const columnNameResolver = new ColumnNameResolver();
const dropItems = computed<ColumnDropItem[]>(() =>
  props.columns.map(columnSetting => ({
    column: columnSetting.column,
    text: columnNameResolver.getColumnName(columnSetting.column),
    isChecked: columnSetting.isVisible,
    weight: columnSetting.weight
  }))
);

function itemClick(item: ColumnDropItem) {
  if (item.isChecked && isHideDisabled(item)) {
    return;
  }

  const updatedColumns = mapItems(dropItems.value);
  const column = updatedColumns.find(column => column.column === item.column)!;
  column.isVisible = !column.isVisible;

  if (!isEqual(props.columns, updatedColumns)) {
    $emit('update-columns', updatedColumns);
  }
}

function isHideDisabled(item: ColumnDropItem): boolean {
  const numberOfHiddenColumns = props.columns.filter(column => !column.isVisible).length;
  const isLastItemHideDisabled = numberOfHiddenColumns >= props.columns.length - 1;

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

function mapItems(items: ReadonlyArray<ColumnDropItem>): Mutable<ColumnSettings>[] {
  return items.map(setting => ({
    column: setting.column,
    isVisible: setting.isChecked,
    weight: setting.weight
  }));
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
