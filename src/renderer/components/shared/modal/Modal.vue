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
              <link-button @click="close" :text="'Cancel'" class="cancel" />
              <button class="btn btn-default" @click="confirm" v-tab-index v-auto-focus>{{confirmText}}</button>
          </div>
        </div>
      </div>
      <div v-tab-guard/>
    </div>
  </transition>
</template>

<script src="./Modal.ts" lang="ts"></script>
<style src="./Modal.scss" lang="scss" scoped></style>
