<template>
   <span v-tab-index="tabIndex" @click.stop.prevent="click" class="icon-wrapper" :class="{'disabled': disabled}">
      <span @click.stop.prevent="click" :title="title" tabindex="-1" class="icon-holder">
        <slot />
      </span>
    </span>
</template>

<script src="./IconButton.ts" lang="ts"></script>
<style src="./IconButton.scss" lang="scss" scoped></style>