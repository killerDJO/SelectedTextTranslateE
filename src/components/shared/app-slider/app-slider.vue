<script setup lang="ts">
interface Props {
  minValue: number;
  maxValue: number;
  step: number;
  value: number;
}
defineProps<Props>();

defineEmits<{
  (e: 'update:value', value: number): void;
}>();
</script>

<template>
  <div class="slider-holder">
    <span class="range-value min-value">{{ $filters.percent(minValue) }}</span>
    <input
      type="range"
      :min="minValue"
      :max="maxValue"
      :value="value"
      :step="step"
      class="slider"
      @input="$emit('update:value', Number(($event.target as HTMLInputElement)!.value))"
    />
    <span class="range-value max-value">{{ $filters.percent(maxValue) }}</span>
  </div>
</template>

<style src="./app-slider.scss" lang="scss" scoped></style>
