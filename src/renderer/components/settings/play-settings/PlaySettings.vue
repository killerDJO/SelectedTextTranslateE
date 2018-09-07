<template>
  <settings-holder :title="'Play'">
    <div class="play-input settings-item">
      <span class="current-play-volume">Current Volume - {{currentPlaySettings.playVolume | percent}}</span>
      <slider
        :min-value="0"
        :max-value="100"
        :step="1"
        v-model.number="currentPlaySettings.playVolume" />
    </div>
  </settings-holder>
</template>

<script src="./PlaySettings.ts" lang="ts"></script>
<style src="./PlaySettings.scss" lang="scss" scoped></style>