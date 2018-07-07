<template>
  <div class="main" :style="{ 'border-color': '#' + this.accentColor }" >
    <div class="header"  :style="{ 'background-color': '#' + this.accentColor }" />
    <div class="scroll-holder">
      <router-view class="view" :style="{ 'zoom': this.scaleFactor * 100 + '%' }"></router-view>
    </div>
  </div>
</template>

<script src="./App.ts" lang="ts"></script>
<style src="../../framework/common.scss" lang="scss"></style>
<style src="./App.scss" lang="scss" scoped></style>