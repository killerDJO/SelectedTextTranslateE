<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { cloneDeep, isEmpty } from 'lodash-es';

import { useSettingsStore } from '~/components/settings/settings.store';
import type ConfirmModal from '~/components/shared/confirm-modal/confirm-modal.vue';
import { HotkeySettings, Keys } from '~/host/models/settings.model';

import HotkeyInput from './hotkey-input/hotkey-input.vue';

interface Command {
  readonly name: string;
  readonly key: keyof HotkeySettings;
  readonly isGlobal: boolean;
  hotkeys: Keys[];
}

const settingsStore = useSettingsStore();

const hotkeysConfiguration = new Map<keyof HotkeySettings, { name: string; global: boolean }>([
  ['translate', { name: 'Translate Text', global: true }],
  ['playText', { name: 'Play Text', global: true }],
  ['showDefinition', { name: 'Show Definition', global: true }],
  ['toggleDefinition', { name: 'Toggle Definition View', global: false }],
  ['toggleTags', { name: 'Toggle Tags Visibility', global: false }],
  ['addTag', { name: 'Add Tag', global: false }],
  ['archiveResult', { name: 'Archive Translate Result', global: false }],
  ['inputText', { name: 'Input Text', global: true }],
  ['toggleSuspend', { name: 'Toggle Suspended State', global: true }],
  ['zoomIn', { name: 'Zoom In', global: false }],
  ['zoomOut', { name: 'Zoom Out', global: false }],
  ['resetZoom', { name: 'Reset Zoom', global: false }]
]);

const commands = ref<Command[]>([]);
const currentCommandIndex = ref<number>(0);
const currentHotkey = ref<Keys | null>(null);
const currentHotkeyValidationMessage = ref<string | null>(null);
const confirmModalInstance = ref<InstanceType<typeof ConfirmModal> | null>(null);

const currentCommand = computed(() => commands.value[currentCommandIndex.value]);
const currentCommandKey = computed({
  get: () => currentCommand.value.key,
  set: (key: string) => {
    const currentCommand = commands.value.find(command => command.key === key);
    if (!currentCommand) {
      return;
    }
    currentCommandIndex.value = commands.value.indexOf(currentCommand);
  }
});
const isAddHotkeyEnabled = computed(
  () => !currentHotkeyValidationMessage.value && !!currentHotkey.value
);

watch(() => settingsStore.settings.hotkeys, createCommandsList, { deep: true, immediate: true });
watch(() => currentHotkey, validateCurrentHotkey, { deep: true });

function createCommandsList(): void {
  commands.value = [];
  for (const [key, config] of hotkeysConfiguration) {
    const keys = cloneDeep(settingsStore.settings.hotkeys[key]);
    commands.value.push({
      name: config.name,
      key: key,
      hotkeys: keys,
      isGlobal: config.global
    });
  }
}

function removeHotkey(hotkeyToRemove: Keys): void {
  if (!currentCommand.value) {
    return;
  }
  const newHotkeys: Keys[] = [];
  currentCommand.value.hotkeys.forEach(hotkey => {
    if (hotkeyToCanonicalString(hotkey) !== hotkeyToCanonicalString(hotkeyToRemove)) {
      newHotkeys.push(hotkey);
    }
  });
  currentCommand.value.hotkeys = newHotkeys;
  validateCurrentHotkey();
  updateHotkeySettings();
}

function addHotkey(): void {
  if (!currentCommand.value || !currentHotkey.value) {
    return;
  }
  currentCommand.value.hotkeys.push(currentHotkey.value);
  currentHotkey.value = null;
  updateHotkeySettings();
}

function hotkeyInputStarted(): void {
  settingsStore.pauseHotkeys();
}

function hotkeyInputCompleted(): void {
  settingsStore.enableHotkeys();
}

