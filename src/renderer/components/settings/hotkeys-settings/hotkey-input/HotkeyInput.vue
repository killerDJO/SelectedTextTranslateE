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
      @drop="preventDefault"/>
    <span class="icon icon-keyboard"></span>
  </div>
</template>

<script src="./HotkeyInput.ts" lang="ts"></script>
<style src="./HotkeyInput.scss" lang="scss" scoped></style>
