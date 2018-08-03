<template>
  <transition name="modal" v-if="show">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container clearfix">
          <div class="modal-header">
            <div class="header-content">
               <slot name="header" />
            </div>
            <span class="modal-close icon icon-cancel" @click="close"></span>
          </div>
          <div class="modal-body">
            <slot name="body" />
          </div>
          <div class="modal-footer clearfix">
              <span class="link-button" @click="close">Cancel</span>
              <button class="btn btn-default" @click="confirm">Confirm</button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script src="./ConfirmModal.ts" lang="ts"></script>
<style src="./ConfirmModal.scss" lang="scss" scoped></style>
