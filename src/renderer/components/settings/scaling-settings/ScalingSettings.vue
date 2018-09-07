<template>
  <settings-holder :title="'Scaling'" v-if="!!scalingState && !!currentScalingSettings">
    <div class="scaling-input settings-item">
      <span class="current-scale-factor">Current Scale Factor - {{scalingState.scaleFactor * 100 | percent}}</span>
      <slider
        :min-value="scalingState.minScaling * 100"
        :max-value="scalingState.maxScaling * 100"
        :step="scalingState.scalingStep * 100"
        v-model="scaleFactor" />
    </div>
    <div class="settings-separator"/>
    <span class="link-button" @click="resetScaleFactor">Set Default Scale Factor</span><span class="reset-label"> - change to {{scalingState.autoScaleFactor * 100 | percent}}</span>
    <div class="settings-separator"/>
    <div class="checkbox">
      <label>
        <input type="checkbox" v-model="currentScalingSettings.scaleTranslationViewOnly"><span>Scale Translation View Only</span>
      </label>
    </div>
  </settings-holder>
</template>

<script src="./ScalingSettings.ts" lang="ts"></script>
<style src="./ScalingSettings.scss" lang="scss" scoped></style>
