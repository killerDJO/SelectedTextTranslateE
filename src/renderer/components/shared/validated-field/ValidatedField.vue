<template>
  <div class="validated-field" v-tooltip="{'value': validationMessage, 'showOnFocus': '.content input'}" :class="{'error': hasValidationMessage}">
    <div class="content">
      <slot />
    </div>
  </div>
</template>

<script src="./ValidatedField.ts" lang="ts"></script>
<style src="./ValidatedField.scss" lang="scss" scoped></style>
