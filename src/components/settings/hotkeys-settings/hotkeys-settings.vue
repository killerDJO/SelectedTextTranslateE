<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { cloneDeep, isEqual } from 'lodash-es';

import { useSettingsStore } from '~/components/settings/settings.store';
import type {
  EditableHotkeySettings,
  GlobalHotkeySettings,
  LocalHotkeySettings
} from '~/components/settings/models/editable-hotkey-settings.model';
import type ConfirmModal from '~/components/shared/confirm-modal/confirm-modal.vue';
import { Keys } from '~/host/models/settings.model';

import HotkeyInput from './hotkey-input/hotkey-input.vue';

interface Command {
  readonly name: string;
  readonly key: string;
  readonly isGlobal: boolean;
  hotkeys: Keys[];
}

const settingsStore = useSettingsStore();

const hotkeysDisplayName = new Map<keyof LocalHotkeySettings | keyof GlobalHotkeySettings, string>([
  ['translate', 'Translate Text'],
  ['playText', 'Play Text'],
  ['showDefinition', 'Show Definition'],
  ['toggleDefinition', 'Toggle Definition View'],
  ['toggleTags', 'Toggle Tags Visibility'],
  ['addTag', 'Add Tag'],
  ['archiveResult', 'Archive Translate Result'],
  ['inputText', 'Input Text'],
  ['toggleSuspend', 'Toggle Suspended State'],
  ['zoomIn', 'Zoom In'],
  ['zoomOut', 'Zoom Out'],
  ['resetZoom', 'Reset Zoom']
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

watch(() => settingsStore.hotkeySettings, createCommandsList, { deep: true, immediate: true });
watch(() => currentHotkey, validateCurrentHotkey, { deep: true });

function createCommandsList(): void {
  commands.value = [];
  for (const [key, value] of hotkeysDisplayName) {
    const hotkeySettings = cloneDeep(getHotkeySetting(key, settingsStore.hotkeySettings));
    commands.value.push({
      name: value,
      key: key,
      hotkeys: hotkeySettings.hotkeys,
      isGlobal: hotkeySettings.isGlobal
    });
  }
}

function removeHotkey(hotkeyToRemove: Keys): void {
  if (!currentCommand.value) {
    return;
  }
  const newHotkeys: Keys[] = [];
  currentCommand.value.hotkeys.forEach(hotkey => {
    if (createHotkeyString(hotkey) !== createHotkeyString(hotkeyToRemove)) {
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

function createHotkeyString(hotkey: Keys): string {
  return hotkey.join(' + ');
}

function validateCurrentHotkey() {
  if (!currentHotkey.value) {
    currentHotkeyValidationMessage.value = null;
    return;
  }

  const currentHotkeyId = createHotkeyString(currentHotkey.value);
  for (const command of commands.value) {
    for (const hotkey of command.hotkeys) {
      if (createHotkeyString(hotkey) === currentHotkeyId) {
        currentHotkeyValidationMessage.value = `Hotkey conflicts with another one for the '${command.name}' command.`;
        return;
      }
    }
  }
  currentHotkeyValidationMessage.value = null;
}

function resetHotkeySettings(): void {
  settingsStore.updateHotkeys(settingsStore.defaultHotkeySettings);
}

function updateHotkeySettings(): void {
  const updatedHotkeySettings = cloneDeep(settingsStore.hotkeySettings);

  for (const command of commands.value) {
    const hotkeys = getHotkeySetting(command.key, updatedHotkeySettings).hotkeys;
    hotkeys.length = 0;
    hotkeys.push(...command.hotkeys);
  }

  if (!isEqual(updateHotkeySettings, settingsStore.hotkeySettings)) {
    settingsStore.updateHotkeys(updatedHotkeySettings);
  }
}

function getHotkeySetting(
  key: string,
  settings: EditableHotkeySettings
): { hotkeys: Keys[]; isGlobal: boolean } {
  const hotkeyTypes: Array<keyof EditableHotkeySettings> = ['global', 'local'];
  for (const hotkeyType of hotkeyTypes) {
    for (const currentKey of Object.keys(settings[hotkeyType])) {
      if (currentKey === key) {
        return {
          hotkeys:
            settings[hotkeyType][currentKey as keyof (LocalHotkeySettings | GlobalHotkeySettings)],
          isGlobal: hotkeyType === 'global'
        };
      }
    }
  }

  throw Error(`Unable to find key '${key}'.`);
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
          <template v-for="hotkey in currentCommand.hotkeys" :key="createHotkeyString(hotkey)">
            <div class="hotkeys-list-hotkey">{{ createHotkeyString(hotkey) }}</div>
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
