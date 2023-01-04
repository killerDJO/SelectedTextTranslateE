import { computed, onBeforeUnmount, ref } from 'vue';
import { createPopper } from '@popperjs/core';
import type { Placement, Modifier, Instance as PopperInstance } from '@popperjs/core';

export function useDrop() {
  const drop = ref<PopperInstance | null>(null);
  const isDropContentVisible = ref(false);

  const isDropVisible = computed(() => drop.value !== null);

  onBeforeUnmount(() => closeDrop());

  function openDropInternal(
    dropTarget: HTMLElement,
    dropContent: HTMLElement,
    placement: Placement,
    modifiers: Modifier<any, any>[]
  ): void {
    isDropContentVisible.value = true;
    drop.value = createPopper(dropTarget, dropContent, {
      placement: placement,
      strategy: 'absolute',
      modifiers: [
        {
          name: 'computeStyle',
          options: {
            gpuAcceleration: false
          }
        },
        {
          name: 'preventOverflow',
          options: {
            boundary: document.querySelector('.view') as Element
          }
        },
        ...modifiers
      ]
    });
  }

  function closeDrop(): void {
    isDropContentVisible.value = false;
    if (drop.value !== null) {
      drop.value.destroy();
      drop.value = null;
    }
  }

  return {
    isDropContentVisible,
    isDropVisible,
    openDropInternal,
    closeDrop
  };
}
