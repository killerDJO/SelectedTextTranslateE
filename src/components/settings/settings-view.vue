<script setup lang="ts">
import { onMounted, ref } from 'vue';

import type ConfirmModal from '~/components/shared/confirm-modal/confirm-modal.vue';

import SettingsHolder from './settings-holder/settings-holder.vue';
import HotkeySettings from './hotkeys-settings/hotkeys-settings.vue';
import ScalingSettings from './scaling-settings/scaling-settings.vue';
import PlaySettings from './play-settings/play-settings.vue';
import LanguageSettings from './language-settings/language-settings.vue';
import StartupSettings from './startup-settings/startup-settings.vue';
import { useSettingsStore } from './settings.store';

const settingsStore = useSettingsStore();

const confirmModalInstance = ref<InstanceType<typeof ConfirmModal> | null>(null);

onMounted(() => settingsStore.setup());
</script>

<template>
  <div class="settings">
    <div v-if="!!settingsStore.defaultSettings">
      <settings-holder :title="'Hotkeys'">
        <hotkey-settings />
      </settings-holder>
      <settings-holder :title="'Scaling'">
        <scaling-settings />
      </settings-holder>
      <settings-holder :title="'Play'">
        <play-settings />
      </settings-holder>
      <settings-holder :title="'Language'">
        <language-settings />
      </settings-holder>
      <settings-holder :title="'Startup'">
        <startup-settings />
      </settings-holder>
      <div class="footer">
        <link-button :text="'Reset to Default'" @click="confirmModalInstance?.open()" />
        <link-button :text="'Open Settings File'" @click="settingsStore.openSettingsFile()" />
      </div>
      <confirm-modal ref="confirmModalInstance" @confirm="settingsStore.resetSettings()">
        <template #header>Are you sure you want to reset all settings?</template>
        <template #body
          >You'll loose all settings (including manual settings file changes) permanently.</template
        >
      </confirm-modal>
    </div>
  </div>
</template>

<style src="./settings-view.scss" lang="scss" scoped></style>
