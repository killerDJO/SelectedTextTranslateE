<script setup lang="ts">
import { ref, watch } from 'vue';

import { useDrop } from '~/components/shared/use-drop.hook';

interface Props {
  suggestions: string[];
  tabIndex?: number;
  minLength?: number;
  autoFocus?: boolean;
  compactView?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  tabIndex: 0,
  minLength: 3,
  autoFocus: false,
  compactView: false
});

const $emit = defineEmits<{
  (e: 'get-suggestions', input: string): void;
  (e: 'input-changed', input: string): void;
  (e: 'input-selected', input: string): void;
}>();

const drop = useDrop();

const dropTarget = ref<HTMLElement>();
const dropContent = ref<HTMLElement>();
const input = ref('');
const selectedSuggestionsIndex = ref(-1);

watch(input, () => {
  $emit('input-changed', input.value);
  requestSuggestions();
});

watch(
  () => props.suggestions,
  suggestions => {
    if (suggestions.length > 0) {
      selectedSuggestionsIndex.value = -1;
      openDrop();
    } else {
      drop.closeDrop();
    }
  },
  { immediate: true }
);

function requestSuggestions() {
  if (input.value.length >= props.minLength) {
    $emit('get-suggestions', input.value);
  } else {
    drop.closeDrop();
  }
}

function selectNextSuggestion(): void {
  selectedSuggestionsIndex.value =
    selectedSuggestionsIndex.value === -1
      ? 0
      : (selectedSuggestionsIndex.value + 1) % props.suggestions.length;
}

function selectPreviousSuggestion(): void {
  if (selectedSuggestionsIndex.value === -1 || selectedSuggestionsIndex.value === 0) {
    selectedSuggestionsIndex.value = props.suggestions.length - 1;
  } else {
    selectedSuggestionsIndex.value = selectedSuggestionsIndex.value - 1;
  }
}

function openDrop(): void {
  drop.openDropInternal(
    dropTarget.value as HTMLElement,
    dropContent.value as HTMLElement,
    'bottom-start',
    []
  );
}

function onSelected() {
  if (selectedSuggestionsIndex.value !== -1) {
    $emit('input-selected', props.suggestions[selectedSuggestionsIndex.value]);
    selectedSuggestionsIndex.value = -1;
  } else {
    $emit('input-selected', input.value);
  }

  drop.closeDrop();
}

function suggestionClick(suggestion: string): void {
  $emit('input-selected', suggestion);
  drop.closeDrop();
}

function isSuggestionSelected(suggestion: string): boolean {
  if (selectedSuggestionsIndex.value === -1) {
    return false;
  }

  return props.suggestions[selectedSuggestionsIndex.value] === suggestion;
}
</script>

<template>
  <div
    ref="dropTarget"
    v-focus-lost="() => drop.closeDrop()"
    class="drop-wrapper"
    :class="{ compact: compactView }"
  >
    <input
      v-model="input"
      v-auto-focus="autoFocus"
      type="text"
      @keydown.enter="onSelected"
      @keydown.up="selectPreviousSuggestion"
      @keydown.down="selectNextSuggestion"
    />

    <div ref="dropContent" class="drop-content">
      <ul v-if="drop.isDropContentVisible.value" class="drop-items">
        <li
          v-for="suggestion in suggestions"
          :key="suggestion"
          class="drop-item"
          :class="{ selected: isSuggestionSelected(suggestion) }"
          tabindex="-1"
          @click="suggestionClick(suggestion)"
        >
          {{ suggestion }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style src="./app-typeahead.scss" lang="scss" scoped></style>
