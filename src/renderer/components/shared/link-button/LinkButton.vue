<template>
  <span v-tab-index="tabIndex" @click.stop="click" class="link-button-wrapper">
    <a class="link" @click.stop="click" tabindex="-1">{{text}}</a>
  </span>
</template>

<script src="./LinkButton.ts" lang="ts"></script>
<style src="./LinkButton.scss" lang="scss" scoped></style>