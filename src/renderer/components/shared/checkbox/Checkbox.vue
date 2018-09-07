<template>
  <div class="checkbox">
      <label>
        <span v-if="leftToRight">{{label}}</span><input type="checkbox" class="form-checkbox" v-model="isChecked$" v-tab-index><span v-if="!leftToRight">{{label}}</span>
      </label>
    </div>
</template>

<script src="./Checkbox.ts" lang="ts"></script>
<style src="./Checkbox.scss" lang="scss" scoped></style>