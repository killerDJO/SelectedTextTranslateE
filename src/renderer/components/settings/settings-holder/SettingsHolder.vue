<template>
  <div class="settings-holder">
    <div class="settings-title">{{title}}</div>
    <div class="holder">
      <slot />
    </div>
  </div>
</template>

<script src="./SettingsHolder.ts" lang="ts"></script>
<style src="./SettingsHolder.scss" lang="scss" scoped></style>
