<script setup lang="ts">
import { watch } from 'vue';

import type {
  Tag,
  TranslateResultRendererSettings
} from '@selected-text-translate/common/settings/Settings';

import type { TranslateResultViews } from '~/components/translation/models/translate-result-views';
import type { HistoryRecord } from '~/components/history/models/history-record';
import type { TranslateRequest } from '../models/requests';
import type { TranslateResult, TranslateDescriptor } from '../models/translation';
import { hotkeysRegistry } from '~/services/hotkeys-registry';

import TranslationResultHeader from './header/translation-result-header.vue';
import TranslationResultContent from './content/translation-result-content.vue';

interface Props {
  translateDescriptor: TranslateDescriptor;
  translateResult?: TranslateResult;
  historyRecord?: HistoryRecord;
  settings: TranslateResultRendererSettings;
  defaultView: TranslateResultViews;
  isInProgress: boolean;
  languages: Map<string, string>;
  isEmbedded: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isEmbedded: false,
  translateResult: undefined,
  historyRecord: undefined
});

const $emit = defineEmits<{
  (e: 'play-text'): void;
  (e: 'translate-text', request: TranslateRequest): void;
  (e: 'translate-suggestion'): void;
  (e: 'force-translation'): void;
  (e: 'set-starred-status', isStarred: boolean): void;
  (e: 'archive', historyRecord: HistoryRecord): void;
  (e: 'change-language'): void;
  (e: 'search'): void;
  (e: 'translate', text: string): void;
  (e: 'refresh-translation'): void;
  (e: 'update-tags', tags: ReadonlyArray<Tag>): void;
}>();

watch(
  () => props.settings,
  () => {
    const TRANSLATE_RESULT_HOTKEY_NAMESPACE = 'translate-result';
    hotkeysRegistry.unregisterHotkeys(TRANSLATE_RESULT_HOTKEY_NAMESPACE);

    hotkeysRegistry.registerHotkeys(
      TRANSLATE_RESULT_HOTKEY_NAMESPACE,
      props.settings.archiveResultHotkey,
      () => {
        if (props.historyRecord) {
          $emit('archive', props.historyRecord);
        }
      }
    );
  },
  { immediate: true }
);

function translateText(text: string): void {
  const request: TranslateRequest = {
    sentence: text,
    isForcedTranslation: false,
    refreshCache: false,
    sourceLanguage: props.translateDescriptor.sourceLanguage,
    targetLanguage: props.translateDescriptor.targetLanguage
  };
  $emit('translate-text', request);
}
</script>

<template>
  <div class="translate-result">
    <app-loader v-if="isInProgress" :large="true"></app-loader>
    <div v-if="!isInProgress && translateResult" class="translate-result-items">
      <translation-result-header
        :translate-result="translateResult"
        :history-record="historyRecord"
        :is-embedded="isEmbedded"
        @translate-suggestion="$emit('translate-suggestion')"
        @force-translation="$emit('force-translation')"
        @translate-text="text => translateText(text)"
        @play-text="$emit('play-text')"
        @set-starred-status="isStarred => $emit('set-starred-status', isStarred)"
      />
      <translation-result-content
        :translate-result="translateResult"
        :history-record="historyRecord"
        :translate-descriptor="translateDescriptor"
        :settings="settings"
        :default-view="defaultView"
        :is-embedded="isEmbedded"
        :languages="languages"
        @search="$emit('search')"
        @translate="text => translateText(text)"
        @change-language="$emit('change-language')"
        @refresh-translation="$emit('refresh-translation')"
        @update-tags="tags => $emit('update-tags', tags)"
      />
    </div>
    <div v-if="!isInProgress && !translateResult" class="no-results">No results</div>
  </div>
</template>

<style src="./translation-result.scss" lang="scss" scoped></style>
