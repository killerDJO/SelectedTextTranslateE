<template>
  <div class="checkbox" :class="{'disabled': disabled }">
      <label tabindex="-1">
        <span v-if="leftToRight">{{label}}</span>
        <span v-tab-index="tabIndex" class="input-wrapper" @click.prevent.stop="onClick"><input type="checkbox" class="form-checkbox" v-model="isChecked$" tabindex="-1" :disabled="disabled"></span>
        <span v-if="!leftToRight">{{label}}</span>
      </label>
    </div>
</template>

<script src="./Checkbox.ts" lang="ts"></script>
<style src="./Checkbox.scss" lang="scss" scoped></style>