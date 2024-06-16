<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import { useAppStore } from '~/app.store';
import { settingsProvider } from '~/services/settings-provider.service';

import TranslationResult from './translation-result/translation-result.vue';
import TranslationInput from './translation-input/translation-input.vue';
import { useTranslateResultStore } from './translation-result/translation-result.store';
import { useTranslationStore } from './translation.store';
import type { TranslateRequest } from './models/requests.model';

const app = useAppStore();
const translateResult = useTranslateResultStore();
const translation = useTranslationStore();

const languages = ref(settingsProvider.getLanguages());

const isMissingTranslation = computed(() => {
  return (
    !!translateResult.translateDescriptor &&
    !translateResult.translateResult &&
    !translateResult.isTranslationInProgress
  );
});

onMounted(async () => {
  await translation.setup();
});

function archive() {
  translateResult.archive();
  translateResult.hide();
}
</script>

<template>
  <div class="translation">
    <translation-result
      v-if="
        translateResult.translateDescriptor &&
        (translateResult.translateResult || translateResult.isTranslationInProgress)
      "
      :default-view="translateResult.defaultTranslateResultView"
      :translate-result="translateResult.translateResult"
      :translate-descriptor="translateResult.translateDescriptor"
      :history-record="translateResult.historyRecord"
      :is-in-progress="translateResult.isTranslationInProgress"
      :settings="app.settings"
      :languages="languages"
      @translate-suggestion="translateResult.translateSuggestion()"
      @force-translation="translateResult.forceTranslation()"
      @archive="archive()"
      @unarchive="translateResult.unarchive()"
      @translate-text="(request: TranslateRequest) => translateResult.translateText(request)"
      @change-language="translateResult.changeLanguage()"
      @play-text="translateResult.playCurrentSentence()"
      @search="translateResult.search()"
      @set-starred-status="(isStarred: boolean) => translateResult.setStarredStatus(isStarred)"
      @update-tags="tags => translateResult.updateTags(tags)"
    />
    <template
      v-if="translation.showInput || translation.nonTextTranslation || isMissingTranslation"
    >
      <app-alert
        v-if="translation.nonTextTranslation"
        :dismissible="false"
        type="error"
        text="No text data selected"
        class="non-text-translation"
      ></app-alert>
      <translation-input
        :languages="languages"
        :translation-settings="app.settings.translation"
        @translate-text="request => translation.translateText(request)"
        @play-text="request => translateResult.playText(request)"
      />
    </template>
  </div>
</template>

<style src="./translation-view.scss" lang="scss" scoped></style>
