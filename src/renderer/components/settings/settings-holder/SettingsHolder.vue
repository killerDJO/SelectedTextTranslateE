<template>
  <div class="settings-holder">
    <div class="header" :class="{'collapsed': !isExpanded}" @click="toggleExpandedState">
      <span class="icon icon-up-open" v-if="isExpanded"></span>
      <span class="icon icon-down-open" v-else></span>
      {{title}}
    </div>
    <div class="holder" v-show="isExpanded">
      <slot />
    </div>
  </div>
</template>

<script src="./SettingsHolder.ts" lang="ts"></script>
<style src="./SettingsHolder.scss" lang="scss" scoped></style>