function validateCurrentHotkey() {
  if (!currentHotkey.value) {
    currentHotkeyValidationMessage.value = null;
    return;
  }

  const currentHotkeyId = hotkeyToCanonicalString(currentHotkey.value);
  for (const command of commands.value) {
    for (const hotkey of command.hotkeys) {
      if (hotkeyToCanonicalString(hotkey) === currentHotkeyId) {
        currentHotkeyValidationMessage.value = `Hotkey conflicts with another one for the '${command.name}' command.`;
        return;
      }
    }
  }
  currentHotkeyValidationMessage.value = null;
}

function resetHotkeySettings(): void {
  settingsStore.updateSettings({ hotkeys: settingsStore.defaultHotkeySettings });
}

function updateHotkeySettings(): void {
  const updatedHotkeySettings: Partial<HotkeySettings> = {};

  for (const command of commands.value) {
    const currentCombinations = hotkeysToCanonicalString(
      settingsStore.settings.hotkeys[command.key]
    );
    const updatedCombinations = hotkeysToCanonicalString(command.hotkeys);

    if (currentCombinations !== updatedCombinations) {
      updatedHotkeySettings[command.key] = command.hotkeys;
    }
  }

  if (!isEmpty(updatedHotkeySettings)) {
    settingsStore.updateSettings({ hotkeys: updatedHotkeySettings });
  }
}

function hotkeyToCanonicalString(hotkey: Keys): string {
  return hotkey.sort().join(' + ');
}

function hotkeysToCanonicalString(hotkeys: Keys[]): string {
  return hotkeys.map(hotkeyToCanonicalString).sort().join(',');
}
</script>

<template>
  <div class="hotkey-settings">
    <div class="settings-item">
      <div class="header">
        <select v-model="currentCommandKey" class="form-select command-selector">
          <option v-for="command in commands" :key="command.key" :value="command.key">
            {{ command.name }}
          </option>
        </select>
      </div>
      <div v-if="currentCommand !== null" class="hotkeys">
        <div v-show="currentCommand.isGlobal" class="global-hotkey-warning">
          <font-awesome-icon
            class="icon-attention"
            icon="triangle-exclamation"
            size="xs"
            title="Warning"
          />
          This hotkey is global and may conflict with hotkeys from other applications.
        </div>
        <div class="hotkeys-list">
          <div class="hotkeys-list-header">Combinations</div>
          <div class="hotkeys-list-header"></div>
          <template v-for="hotkey in currentCommand.hotkeys" :key="hotkeyToCanonicalString(hotkey)">
            <div class="hotkeys-list-hotkey">{{ hotkeyToCanonicalString(hotkey) }}</div>
            <div class="hotkeys-list-action">
              <icon-button class="remove-hotkey" title="Remove hotkey" @click="removeHotkey(hotkey)"
                ><font-awesome-icon icon="xmark" class="remove-icon"
              /></icon-button>
            </div>
          </template>
          <div v-if="currentCommand.hotkeys.length === 0" class="no-hotkeys">
            No combinations assigned
          </div>
        </div>
        <div class="hotkey-edit">
          <validated-field
            :errors="currentHotkeyValidationMessage ? [currentHotkeyValidationMessage] : []"
            class="hotkey-input-control"
          >
            <hotkey-input
              v-model:hotkey="currentHotkey"
              @input-started="hotkeyInputStarted"
              @input-completed="hotkeyInputCompleted"
            />
          </validated-field>
          <app-button
            class="add-hotkey button-small"
            :disabled="!isAddHotkeyEnabled"
            :text="'Add'"
            @click="addHotkey"
          />
        </div>
      </div>
    </div>
    <div class="settings-separator" />
    <link-button
      class="reset-hotkeys"
      :text="'Reset Hotkey Settings'"
      @click="confirmModalInstance?.open()"
    />
    <confirm-modal ref="confirmModalInstance" @confirm="resetHotkeySettings">
      <template #header>Are you sure you want to reset hotkeys?</template>
      <template #body>You'll loose all your current hotkeys settings permanently.</template>
    </confirm-modal>
  </div>
</template>

<style src="./hotkeys-settings.scss" lang="scss" scoped></style>
