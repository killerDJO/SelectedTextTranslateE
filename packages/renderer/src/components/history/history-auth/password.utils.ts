import { required, helpers, minLength } from '@vuelidate/validators';
import type { ValidatorFn } from '@vuelidate/core';

export const PASSWORD_TOO_WEAK_MESSAGE = 'Password is too weak.';

type PasswordState = { password: string; passwordConfirmation: string };
const MIN_PASSWORD_CHARACTERS = 6;

const passwordConfirmationValidator: ValidatorFn<string, PasswordState> = (value, siblings) => {
  if (value) {
    return value == siblings.password;
  }
  return true;
};

export const passwordValidators = () => ({
  password: {
    required: helpers.withMessage('Password must not be empty.', required),
    minLength: helpers.withMessage(
      `${PASSWORD_TOO_WEAK_MESSAGE} It should have at least ${MIN_PASSWORD_CHARACTERS} characters.`,
      minLength(MIN_PASSWORD_CHARACTERS)
    )
  },
  passwordConfirmation: {
    required: helpers.withMessage('Password confirmation must not be empty.', required),
    sameAsPassword: helpers.withMessage(
      'Password and password confirmation must be equal.',
      passwordConfirmationValidator
    )
  }
});
