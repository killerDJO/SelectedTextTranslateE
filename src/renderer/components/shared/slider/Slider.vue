<template>
  <div class="slider-holder">
        <span class="range-value min-value">{{minValue | percent}}</span>
        <input type="range"
          v-tab-index
          :min="minValue"
          :max="maxValue"
          :value="value"
          @input="$emit('input', $event.target.value)"
          :step="step"
          class="slider">
        <span class="range-value max-value">{{maxValue | percent}}</span>
      </div>
</template>

<script src="./Slider.ts" lang="ts"></script>
<style src="./Slider.scss" lang="scss" scoped></style>
