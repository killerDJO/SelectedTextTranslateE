<script setup lang="ts">
import { computed } from 'vue';

import { useSettingsStore } from '~/components/settings/settings.store';

const settingsStore = useSettingsStore();

const startupState = computed({
  get: () => settingsStore.isStartupEnabled,
  set: isEnabled => settingsStore.updateStartupState(isEnabled)
});
</script>
<template>
  <div class="settings-item">
    <app-checkbox v-model:value="startupState" :label="'Launch when system starts'" />
  </div>
</template>
