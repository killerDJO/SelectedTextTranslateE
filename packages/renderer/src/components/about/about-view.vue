<script setup lang="ts">
import { onMounted } from 'vue';

import { useAboutStore } from './about.store';

const about = useAboutStore();

onMounted(() => about.setup());
</script>
<template>
  <div v-if="about.info" class="about">
    <p class="about-title">
      {{ about.info.name }} v<span class="version">{{ about.info.version }}</span>
    </p>
    <div class="actions">
      <app-button
        text="Check for Updates"
        :primary="false"
        @click="about.checkForUpdates()"
      ></app-button>
      <link-button :text="'Home Page'" @click="about.openHomePage()" />
    </div>
  </div>
</template>

<style src="./about-view.scss" lang="scss" scoped></style>
