<template>
  <drop-button
        :text="text"
        :tab-index="tabIndex"
        :items="items"
        :overflow-position="overflowPosition"
        :preferred-position="preferredPosition"
        :close-blocked="closeBlocked"
        @click="click"
        @item-click="itemClick"
        ref="dropButton">
    <div class="drop-item-value" slot-scope="slotProps" @click.prevent>
      <checkbox v-model="slotProps.item.isChecked" :label="slotProps.item.text" :tab-index="-1" :disabled="slotProps.item.isDisabled"/><slot :item="slotProps.item"/>
    </div>
  </drop-button>
</template>

<script src="./DropCheckButton.ts" lang="ts"></script>
<style src="./DropCheckButton.scss" lang="scss" scoped></style>