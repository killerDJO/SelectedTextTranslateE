<template>
  <div class="main" :style="accentStyle">
    <div class="scroll-holder">
      <router-view class="view" :style="scaleStyle"></router-view>
    </div>
  </div>
</template>

 <script src="./App.ts" lang="ts"></script>
 <style src="./App.scss" lang="scss"></style>
