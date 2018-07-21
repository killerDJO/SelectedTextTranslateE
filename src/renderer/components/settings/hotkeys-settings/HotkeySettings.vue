<template>
  <div class="hotkey-settings">
    <div class="header">
      <p class="title">Command:</p>
      <select class="form-control command-selector" v-model="currentCommandKey">
        <option v-for="command in commands" :value="command.key" :key="command.key">
          {{ command.name }}
        </option>
      </select>
    </div>
    <div v-if="currentCommand !== null">
      <div>
        <table class="table-striped non-clickable hotkeys-list">
          <thead>
            <tr>
              <th class="hotkey-column">Hotkey</th>
              <th class="action-column"></th>
            </tr>
          </thead>
          <tbody>
            <tr class="hotkey" v-for="hotkey in currentCommand.hotkeys" :key="createHotkeyString(hotkey)">
              <td class="hotkey-column">{{createHotkeyString(hotkey)}}</td>
              <td class="action-column"><span class="icon icon-cancel remove-hotkey" title="Remove hotkey" @click="removeHotkey(hotkey)"></span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="hotkey-edit">
        <hotkey-input class="hotkey-input-control" :hotkey.sync="currentHotkey" @input-started="hotkeyInputStarted" @input-completed="hotkeyInputCompleted"/>
        <button class="btn btn-mini btn-default add-hotkey" @click="addHotkey">Add</button>
      </div>
    </div>
  </div>
</template>

<script src="./HotkeySettings.ts" lang="ts"></script>
<style src="./HotkeySettings.scss" lang="scss" scoped></style>
