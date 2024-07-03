<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  confirmText?: string;
}
withDefaults(defineProps<Props>(), {
  confirmText: 'Confirm'
});

const $emit = defineEmits<{
  (e: 'confirm'): void;
}>();

const isVisible = ref(false);

function confirm() {
  $emit('confirm');
  isVisible.value = false;
}

defineExpose({
  open: () => (isVisible.value = true)
});
</script>

<template>
  <app-modal v-model:show="isVisible">
    <template #header><slot name="header" /></template>
    <template #body
      ><div class="confirm-modal-body"><slot name="body" /></div>
      <div class="confirm-modal-footer clearfix">
        <link-button v-auto-focus :text="'Cancel'" class="cancel" @click="isVisible = false" />
        <app-button :text="confirmText" @click="confirm()" />
      </div>
    </template>
  </app-modal>
</template>

<style src="./confirm-modal.scss" lang="scss" scoped></style>
