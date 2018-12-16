<template>
  <span v-tab-index="disabled ? - 1 : 0" @click.stop="click" class="app-button-wrapper">
    <button class="app-button" :class="{'primary': isPrimary}" @click.stop="click" :disabled="disabled" tabindex="-1">{{text}}</button>
  </span>
</template>

<script src="./AppButton.ts" lang="ts"></script>
<style src="./AppButton.scss" lang="scss" scoped></style>