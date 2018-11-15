<template>
  <div v-if="!!scalingState && !!currentScalingSettings">
    <div class="scaling-input settings-item">
      <span class="current-scale-factor">Current Scale Factor - {{scalingState.scaleFactor * 100 | percent}}</span>
      <slider
        :min-value="scalingState.minScaling * 100"
        :max-value="scalingState.maxScaling * 100"
        :step="scalingState.scalingStep * 100"
        v-model="scaleFactor" />
    </div>
    <div class="settings-separator"/>
    <div>
      <link-button @click="resetScaleFactor" :text="'Set Default Scale Factor'" /><span class="reset-label"> - change to {{scalingState.autoScaleFactor * 100 | percent}}</span>
    </div>
    <div class="settings-separator"/>
    <checkbox v-model="currentScalingSettings.scaleTranslationViewOnly" :label="'Scale translation view only'" />
  </div>
</template>

<script src="./ScalingSettings.ts" lang="ts"></script>
<style src="./ScalingSettings.scss" lang="scss" scoped></style>
