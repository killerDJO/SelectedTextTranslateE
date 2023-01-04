<script setup lang="ts">
import { computed } from 'vue';

import { useSettingsStore } from '~/components/settings/settings.store';

const settingsStore = useSettingsStore();

const engineSettings = computed(() => settingsStore.settings.engine);
const playVolume = computed({
  get: () => engineSettings.value.playVolume,
  set: playVolume => settingsStore.updateSettings({ engine: { playVolume: playVolume } })
});
</script>

<template>
  <div class="play-input settings-item">
    <span class="current-play-volume"
      >Current Volume - {{ $filters.percent(engineSettings.playVolume) }}</span
    >
    <app-slider v-model:value.number="playVolume" :min-value="0" :max-value="100" :step="1" />
  </div>
</template>

<style src="./play-settings.scss" lang="scss" scoped></style>
