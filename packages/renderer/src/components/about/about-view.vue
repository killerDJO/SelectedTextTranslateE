<script setup lang="ts">
import { onMounted } from 'vue';

import { useAboutStore } from './about.store';

const aboutStore = useAboutStore();

onMounted(() => aboutStore.setup());
</script>
<template>
  <div v-if="aboutStore.info" class="about">
    <p class="about-title">
      {{ aboutStore.info.name }} v<span class="version">{{ aboutStore.info.version }}</span>
    </p>
    <div class="actions">
      <app-button
        text="Check for Updates"
        :primary="false"
        @click="aboutStore.checkForUpdates()"
      ></app-button>
      <link-button :text="'Home Page'" @click="aboutStore.openHomePage()" />
    </div>
  </div>
</template>

<style src="./about-view.scss" lang="scss" scoped></style>
