<script setup lang="ts">
import { RouterView } from 'vue-router';
import { onMounted, ref, watch } from 'vue';

import type { Hotkey } from '@selected-text-translate/common/settings/Settings';

import GlobalErrors from './components/global-errors/global-errors.vue';
import { useAppStore } from './app.store';
import { useHistoryAuthStore } from './components/history/history-auth/history-auth.store';
import { hotkeysRegistry } from './services/hotkeys-registry';

const appStore = useAppStore();
const historyAuthStore = useHistoryAuthStore();
const isSetupCompleted = ref(false);

onMounted(async () => {
  await appStore.setup();

  historyAuthStore.setup();
  registerDevToolsHotkey();

  isSetupCompleted.value = true;

  await window.mainAPI.core.notifyViewReady();
});

watch(
  () => appStore._settings,
  () => {
    if (appStore.hasSettings) {
      registerHotkeys();
    }
  },
  { immediate: true }
);

function registerHotkeys(): void {
  const GLOBAL_HOTKEYS_NAMESPACE = 'global';
  hotkeysRegistry.unregisterHotkeys(GLOBAL_HOTKEYS_NAMESPACE);

  const hotkeySettings = appStore.settings.renderer.hotkeys;
  hotkeysRegistry.registerHotkeys(GLOBAL_HOTKEYS_NAMESPACE, hotkeySettings.zoomIn, appStore.zoomIn);
  hotkeysRegistry.registerHotkeys(
    GLOBAL_HOTKEYS_NAMESPACE,
    hotkeySettings.zoomOut,
    appStore.zoomOut
  );
  hotkeysRegistry.registerHotkeys(
    GLOBAL_HOTKEYS_NAMESPACE,
    hotkeySettings.resetZoom,
    appStore.resetZoom
  );
}

function registerDevToolsHotkey(): void {
  const devToolsHotkey: Hotkey = { keys: ['ctrl', 'shift', 'i'] };
  hotkeysRegistry.registerHotkeys('devtools', [devToolsHotkey], () => appStore.openDevTools());
}
</script>

<template>
  <div
    class="main"
    :style="{ 'border-color': '#' + appStore.accentColor }"
    :class="{ frameless: appStore.isFrameless }"
  >
    <div
      v-if="appStore.isFrameless"
      class="frameless-header"
      :style="{ 'background-color': '#' + appStore.accentColor }"
    />
    <global-errors></global-errors>
    <div v-if="isSetupCompleted" class="scroll-holder">
      <div class="view" :style="{ zoom: appStore.scaleFactor * 100 + '%' }">
        <RouterView></RouterView>
      </div>
    </div>
  </div>
</template>

<style src="./css/common.scss" lang="scss"></style>
<style src="./app.scss" lang="scss" scoped></style>
