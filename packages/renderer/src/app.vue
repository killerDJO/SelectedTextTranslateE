<script setup lang="ts">
import { RouterView } from 'vue-router';
import { onMounted, ref, watch } from 'vue';

import type { Hotkey } from '@selected-text-translate/common/settings/Settings';

import GlobalErrors from './components/global-errors/global-errors.vue';
import { useAppStore } from './app.store';
import { useHistoryAuthStore } from './components/history/history-auth/history-auth.store';
import { hotkeysRegistry } from './services/hotkeys-registry';

const app = useAppStore();
const historyAuth = useHistoryAuthStore();
const isSetupCompleted = ref(false);

onMounted(async () => {
  await app.setup();

  historyAuth.setup();
  registerDevToolsHotkey();

  isSetupCompleted.value = true;

  await window.mainAPI.core.notifyViewReady();
});

watch(
  isSetupCompleted,
  () => {
    if (isSetupCompleted.value) {
      registerHotkeys();
    }
  },
  { immediate: true }
);

function registerHotkeys(): void {
  const GLOBAL_HOTKEYS_NAMESPACE = 'global';
  hotkeysRegistry.unregisterHotkeys(GLOBAL_HOTKEYS_NAMESPACE);

  const hotkeySettings = app.settings.renderer.hotkeys;
  hotkeysRegistry.registerHotkeys(GLOBAL_HOTKEYS_NAMESPACE, hotkeySettings.zoomIn, app.zoomIn);
  hotkeysRegistry.registerHotkeys(GLOBAL_HOTKEYS_NAMESPACE, hotkeySettings.zoomOut, app.zoomOut);
  hotkeysRegistry.registerHotkeys(
    GLOBAL_HOTKEYS_NAMESPACE,
    hotkeySettings.resetZoom,
    app.resetZoom
  );
}

function registerDevToolsHotkey(): void {
  const devToolsHotkey: Hotkey = { keys: ['ctrl', 'shift', 'i'] };
  hotkeysRegistry.registerHotkeys('devtools', [devToolsHotkey], () => app.openDevTools());
}
</script>

<template>
  <div
    class="main"
    :style="{ 'border-color': '#' + app.accentColor }"
    :class="{ frameless: app.isFrameless }"
  >
    <div
      v-if="app.isFrameless"
      class="frameless-header"
      :style="{ 'background-color': '#' + app.accentColor }"
    />
    <global-errors></global-errors>
    <div v-if="isSetupCompleted" class="scroll-holder">
      <div class="view" :style="{ zoom: app.scaleFactor * 100 + '%' }">
        <RouterView></RouterView>
      </div>
    </div>
  </div>
</template>

<style src="./css/common.scss" lang="scss"></style>
<style src="./app.scss" lang="scss" scoped></style>
