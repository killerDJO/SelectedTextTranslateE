<script setup lang="ts">
import { computed } from 'vue';

import type { SelectedLanguages } from '~/components/shared/language-selector/language-selector.vue';
import { useSettingsStore } from '~/components/settings/settings.store';

const settingsStore = useSettingsStore();

const languageSettings = computed(() => settingsStore.settings.language);

function onLanguagesUpdated(languages: SelectedLanguages) {
  if (languages.sourceLanguage === undefined || languages.targetLanguage === undefined) {
    throw new Error('Language must be selected');
  }

  settingsStore.updateSettings({
    language: { sourceLanguage: languages.sourceLanguage, targetLanguage: languages.targetLanguage }
  });
}
</script>

<template>
  <div class="language-input settings-item">
    <language-selector
      :languages="languageSettings"
      :all-languages="settingsStore.settings.supportedLanguages"
      @languages-updated="onLanguagesUpdated"
    />
  </div>
</template>

<style src="./language-settings.scss" lang="scss" scoped></style>
