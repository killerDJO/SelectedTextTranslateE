<script setup lang="ts">
import AppError from './app-error/app-error.vue';
import { useGlobalErrorsStore } from './global-errors.store';

const globalErrors = useGlobalErrorsStore();
</script>

<template>
  <div v-if="globalErrors.errors.length" class="errors-holder">
    <app-error
      v-for="error in globalErrors.errors"
      :key="error.id"
      :message="error.message"
      :error="error.error"
      :dismissible="true"
      @dismiss="globalErrors.dismissError(error.id)"
    >
    </app-error>
  </div>
</template>

<style src="./global-errors.scss" lang="scss" scoped></style>
