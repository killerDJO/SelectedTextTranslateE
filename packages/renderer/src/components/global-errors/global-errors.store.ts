import { defineStore } from 'pinia';

import { logger } from '~/services/logger';

interface AppErrorState {
  errors: ErrorDetails[];
}

let idSequence = 0;

interface ErrorDetails {
  id: number;
  error?: unknown;
  message: string;
}

export const useGlobalErrorsStore = defineStore('global-errors', {
  state: () => {
    const state: AppErrorState = {
      errors: []
    };
    return state;
  },
  getters: {},
  actions: {
    addError(message: string, error?: unknown) {
      this.errors.push({ id: idSequence++, error, message });
      logger.error(error, message);
    },
    dismissError(id: number) {
      this.errors = this.errors.filter(error => error.id !== id);
    }
  }
});
