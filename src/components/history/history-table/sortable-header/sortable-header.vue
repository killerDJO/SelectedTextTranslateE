<script setup lang="ts">
import { SortOrder } from '~/components/history/models/sort-order.enum';
import { HistoryColumnName } from '~/host/models/settings.model';
import { getColumnDisplayName } from '../../history.utils';

interface Props {
  sortColumn: HistoryColumnName;
  currentSortOrder?: SortOrder;
  currentSortColumn?: HistoryColumnName;
  sortable?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  sortable: true,
  currentSortOrder: undefined,
  currentSortColumn: undefined
});

const $emit = defineEmits<{
  'update:currentSortOrder': [sortOrder: SortOrder];
  'update:currentSortColumn': [sortColumn: HistoryColumnName];
}>();

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
  <div class="sortable-header" :class="{ sortable }" @click="sort">
    <span v-overflow-tooltip class="header-name">{{ getColumnDisplayName(sortColumn) }}</span>

    <font-awesome-icon
      v-if="sortable"
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
      v-if="sortable"
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
