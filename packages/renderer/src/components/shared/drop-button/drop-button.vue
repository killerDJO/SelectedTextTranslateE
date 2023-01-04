<script setup lang="ts">
import { ref } from 'vue';
import type { Placement } from '@popperjs/core';

import { useDrop } from '../use-drop';

export interface DropItem {
  readonly text: string;
}

interface Props {
  items: DropItem[];
  tabIndex?: number;
  text: string;
  placement?: Placement;
  splitButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  tabIndex: 0,
  placement: 'bottom-end',
  splitButton: true
});

defineEmits<{
  (e: 'click'): void;
  (e: 'item-click', item: DropItem): void;
}>();

const baseDrop = useDrop();

const dropTarget = ref<HTMLElement>();
const dropContent = ref<HTMLElement>();

function closeDrop(): void {
  baseDrop.closeDrop();
}

function openDrop(): void {
  baseDrop.openDropInternal(
    dropTarget.value as HTMLElement,
    dropContent.value as HTMLElement,
    props.placement,
    []
  );
}

function toggleDrop() {
  if (baseDrop.isDropVisible.value) {
    closeDrop();
  } else {
    openDrop();
  }
}

defineExpose({
  isDropVisible: baseDrop.isDropVisible,
  closeDrop: () => baseDrop.closeDrop(),
  openDrop: openDrop
});
</script>

<template>
  <div ref="dropTarget" v-click-outside="closeDrop" class="drop-wrapper">
    <template v-if="splitButton">
      <div
        class="drop-button"
        :tabindex="tabIndex"
        @click="$emit('click')"
        @keyup.enter="$emit('click')"
      >
        {{ text }}
      </div>

      <div class="drop-trigger">
        <icon-button
          v-if="!baseDrop.isDropVisible.value"
          :title="'Show Options'"
          class="drop-icon"
          @click="openDrop()"
        >
          <font-awesome-icon icon="chevron-down" size="xs" />
        </icon-button>
        <icon-button v-else :title="'Hide Options'" class="drop-icon" @click="closeDrop()">
          <font-awesome-icon icon="chevron-up" size="xs" />
        </icon-button>
      </div>
    </template>
    <template v-else>
      <div
        class="drop-button split"
        :tabindex="tabIndex"
        @click.stop="toggleDrop()"
        @keyup.enter.stop="toggleDrop()"
      >
        {{ text }}
        <font-awesome-icon
          v-if="!baseDrop.isDropVisible.value"
          icon="chevron-down"
          size="xs"
          class="split-icon"
        />
        <font-awesome-icon v-else icon="chevron-up" size="xs" class="split-icon" />
      </div>
    </template>
    <div v-show="baseDrop.isDropContentVisible.value" ref="dropContent" class="drop-content">
      <ul class="drop-items">
        <li
          v-for="item in items"
          :key="item.text"
          class="drop-item"
          tabindex="0"
          @keyup.enter="$emit('item-click', item)"
          @click="$emit('item-click', item)"
        >
          <slot :item="item">
            {{ item.text }}
          </slot>
        </li>
      </ul>
    </div>
  </div>
</template>

<style src="./drop-button.scss" lang="scss" scoped></style>
