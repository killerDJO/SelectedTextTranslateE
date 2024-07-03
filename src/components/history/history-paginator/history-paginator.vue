<script setup lang="ts">
import { computed } from 'vue';
import Paginate from 'vuejs-paginate-next';

interface Props {
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}
const props = defineProps<Props>();

const $emit = defineEmits<{
  'update:pageNumber': [pageNumber: number];
  'update:pageSize': [pageNumber: number];
}>();

const pageNumber$ = computed({
  get: () => props.pageNumber,
  set: pageNumber => $emit('update:pageNumber', pageNumber)
});

const pageSize$ = computed({
  get: () => props.pageSize?.toString(),
  set: (newSize: string) => {
    $emit('update:pageSize', Number(newSize));
  }
});

const pageSizeOptions = [10, 15, 20, 25, 30, 50];
</script>

<template>
  <div class="history-paginator">
    <span class="records-count">{{ totalRecords }} records</span>
    <select v-model="pageSize$" class="form-select page-size-select">
      <option
        v-for="pageSizeOption in pageSizeOptions"
        :key="pageSizeOption"
        :value="pageSizeOption"
      >
        {{ pageSizeOption }} / page
      </option>
    </select>
    <paginate
      v-model="pageNumber$"
      :page-count="totalPages"
      :prev-text="'Previous'"
      :next-text="'Next'"
      :container-class="'pagination'"
    >
      <template #breakViewContent>...</template>
    </paginate>
  </div>
</template>

<style src="./history-paginator.scss" lang="scss" scoped></style>
