<template>
  <span @click.stop="click" class="toggle-button-wrapper">
    <button class="toggle-button" :class="{'active': isActive}" @click.stop="click" tabindex="-1">{{text}}</button>
  </span>
</template>

<script src="./ToggleButton.ts" lang="ts"></script>
<style src="./ToggleButton.scss" lang="scss" scoped></style>