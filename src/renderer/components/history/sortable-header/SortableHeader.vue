<template>
  <th @click="sort" class="sortable-header">
    {{columnToNameMap.get(sortColumn)}}
    <span class="icon icon-up-dir" :class="{'active': isSortArrowActive(SortOrder.Asc), 'hidden': isSortArrowHidden(SortOrder.Asc)}" title="Sort Ascending"></span>
    <span class="icon icon-down-dir" :class="{'active': isSortArrowActive(SortOrder.Desc), 'hidden': isSortArrowHidden(SortOrder.Desc)}" title="Sort Descending"></span>
  </th>
</template>

<script src="./SortableHeader.ts" lang="ts"></script>
<style src="./SortableHeader.scss" lang="scss" scoped></style>
