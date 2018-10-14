<template>
  <div class="password">
    <input type="password" class="form-control" placeholder="Password" v-model="value$" v-show="!showPassword">
    <input type="text" class="form-control" placeholder="Password" v-model="value$" v-show="showPassword">
    <i class="icon icon-eye reveal-icon" @mousedown="showPassword = true" @mouseup="showPassword = false"/>
  </div>
</template>

<script src="./Password.ts" lang="ts"></script>
<style src="./Password.scss" lang="scss" scoped></style>