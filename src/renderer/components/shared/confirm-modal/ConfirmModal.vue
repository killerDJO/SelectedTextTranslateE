<template>
  <modal :show.sync="show$">
    <span slot="header"><slot name="header" /></span>
    <span slot="body"><div class="confirm-modal-body"><slot name="body" /></div></span>
    <div slot="footer">
      <div class="confirm-modal-footer clearfix">
          <link-button @click="close" :text="'Cancel'" class="cancel" />
          <app-button @click="confirm" :text="confirmText" />
      </div>
    </div>
  </modal>
</template>

<script src="./ConfirmModal.ts" lang="ts"></script>
<style src="./ConfirmModal.scss" lang="scss" scoped></style>
