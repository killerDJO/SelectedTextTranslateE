<script setup lang="ts">
import { watch } from 'vue';

import type { TranslateResultViews } from '~/components/translation/models/translate-result-views.enum';
import type { HistoryRecord } from '~/components/history/models/history-record.model';
import type { TranslateRequest } from '~/components/translation/models/requests.model';
import type {
  TranslateResult,
  TranslateDescriptor
} from '~/components/translation/models/translation.model';
import { hotkeysRegistry } from '~/services/hotkeys-registry.service';
import { Settings, Tag } from '~/host/models/settings.model';

import TranslationResultHeader from './header/translation-result-header.vue';
import TranslationResultContent from './content/translation-result-content.vue';

interface Props {
  translateDescriptor: TranslateDescriptor;
  translateResult?: TranslateResult;
  historyRecord?: HistoryRecord;
  settings: Settings;
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
  'play-text': [];
  'translate-text': [request: TranslateRequest];
  'translate-suggestion': [];
  'force-translation': [];
  'set-starred-status': [isStarred: boolean];
  'change-language': [];
  search: [];
  translate: [text: string];
  'hard-delete': [];
  archive: [];
  unarchive: [];
  'update-tags': [tags: ReadonlyArray<Tag>];
}>();

watch(
  () => props.settings,
  () => {
    const TRANSLATE_RESULT_HOTKEY_NAMESPACE = 'translate-result';
    hotkeysRegistry.unregisterHotkeys(TRANSLATE_RESULT_HOTKEY_NAMESPACE);

    hotkeysRegistry.registerHotkeys(
      TRANSLATE_RESULT_HOTKEY_NAMESPACE,
      props.settings.hotkeys.archiveResult,
      () => {
        if (props.historyRecord) {
          $emit('archive');
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
        @hard-delete="$emit('hard-delete')"
        @archive="$emit('archive')"
        @unarchive="$emit('unarchive')"
        @update-tags="tags => $emit('update-tags', tags)"
      />
    </div>
    <div v-if="!isInProgress && !translateResult" class="no-results">No results</div>
  </div>
</template>

<style src="./translation-result.scss" lang="scss" scoped></style>
