<script setup lang="ts">
import { computed } from 'vue';

import { useSettingsStore } from '~/components/settings/settings.store';

const settingsStore = useSettingsStore();

const coreSettings = computed(() => settingsStore.settings.core);
const playVolume = computed({
  get: () => coreSettings.value.playVolume,
  set: playVolume => settingsStore.updateSettings({ core: { playVolume: playVolume } })
});
</script>

<template>
  <div class="play-input settings-item">
    <span class="current-play-volume"
      >Current Volume - {{ $filters.percent(coreSettings.playVolume) }}</span
    >
    <app-slider v-model:value.number="playVolume" :min-value="0" :max-value="100" :step="1" />
  </div>
</template>

<style src="./play-settings.scss" lang="scss" scoped></style>
