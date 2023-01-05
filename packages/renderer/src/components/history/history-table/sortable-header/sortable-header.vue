<script setup lang="ts">
import type { HistorySortColumn } from '@selected-text-translate/common/settings/settings';

import { ColumnNameResolver } from '~/components/history/column-name-resolver';
import { SortOrder } from '~/components/history/models/sort-order';

interface Props {
  sortColumn: HistorySortColumn;
  currentSortOrder?: SortOrder;
  currentSortColumn?: HistorySortColumn;
}
const props = defineProps<Props>();

const $emit = defineEmits<{
  (e: 'update:currentSortOrder', sortOrder: SortOrder): void;
  (e: 'update:currentSortColumn', sortColumn: HistorySortColumn): void;
}>();

const columnNameResolver = new ColumnNameResolver();

function isSortArrowHidden(sortOrder: SortOrder): boolean {
  return props.sortColumn === props.currentSortColumn && props.currentSortOrder !== sortOrder;
}

function isSortArrowActive(sortOrder: SortOrder): boolean {
  return props.sortColumn === props.currentSortColumn && props.currentSortOrder === sortOrder;
}

function sort(): void {
  if (props.sortColumn === props.currentSortColumn) {
    $emit(
      'update:currentSortOrder',
      props.currentSortOrder === SortOrder.Asc ? SortOrder.Desc : SortOrder.Asc
    );
    return;
  }

  $emit('update:currentSortOrder', SortOrder.Asc);
  $emit('update:currentSortColumn', props.sortColumn);
}
</script>
<template>
  <div class="sortable-header" @click="sort">
    <span v-overflow-tooltip class="header-name">{{
      columnNameResolver.getColumnName(sortColumn)
    }}</span>

    <font-awesome-icon
      icon="caret-up"
      size="xs"
      class="icon sort-asc"
      :class="{
        active: isSortArrowActive(SortOrder.Asc),
        hidden: isSortArrowHidden(SortOrder.Asc)
      }"
      title="Sort Ascending"
    />
    <font-awesome-icon
      icon="caret-down"
      size="xs"
      class="icon sort-desc"
      :class="{
        active: isSortArrowActive(SortOrder.Desc),
        hidden: isSortArrowHidden(SortOrder.Desc)
      }"
      title="Sort Descending"
    />
  </div>
</template>

<style src="./sortable-header.scss" lang="scss" scoped></style>
