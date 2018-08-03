<template>
  <settings-holder :title="'Scaling'" v-if="!!scalingState && !!currentScalingSettings">
    <div class="scaling-input">
      <span>Current Scale Factor - {{scalingState.scaleFactor * 100 | percent}}</span>
      <slider
        :min-value="scalingState.minScaling * 100"
        :max-value="scalingState.maxScaling * 100"
        :step="scalingState.scalingStep * 100"
        v-model="scaleFactor" />
      <span class="link-button" @click="resetScaleFactor">Set Default Scale Factor</span>
    </div>
    <div class="checkbox">
      <label>
        <input type="checkbox" v-model="currentScalingSettings.scaleTranslationViewOnly"> Scale Translation View Only
      </label>
    </div>
  </settings-holder>
</template>

<script src="./ScalingSettings.ts" lang="ts"></script>
<style src="./ScalingSettings.scss" lang="scss" scoped></style>
