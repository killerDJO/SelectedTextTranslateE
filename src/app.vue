<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import GlobalErrors from './components/global-errors/global-errors.vue';
import { useAppStore } from './app.store';
import { useHistoryAuthStore } from './components/history/history-auth/history-auth.store';
import { hotkeysRegistry } from './services/hotkeys-registry.service';
import { hostApi } from './host/host-api.service';
import TranslationView from './components/translation/translation-view.vue';
import HistoryView from './components/history/history-view.vue';
import SettingsView from './components/settings/settings-view.vue';
import AboutView from './components/about/about-view.vue';
import { ViewNames } from './host/models/views.model';

const app = useAppStore();
const historyAuth = useHistoryAuthStore();
const isSetupCompleted = ref(false);

const viewName = ref(app.viewName);

onMounted(async () => {
  await app.setup();
  // Show window is called after setup to prevent flickering while webview is loading
  // Windows always start initially hidden and wait for the app to initialize before showing themselves
  if (hostApi.view.shouldShowOnLoad()) {
    hostApi.view.showWindowOnLoad();
  }

  await historyAuth.setup();

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
  <div v-if="app.isFrameless" class="drag-control" data-tauri-drag-region></div>
  <div
    class="main"
    :style="{ 'border-color': app.accentColor }"
    :class="{ frameless: app.isFrameless }"
  >
    <div
      v-if="app.isFrameless"
      class="frameless-header"
      :style="{ 'background-color': app.accentColor }"
      data-tauri-drag-region
    />

    <global-errors></global-errors>
    <div v-if="isSetupCompleted" class="scroll-holder">
      <div class="view" :style="{ zoom: app.scaleFactor * 100 + '%' }">
        <TranslationView v-if="viewName === ViewNames.Translation" />
        <HistoryView v-if="viewName === ViewNames.History" />
        <SettingsView v-if="viewName === ViewNames.Settings" />
        <AboutView v-if="viewName === ViewNames.About" />
      </div>
    </div>
    <app-loader v-else :large="true" :style="{ zoom: app.scaleFactor * 100 + '%' }"></app-loader>
  </div>
</template>

<style src="./css/common.scss" lang="scss"></style>
<style src="./app.scss" lang="scss" scoped></style>
