<script setup lang="ts">
import { format, parse } from 'date-fns';
import { computed } from 'vue';

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

const DATE_FORMAT = 'yyyy-MM-dd';

const value$ = computed({
  get: () => formatDate(props.value),
  set: (value: string | undefined) => {
    console.log(value);
    $emit('update:value', value ? parse(value, DATE_FORMAT, new Date()) : undefined);
  }
});

function formatDate(date: Date | undefined) {
  return date ? format(date, DATE_FORMAT) : undefined;
}

function max(): string | undefined {
  if (props.disableFutureDates) {
    const maxDate = props.maxDate ?? new Date();
    return formatDate(maxDate);
  }

  return formatDate(props.maxDate);
}
</script>

<template>
  <input
    v-model="value$"
    :class="{ 'has-value': props.value }"
    class="datepicker"
    type="date"
    :min="formatDate(minDate)"
    :max="max()"
  />
</template>

<style src="./app-datepicker.scss" lang="scss" scoped></style>
