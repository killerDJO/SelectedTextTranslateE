<template>
  <div @click="sort" class="sortable-header" v-overflow-tooltip>
    {{columnNameResolver.getColumnName(sortColumn)}}
    <span class="icon icon-up-dir" :class="{'active': isSortArrowActive(SortOrder.Asc), 'hidden': isSortArrowHidden(SortOrder.Asc)}" title="Sort Ascending"></span>
    <span class="icon icon-down-dir" :class="{'active': isSortArrowActive(SortOrder.Desc), 'hidden': isSortArrowHidden(SortOrder.Desc)}" title="Sort Descending"></span>
  </div>
</template>

<script src="./SortableHeader.ts" lang="ts"></script>
<style src="./SortableHeader.scss" lang="scss" scoped></style>
