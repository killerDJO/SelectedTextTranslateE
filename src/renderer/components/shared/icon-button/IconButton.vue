<template>
   <span v-tab-index="tabIndex" @click.stop="click" class="icon-wrapper">
      <span @click.stop="click" :title="title" tabindex="-1" class="icon-holder">
        <slot />
      </span>
    </span>
</template>

<script src="./IconButton.ts" lang="ts"></script>
<style src="./IconButton.scss" lang="scss" scoped></style>