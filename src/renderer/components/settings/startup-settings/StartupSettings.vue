<template>
  <div class="settings-item">
    <checkbox v-model="startupState" :label="'Launch when system starts'" />
  </div>
</template>

<script src="./StartupSettings.ts" lang="ts"></script>
<style src="./StartupSettings.scss" lang="scss" scoped></style>