<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useSlots, watch } from 'vue';

interface Props {
  show: boolean;
  isActionInProgress?: boolean;
}

onMounted(() => {
  document.body.addEventListener('keyup', handleEscape);
});
onBeforeUnmount(() => {
  document.body.removeEventListener('keyup', handleEscape);
});

const props = withDefaults(defineProps<Props>(), {
  isActionInProgress: false
});

const $emit = defineEmits<{
  (e: 'update:show', show: false): void;
}>();

const slots = useSlots();

const container = ref<HTMLElement | null>(null);

watch(container, () => {
  // Steal focus inside modal window.
  if (container.value) {
    container.value.tabIndex = 0;
    container.value.focus();
    container.value.tabIndex = -1;
    container.value.blur();
  }
});

const showFooter = computed(() => {
  return !!slots.footer?.length;
});

function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.show) {
    close();
  }
}

function close(): void {
  if (!props.isActionInProgress) {
    $emit('update:show', false);
  }
}
</script>

<template>
  <transition v-if="show" name="modal">
    <div class="modal-mask" @keyup.esc="close">
      <div v-tab-guard />
      <div class="modal-wrapper">
        <div ref="container" class="modal-container clearfix">
          <div class="modal-header">
            <div class="header-content">
              <slot name="header" />
            </div>
            <icon-button :title="'Close'" @click="close">
              <font-awesome-icon icon="xmark" class="close-icon" />
            </icon-button>
          </div>
          <div class="modal-body">
            <slot name="body" />
          </div>
          <div v-if="showFooter" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
      <div v-tab-guard />
    </div>
  </transition>
</template>

<style src="./app-modal.scss" lang="scss" scoped></style>
