import { defineStore } from 'pinia';

import { Logger } from '~/services/logger';

interface AppErrorState {
  errors: ErrorDetails[];
}

let idSequence = 0;

interface ErrorDetails {
  id: number;
  error?: unknown;
  message: string;
}

const logger = new Logger();

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
