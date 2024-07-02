<script setup lang="ts">
import { onMounted } from 'vue';

import { useAboutStore } from './about.store';

const about = useAboutStore();

onMounted(() => about.setup());
</script>
<template>
  <div v-if="about.version" class="about">
    <p class="about-title">
      Selected Text Translate v<span class="version">{{ about.version }}</span>
    </p>
    <p>Utility to translate selected text.</p>
    <div class="actions">
      <app-button
        class="check-button"
        :text="!about.isCheckInProgress ? 'Check for Updates' : 'Checking...'"
        :primary="true"
        :disabled="about.isCheckInProgress"
        @click="about.checkForUpdates()"
      ></app-button>
      <link-button :text="'Home Page'" @click="about.openHomePage()" />
    </div>
  </div>
  <app-loader v-if="!about.version" :large="true"></app-loader>
</template>

<style src="./about-view.scss" lang="scss" scoped></style>
