<template>
  <th @click="sort" class="sortable-header">
    <slot></slot>
    <span class="icon icon-up-dir" :class="{'active': isSortArrowActive(SortOrder.Asc), 'hidden': isSortArrowHidden(SortOrder.Asc)}"></span>
    <span class="icon icon-down-dir" :class="{'active': isSortArrowActive(SortOrder.Desc), 'hidden': isSortArrowHidden(SortOrder.Desc)}"></span>
  </th>
</template>

<script src="./SortableHeader.ts" lang="ts"></script>
<style src="./SortableHeader.scss" lang="scss" scoped></style>
