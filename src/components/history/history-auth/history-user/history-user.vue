<script setup lang="ts">
import { ref } from 'vue';

import { useHistoryStore } from '~/components/history/history.store';
import { useHistoryAuthStore } from '~/components/history/history-auth/history-auth.store';

import ChangePassword from './change-password/change-password.vue';

const historyAuth = useHistoryAuthStore();
const history = useHistoryStore();

const changePassword = ref<InstanceType<typeof ChangePassword> | null>(null);

function signOut() {
  historyAuth.signOut();
}
</script>

<template>
  <div class="history-auth">
    <div class="drop-wrapper">
      <drop-list-button
        :text="'Sign Out'"
        :overflow-position="'start'"
        :items="[
          { text: 'Change Password', callback: () => changePassword?.open() },
          { text: 'Settings', callback: () => history.openSettings() }
        ]"
        @click="signOut()"
      />
    </div>
    <span v-if="historyAuth.account" class="user-label"
      >Signed in as {{ historyAuth.account.email }}</span
    >

    <change-password ref="changePassword"></change-password>
  </div>
</template>

<style src="./history-user.scss" lang="scss" scoped></style>
