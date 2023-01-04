<script setup lang="ts">
import { computed } from 'vue';

import type { ScalingSettings } from '@selected-text-translate/common/settings/settings';

import { useSettingsStore } from '../settings.store';

const settingsStore = useSettingsStore();

const scalingSettings = computed(() => settingsStore.settings.scaling);

const scaleFactor = computed({
  get: () => scalingSettings.value.scaleFactor * 100,
  set: scaleFactor => updateScalingSettings({ scaleFactor: scaleFactor / 100 })
});

const scaleTranslationViewOnly = computed({
  get: () => scalingSettings.value.scaleTranslationViewOnly,
  set: scaleTranslationViewOnly => updateScalingSettings({ scaleTranslationViewOnly })
});

function updateScalingSettings(settings: Partial<ScalingSettings>) {
  settingsStore.updateSettings({ scaling: { ...scalingSettings.value, ...settings } });
}

function getAutoScaleFactor(): number {
  const verticalResolutionBaseline = scalingSettings.value.verticalResolutionBaseline;
  const verticalResolution = screen.height;
  return verticalResolution / verticalResolutionBaseline;
}

function resetScaleFactor() {
  updateScalingSettings({ scaleFactor: getAutoScaleFactor() });
}
</script>
<template>
  <div>
    <div class="scaling-input settings-item">
      <span class="current-scale-factor"
        >Current Scale Factor - {{ $filters.percent(scalingSettings.scaleFactor * 100) }}</span
      >
      <app-slider
        v-model:value="scaleFactor"
        :min-value="scalingSettings.minScaling * 100"
        :max-value="scalingSettings.maxScaling * 100"
        :step="scalingSettings.scalingStep * 100"
      />
    </div>
    <div class="settings-separator" />
    <div class="reset-controls">
      <link-button :text="'Set Default Scale Factor'" @click="resetScaleFactor" /><span
        class="reset-label"
      >
        - change to {{ $filters.percent(getAutoScaleFactor() * 100) }}</span
      >
    </div>
    <div class="settings-separator" />
    <app-checkbox v-model:value="scaleTranslationViewOnly" :label="'Scale translation view only'" />
  </div>
</template>

<style src="./scaling-settings.scss" lang="scss" scoped></style>
