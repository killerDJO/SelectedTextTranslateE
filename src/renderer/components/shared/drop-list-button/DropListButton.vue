<template>
  <drop-button
        :text="text"
        :items="items"
        :tab-index="tabIndex"
        :overflow-position="overflowPosition"
        :preferred-position="preferredPosition"
        @click="click"
        @itemClick="itemClick"
        ref="dropButton">
    <div
      slot-scope="slotProps"
      class="drop-item-value"
      @click.stop.prevent="itemClick(slotProps.item)"
      tabindex="-1">
      {{slotProps.item.text}}
      </div>
  </drop-button>
</template>

<script src="./DropListButton.ts" lang="ts"></script>
<style src="./DropListButton.scss" lang="scss" scoped></style>