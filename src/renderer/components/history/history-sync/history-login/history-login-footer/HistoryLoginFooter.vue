<template>
  <div class="history-login-footer">
    <link-button @click="close" :text="'Cancel'" class="cancel" />
    <app-button @click="confirm" :text="confirmText" :disabled="disabled" />
  </div>
</template>

<script src="./HistoryLoginFooter.ts" lang="ts"></script>
<style src="./HistoryLoginFooter.scss" lang="scss" scoped></style>
