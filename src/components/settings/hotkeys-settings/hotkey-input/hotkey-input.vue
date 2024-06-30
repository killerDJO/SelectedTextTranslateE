<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { isEqual } from 'lodash-es';

import { Keys } from '~/host/models/settings.model';

interface Props {
  hotkey: Keys | null;
}
const props = defineProps<Props>();

const $emit = defineEmits<{
  (e: 'input-started'): void;
  (e: 'input-completed'): void;
  (e: 'update:hotkey', hotkey: Keys | null): void;
}>();

const keys = ref<string[]>([]);
const isInputInProgress = ref(false);

const inputValue = computed(() => {
  return `${keys.value.join(' + ')}${isInputInProgress.value ? ' + ' : ''}`;
});

watch(
  () => props.hotkey,
  () => {
    keys.value = props.hotkey ?? [];
  }
);

function onKeyDown(event: KeyboardEvent): void {
  if (event.repeat) {
    return;
  }

  if (isNavigationSequence(keys.value.concat([event.key]))) {
    if (isInputInProgress.value) {
      keys.value = [];
      isInputInProgress.value = false;
    }
    return;
  }

  preventDefault(event);

  const modifierKey = isModifierKey(event);

  if (!isInputInProgress.value) {
    if (modifierKey) {
      keys.value = [];
      isInputInProgress.value = true;
    } else if (event.key === 'Backspace') {
      keys.value = [];
      notifyHotkeyUpdated();
      return;
    } else if (isStandaloneKey(event)) {
      keys.value = [getNormalizeKey(event)];
      notifyHotkeyUpdated();
      return;
    } else {
      return;
    }
  }

  if (modifierKey) {
    keys.value.push(event.key);
  } else {
    keys.value.push(getNormalizeKey(event));
    notifyHotkeyUpdated();
  }
}

function onFocus(): void {
  $emit('input-started');
}

function onBlur(): void {
  $emit('input-completed');
  handleCompletion();
}

function preventDefault(event: Event): void {
  event.preventDefault();
  event.stopImmediatePropagation();
}

function handleCompletion(): void {
  if (isInputInProgress.value) {
    keys.value = [];
    notifyHotkeyUpdated();
  }
}

function notifyHotkeyUpdated(): void {
  const hotkey: Keys | null = keys.value.length ? createHotkey() : null;
  $emit('update:hotkey', hotkey);
  isInputInProgress.value = false;
}

function getNormalizeKey(event: KeyboardEvent): string {
  return event.code;
}

function isModifierKey(event: KeyboardEvent): boolean {
  return event.key === 'Shift' || event.key === 'Control' || event.key === 'Alt';
}

function isStandaloneKey(event: KeyboardEvent): boolean {
  return event.key === 'Delete';
}

function createHotkey(): Keys {
  return keys.value.slice();
}

function isNavigationSequence(keys: string[]): boolean {
  const tabKey = 'Tab';
  const shiftKey = 'Shift';

  if (!isInputInProgress.value && keys.length >= 1 && keys[keys.length - 1] === tabKey) {
    return true;
  }

  return isEqual([shiftKey, tabKey], keys);
}
</script>

<template>
  <div class="hotkey-input">
    <input
      type="text"
      class="form-control"
      :value="inputValue"
      @keydown="onKeyDown"
      @keyup="handleCompletion"
      @focus="onFocus"
      @blur="onBlur"
      @drop="preventDefault"
    />
    <font-awesome-icon
      class="icon"
      icon="keyboard"
      size="xs"
      title="Press desired keys while focused on this field"
    />
  </div>
</template>

<style src="./hotkey-input.scss" lang="scss" scoped></style>
