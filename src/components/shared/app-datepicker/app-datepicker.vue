<script setup lang="ts">
import { computed } from 'vue';

import { toISODate } from '~/utils/date.utils';

interface Props {
  value: Date | undefined;
  maxDate?: Date;
  minDate?: Date;
  disableFutureDates?: boolean;
}
const props = defineProps<Props>();

const $emit = defineEmits<{
  (e: 'update:value', date: Date | undefined): void;
}>();

const value$ = computed({
  get: () => formatDate(props.value),
  set: (value: string | undefined) => {
    $emit('update:value', value ? new Date(value) : undefined);
  }
});

function formatDate(date: Date | undefined) {
  return date ? toISODate(date) : undefined;
}

function max(): string | undefined {
  if (props.disableFutureDates) {
    const maxDate = props.maxDate ?? new Date();
    return toISODate(maxDate);
  }

  return toISODate(props.maxDate);
}
</script>

<template>
  <input
    v-model="value$"
    :class="{ 'has-value': props.value }"
    class="datepicker"
    type="date"
    :min="toISODate(minDate)"
    :max="max()"
  />
</template>

<style src="./app-datepicker.scss" lang="scss" scoped></style>
