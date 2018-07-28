<template>
  <div class="slider-holder">
        <span class="range-value min-value">{{minValue}}</span>
        <input type="range" 
          :min="minValue"
          :max="maxValue"
          :value="value"
          @input="$emit('input', $event.target.value)"
          :step="step"
          class="slider">
        <span class="range-value max-value">{{maxValue}}</span>
      </div>
</template>

<script src="./Slider.ts" lang="ts"></script>
<style src="./Slider.scss" lang="scss" scoped></style>
