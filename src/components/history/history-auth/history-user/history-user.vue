<script setup lang="ts">
import { useHistoryAuthStore } from '~/components/history/history-auth/history-auth.store';

const historyAuth = useHistoryAuthStore();
</script>

<template>
  <div class="history-auth">
    <app-button :text="'Sign Out'" :primary="false" @click="historyAuth.signOut()"></app-button>

    <span v-if="historyAuth.account" class="user-label"
      >Signed in as {{ historyAuth.account.email }}</span
    >
  </div>
</template>

<style src="./history-user.scss" lang="scss" scoped></style>
