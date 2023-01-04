<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import { helpers, minValue } from '@vuelidate/validators';
import { computed, reactive, watch } from 'vue';

import { executeIfValid } from '~/utils/execute-if-valid';
import { useSettingsStore } from '~/components/settings/settings.store';

const settingsStore = useSettingsStore();

const pageSize = computed(() => settingsStore.settings.views.history.renderer.pageSize);

const state = reactive({
  pageSize: pageSize.value ?? 0
});
const rules = computed(() => ({
  pageSize: {
    min: helpers.withMessage('Page size must be bigger than 0', minValue(1))
  }
}));
const v$ = useVuelidate(rules, state);

watch(
  () => pageSize.value,
  () => {
    state.pageSize = pageSize.value;
    v$.value.$reset();
  }
);

async function updateIfValid() {
  v$.value.pageSize.$touch();
  executeIfValid(v$, () => {
    settingsStore.updateSettings({
      views: { history: { renderer: { pageSize: state.pageSize } } }
    });
  });
}
</script>

<template>
  <div>
    <div class="form-group">
      <label>Number of records per page:</label>
      <validated-field :errors="v$.pageSize.$errors">
        <input
          v-model.number="state.pageSize"
          type="number"
          min="1"
          class="form-control"
          @blur="updateIfValid()"
        />
      </validated-field>
    </div>
  </div>
</template>

<style src="./history-settings.scss" lang="scss" scoped></style>
