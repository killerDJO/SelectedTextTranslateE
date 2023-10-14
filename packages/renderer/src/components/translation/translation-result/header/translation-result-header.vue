<script setup lang="ts">
import { computed } from 'vue';

import type { HistoryRecord } from '~/components/history/models/history-record.model';
import type { TranslateResult } from '~/components/translation/models/translation.model';

interface Props {
  translateResult: TranslateResult;
  historyRecord?: HistoryRecord;
  isEmbedded: boolean;
}
const props = defineProps<Props>();

const $emit = defineEmits<{
  (e: 'play-text'): void;
  (e: 'translate-suggestion'): void;
  (e: 'force-translation'): void;
  (e: 'set-starred-status', isStarred: boolean): void;
  (e: 'translate-text', text: string): void;
}>();

const sentence = computed(() => props.translateResult.sentence);
const isInputCorrected = computed(() => {
  if (sentence.value.origin === null) {
    return false;
  }

  return sentence.value.input.trim() !== sentence.value.origin.trim();
});
const hasSuggestion = computed(() => !isInputCorrected.value && !!sentence.value.suggestion);

function translateText(text: string): void {
  if (text !== sentence.value.origin && !!text) {
    $emit('translate-text', text);
  }
}
</script>

<template>
  <div class="header" :class="{ 'is-embedded': isEmbedded }">
    <div v-if="historyRecord" class="translation-actions">
      <icon-button
        v-if="historyRecord?.isStarred"
        :title="'Unmark Translation'"
        class="star-button"
        @click="$emit('set-starred-status', false)"
      >
        <font-awesome-icon icon="star" class="icon-star" size="xs" />
      </icon-button>
      <icon-button
        v-else
        :title="'Mark Translation'"
        class="star-button"
        @click="$emit('set-starred-status', true)"
      >
        <font-awesome-icon :icon="['far', 'star']" size="xs" class="icon-star-empty" />
      </icon-button>
    </div>
    <div class="translation" :class="{ 'no-actions': !historyRecord }">
      <span v-if="!!sentence.translation">
        {{ sentence.translation }}
      </span>
      <span v-else class="no-translation"> No Translation </span>
    </div>
    <div class="play-text">
      <icon-button :title="'Play Origin'" @click="$emit('play-text')">
        <play-icon class="play-icon"></play-icon>
      </icon-button>
    </div>
    <div class="origin-holder">
      <div
        class="origin"
        contenteditable="true"
        tabindex="0"
        @blur="translateText(($event.target as HTMLDivElement).innerText)"
        @keydown.enter.prevent="translateText(($event.target as HTMLDivElement).innerText)"
      >
        {{ translateResult.sentence.origin }}
      </div>
      <div class="origin-actions">
        <span v-if="isInputCorrected"
          >(corrected from
          <link-button :text="sentence.input" @click="$emit('force-translation')" />)</span
        >
        <span v-if="hasSuggestion"
          >(maybe you meant
          <link-button
            :text="sentence.suggestion ?? ''"
            @click="$emit('translate-suggestion')"
          />)</span
        >
        <span v-if="!!sentence.transcription">[{{ sentence.transcription }}]</span>
      </div>
    </div>
  </div>
</template>

<style src="./translation-result-header.scss" lang="scss" scoped></style>
