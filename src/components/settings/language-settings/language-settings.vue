<script setup lang="ts">
import { computed, ref } from 'vue';

import type { SelectedLanguages } from '~/components/shared/language-selector/language-selector.vue';
import { useSettingsStore } from '~/components/settings/settings.store';
import { settingsProvider } from '~/services/settings-provider.service';

const settingsStore = useSettingsStore();

const languageSettings = computed(() => settingsStore.settings.translation);
const languages = ref(settingsProvider.getLanguages());

function onLanguagesUpdated(languages: SelectedLanguages) {
  if (languages.sourceLanguage === undefined || languages.targetLanguage === undefined) {
    throw new Error('Language must be selected');
  }

  settingsStore.updateSettings({
    translation: {
      sourceLanguage: languages.sourceLanguage,
      targetLanguage: languages.targetLanguage
    }
  });
}
</script>

<template>
  <div class="language-input settings-item">
    <language-selector
      :languages="languageSettings"
      :all-languages="languages"
      @languages-updated="onLanguagesUpdated"
    />
  </div>
</template>
