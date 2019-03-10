<template>
  <drop-check-button
      :text="'Columns'"
      :items="columnDisplaySettings"
      :close-blocked="closeBlocked">
      <template slot-scope="{item}">
        <span class="order-icons">
          <icon-button :title="'Move Up'" class="move-up" @click="moveUp(item)">
            <i class="icon icon-up-dir" :class="{'disabled': !isMoveUpEnabled(item)}" />
          </icon-button>
          <icon-button :title="'Move Down'" class="move-down" @click="moveDown(item)">
            <i class="icon icon-down-dir" :class="{'disabled': !isMoveDownEnabled(item)}" />
          </icon-button>
        </span>
      </template>
  </drop-check-button>
</template>

<script src="./ColumnsEditor.ts" lang="ts"></script>
<style src="./ColumnsEditor.scss" lang="scss" scoped></style>
