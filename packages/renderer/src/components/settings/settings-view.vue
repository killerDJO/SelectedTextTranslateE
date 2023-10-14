<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import { SettingsGroup } from '@selected-text-translate/common';

import type ConfirmModal from '~/components/shared/confirm-modal/confirm-modal.vue';

import SettingsHolder from './settings-holder/settings-holder.vue';
import HotkeySettings from './hotkeys-settings/hotkeys-settings.vue';
import ScalingSettings from './scaling-settings/scaling-settings.vue';
import HistorySettings from './history-settings/history-settings.vue';
import PlaySettings from './play-settings/play-settings.vue';
import LanguageSettings from './language-settings/language-settings.vue';
import StartupSettings from './startup-settings/startup-settings.vue';
import { useSettingsStore } from './settings.store';

const settingsStore = useSettingsStore();

const confirmModalInstance = ref<InstanceType<typeof ConfirmModal> | null>(null);

onMounted(() => settingsStore.setup());
watch(() => settingsStore.currentSettingsGroup, onCurrentSettingsGroupChanged, { immediate: true });

function onCurrentSettingsGroupChanged(): void {
  if (settingsStore.currentSettingsGroup !== null) {
    const element = document.getElementById(settingsStore.currentSettingsGroup);
    element?.scrollIntoView({ behavior: 'smooth' });
  }
}
</script>

<template>
  <div class="settings">
    <div v-if="!!settingsStore.defaultSettings">
      <settings-holder :title="'Hotkeys'">
        <hotkey-settings :id="SettingsGroup.Hotkeys" />
      </settings-holder>
      <settings-holder :title="'Scaling'">
        <scaling-settings :id="SettingsGroup.Scaling" />
      </settings-holder>
      <settings-holder :title="'History'">
        <history-settings :id="SettingsGroup.History" />
      </settings-holder>
      <settings-holder :title="'Play'">
        <play-settings :id="SettingsGroup.Play" />
      </settings-holder>
      <settings-holder :title="'Language'">
        <language-settings :id="SettingsGroup.Language" />
      </settings-holder>
      <settings-holder :title="'Startup'">
        <startup-settings :id="SettingsGroup.Startup" />
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
