<template>
  <table class="table-striped results non-clickable" ref="table" :class="{ 'data-clickable': clickable }">
    <thead>
      <th v-for="(column, index) in visibleColumns" :key="column.id" :style="{'width': getColumnWidth(column.id) + '%'}">
        <slot :name="'header.' + column.id" />
        <div class="grip"
          v-if="index < visibleColumns.length - 1"
          @mousedown="onResizeStarted($event, column)"/>
      </th>
    </thead>
    <tbody v-if="records.length !== 0">
      <tr v-for="(record, index) in records" :key="record.id" @click="onRecordClick(record)">
        <td v-for="column in visibleColumns" :key="column.id">
          <slot :name="'body.' + column.id" :record="record" :index="index"/>
        </td>
      </tr>
    </tbody>
    <tbody v-else-if="!configuration.isLoading">
      <tr>
        <td :colspan="numberOfVisibleColumns">
          <slot name="empty"></slot>
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr>
        <td :colspan="numberOfVisibleColumns" class="loading-records-indicator">
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script src="./DataTable.ts" lang="ts"></script>
<style src="./DataTable.scss" lang="scss" scoped></style>