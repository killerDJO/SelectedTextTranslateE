<script setup lang="ts">
import { RouterView } from 'vue-router';
import { onMounted, ref, watch } from 'vue';

import GlobalErrors from './components/global-errors/global-errors.vue';
import { useAppStore } from './app.store';
import { useHistoryAuthStore } from './components/history/history-auth/history-auth.store';
import { hotkeysRegistry } from './services/hotkeys-registry.service';
import { hostApi } from './host/host-api.service';

const app = useAppStore();
const historyAuth = useHistoryAuthStore();
const isSetupCompleted = ref(false);
//123
onMounted(async () => {
  await app.setup();
  // Show window is called after setup to prevent flickering while webview is loading
  // Windows always start initially hidden and wait for the app to initialize before showing themselves
  await Promise.all([historyAuth.setup(), hostApi.view.showWindow()]);
  isSetupCompleted.value = true;
});

watch(
  () => (app.hasSettings ? app.settings : null),
  () => {
    if (app.hasSettings) {
      registerHotkeys();
    }
  },
  { immediate: true }
);

function registerHotkeys(): void {
  const GLOBAL_HOTKEYS_NAMESPACE = 'global';
  hotkeysRegistry.unregisterHotkeys(GLOBAL_HOTKEYS_NAMESPACE);

  const hotkeySettings = app.settings.hotkeys;
  hotkeysRegistry.registerHotkeys(GLOBAL_HOTKEYS_NAMESPACE, hotkeySettings.zoomIn, app.zoomIn);
  hotkeysRegistry.registerHotkeys(GLOBAL_HOTKEYS_NAMESPACE, hotkeySettings.zoomOut, app.zoomOut);
  hotkeysRegistry.registerHotkeys(
    GLOBAL_HOTKEYS_NAMESPACE,
    hotkeySettings.resetZoom,
    app.resetZoom
  );
}
</script>

<template>
  <div
    class="main"
    :style="{ 'border-color': app.accentColor }"
    :class="{ frameless: app.isFrameless }"
  >
    <div
      v-if="app.isFrameless"
      class="frameless-header"
      :style="{ 'background-color': app.accentColor }"
    />
    <global-errors></global-errors>
    <div v-if="isSetupCompleted" class="scroll-holder">
      <div class="view" :style="{ zoom: app.scaleFactor * 100 + '%' }">
        <RouterView></RouterView>
      </div>
    </div>
    <app-loader v-else :large="true" :style="{ zoom: app.scaleFactor * 100 + '%' }"></app-loader>
  </div>
</template>

<style src="./css/common.scss" lang="scss"></style>
<style src="./app.scss" lang="scss" scoped></style>
