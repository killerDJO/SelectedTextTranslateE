<template>
  <div class="drop-wrapper" ref="dropTarget" v-focus-lost="closeDrop">
    <span v-tab-index="tabIndex" @click.stop.prevent="click" class="drop-button-wrapper">
      <div class="drop-button" @click.stop.prevent="click" tabindex="-1">{{text}}</div>
    </span>

    <div class="drop-trigger">
      <icon-button v-if="!isDropVisible" @click="openDrop()" :title="'Show Options'">
        <span class="icon icon-down-open" />
      </icon-button>
      <icon-button v-else @click="closeDrop()" :title="'Hide Options'">
        <span class="icon icon-up-open" />
      </icon-button>
    </div>

    <div ref="dropContent" class="drop-content">
      <ul class="drop-items">
        <li
          class="drop-item"
          v-for="item in items"
          :key="item.text"
          v-tab-index="tabIndex"
          @click.stop.prevent="itemClick(item)">
          <slot :item="item">
            {{ item.text }}
          </slot>
        </li>
      </ul>
    </div>
  </div>
</template>

<script src="./DropButton.ts" lang="ts"></script>
<style src="./DropButton.scss" lang="scss" scoped></style>