<script setup lang="ts">
import type { Placement } from '@popperjs/core';
import { ref } from 'vue';

import type { DropItem } from '~/components/shared/drop-button/drop-button.vue';
import DropButton from '~/components/shared/drop-button/drop-button.vue';

export interface DropListItem extends DropItem {
  text: string;
  callback(): void;
}

interface Props {
  items: DropListItem[];
  tabIndex?: number;
  text: string;
  placement?: Placement;
}

withDefaults(defineProps<Props>(), {
  tabIndex: 0,
  placement: 'bottom-end'
});

defineEmits<{
  (e: 'click'): void;
}>();

const dropButton = ref<InstanceType<typeof DropButton> | null>(null);

function itemClick(item: DropListItem) {
  item.callback();
  dropButton.value!.closeDrop();
}
</script>
<template>
  <drop-button
    ref="dropButton"
    v-slot="{ item }"
    :text="text"
    :items="items"
    :tab-index="tabIndex"
    :placement="placement"
    @click="$emit('click')"
    @item-click="item => itemClick((item as DropListItem))"
  >
    <div class="drop-item-value" tabindex="-1">
      {{ item.text }}
    </div>
  </drop-button>
</template>

<style src="./drop-list-button.scss" lang="scss" scoped></style>
