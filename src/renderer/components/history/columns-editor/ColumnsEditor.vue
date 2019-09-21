<template>
  <drop-button
        :text="'Columns'"
        :tab-index="0"
        :items="items"
        :overflow-position="overflowPosition"
        :preferred-position="preferredPosition"
        :close-blocked="closeBlocked"
        @click="toggleDrop"
        @item-click="itemClick"
        ref="dropButton">
    <div class="drop-item-value" slot-scope="{ item }">
      <checkbox v-model="item.isChecked" :label="item.text" :tab-index="-1" :disabled="item.isDisabled"/>
      <span class="order-icons">
          <icon-button :title="'Move Up'" class="move-up" @click="moveUp(item)">
            <i class="icon icon-up-dir" :class="{'disabled': !isMoveUpEnabled(item)}" />
          </icon-button>
          <icon-button :title="'Move Down'" class="move-down" @click="moveDown(item)">
            <i class="icon icon-down-dir" :class="{'disabled': !isMoveDownEnabled(item)}" />
          </icon-button>
        </span>
    </div>
  </drop-button>
</template>

<script src="./ColumnsEditor.ts" lang="ts"></script>
<style src="./ColumnsEditor.scss" lang="scss" scoped></style>
