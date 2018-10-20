<template>
  <div class="password">
    <input type="password" v-tab-index class="form-control" placeholder="Password" v-model="value$" v-show="!isPasswordVisible">
    <input type="text" v-tab-index class="form-control" placeholder="Password" v-model="value$" v-show="isPasswordVisible">
    <i class="icon icon-eye reveal-icon" @mousedown="showPassword" @mouseup="hidePassword" @mouseout="hidePassword"/>
  </div>
</template>

<script src="./Password.ts" lang="ts"></script>
<style src="./Password.scss" lang="scss" scoped></style>