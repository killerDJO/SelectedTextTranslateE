<script setup lang="ts">
import { computed } from 'vue';
import Paginate from 'vuejs-paginate-next';

interface Props {
  pageNumber: number;
  totalRecords: number;
  totalPages: number;
}
const props = defineProps<Props>();

const $emit = defineEmits<{
  (e: 'update:pageNumber', pageNumber: number): void;
}>();

const pageNumber$ = computed({
  get: () => props.pageNumber,
  set: pageNumber => $emit('update:pageNumber', pageNumber)
});
</script>

<template>
  <div class="history-paginator">
    <span class="records-count">{{ totalRecords }} records</span>
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
